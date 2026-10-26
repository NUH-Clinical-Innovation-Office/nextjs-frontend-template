"""Update one route under a cluster-wide lock, preserving other tunnel settings."""

import copy
import hashlib
import json
import os
import signal
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request
from contextlib import contextmanager


def update_config(config, hostname, service=None):
    updated = copy.deepcopy(config)
    ingress = [rule for rule in updated.get("ingress", []) if rule.get("hostname") != hostname]
    catchall = next(
        (index for index, rule in enumerate(ingress) if not rule.get("hostname") and not rule.get("path")),
        len(ingress),
    )
    if catchall == len(ingress):
        ingress.append({"service": "http_status:404"})
    if service is not None:
        ingress.insert(catchall, {"hostname": hostname, "service": service})
    updated["ingress"] = ingress
    return updated


@contextmanager
def tunnel_lock(account, tunnel, timeout=180):
    digest = hashlib.sha256(f"{account}/{tunnel}".encode()).hexdigest()[:24]
    name = f"cloudflare-tunnel-lock-{digest}"
    manifest = {
        "apiVersion": "v1",
        "kind": "ConfigMap",
        "metadata": {"name": name, "namespace": "default"},
        "data": {
            "run": f"{os.environ.get('GITHUB_REPOSITORY', 'local')}/{os.environ.get('GITHUB_RUN_ID', 'local')}",
        },
    }
    deadline = time.monotonic() + timeout
    while True:
        result = subprocess.run(
            ["kubectl", "create", "-f", "-", "--request-timeout=15s"],
            input=json.dumps(manifest), text=True, capture_output=True, timeout=20,
        )
        if result.returncode == 0:
            break
        if "AlreadyExists" not in result.stderr:
            raise RuntimeError("Could not acquire the tunnel lock. Check ConfigMap permissions.")
        if time.monotonic() >= deadline:
            raise TimeoutError(f"Tunnel lock {name} is held. Check its run before recovering it.")
        time.sleep(1)

    # Never expire or steal a lock. A paused writer or an uncertain HTTP outcome
    # could otherwise overwrite the next writer. Failed runs require recovery.
    try:
        yield
    except BaseException:
        print(f"Retaining tunnel lock {name}. Verify the owning run has stopped before recovery.")
        raise
    else:
        subprocess.run(
            ["kubectl", "delete", "configmap", name, "-n", "default", "--request-timeout=15s"],
            check=True, capture_output=True, text=True, timeout=20,
        )


def cloudflare_request(url, token, payload=None):
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="PUT" if payload is not None else "GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"Cloudflare request failed with HTTP {error.code}") from None
    except urllib.error.URLError:
        raise RuntimeError("Cloudflare request failed. Check connectivity.") from None
    if result.get("success") is not True:
        raise RuntimeError("Cloudflare rejected the tunnel configuration request.")
    return result["result"]


def update_route(account, tunnel, token, hostname, service=None):
    url = (
        "https://api.cloudflare.com/client/v4/accounts/"
        f"{urllib.parse.quote(account, safe='')}/cfd_tunnel/"
        f"{urllib.parse.quote(tunnel, safe='')}/configurations"
    )
    with tunnel_lock(account, tunnel):
        current = cloudflare_request(url, token)["config"]
        updated = update_config(current, hostname, service)
        cloudflare_request(url, token, {"config": updated})


if __name__ == "__main__":
    def terminate(_signal, _frame):
        raise SystemExit("Tunnel update interrupted")

    signal.signal(signal.SIGTERM, terminate)
    update_route(
        os.environ["CLOUDFLARE_ACCOUNT_ID"],
        os.environ["CLOUDFLARE_TUNNEL_ID"],
        os.environ["CLOUDFLARE_API_TOKEN"],
        os.environ["TUNNEL_HOSTNAME"],
        os.environ.get("TUNNEL_SERVICE"),
    )
