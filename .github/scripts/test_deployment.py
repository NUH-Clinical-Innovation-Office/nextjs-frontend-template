import copy
import json
import os
from pathlib import Path
import subprocess
import tempfile
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from contextlib import nullcontext
from unittest.mock import patch

from preview_identity import preview_identity
import tunnel_route


ROOT = Path(__file__).resolve().parents[2]


class PreviewIdentityTest(unittest.TestCase):
    def test_repositories_and_similarly_sanitized_branches_are_isolated(self):
        cases = [
            ("org/one", "develop"), ("org/two", "develop"),
            ("other/one", "develop"), ("org/one", "feature/foo"),
            ("org/one", "feature-foo"), ("org/one", "Feature/foo"),
            ("org/" + "project" * 40, "branch" * 100),
        ]
        identities = [preview_identity(*case) for case in cases]
        for key, maximum in (("NAMESPACE", 63), ("RELEASE", 53), ("HOST_LABEL", 63)):
            self.assertEqual(len({identity[key] for identity in identities}), len(cases))
            for identity in identities:
                self.assertLessEqual(len(identity[key]), maximum)
                self.assertRegex(identity[key], r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
        self.assertEqual(preview_identity(*cases[0]), identities[0])


class VaultSetupTest(unittest.TestCase):
    def test_setup_can_generate_and_write_secrets_to_expected_logical_paths(self):
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            vault = directory / "vault"
            vault.write_text('''#!/bin/sh
if [ "$1" = kv ] && [ "$2" = put ]; then
  printf '%s\\n' "$3" >> "$VAULT_TEST_LOG"
fi
''')
            vault.chmod(0o755)
            openssl = directory / "openssl"
            openssl.write_text("#!/bin/sh\nprintf 'generated-fixture\\n'\n")
            openssl.chmod(0o755)
            log = directory / "paths"
            result = subprocess.run(
                ["bash", str(ROOT / "docs/scripts/setup-vault-environments.sh")],
                input="https://fixture.test\n\nfixture-db\nhttps://api.fixture.test\n" * 3,
                text=True, capture_output=True,
                env={**os.environ, "PATH": f"{directory}:{os.environ['PATH']}",
                     "VAULT_TOKEN": "fixture-token", "VAULT_TEST_LOG": str(log)},
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(log.read_text().splitlines(), [
                f"secret/nextjs-frontend-template/{environment}"
                for environment in ("development", "staging", "production")
            ])


class TunnelRouteTest(unittest.TestCase):
    def setUp(self):
        self.config = {
            "originRequest": {"connectTimeout": 30},
            "warp-routing": {"enabled": True},
            "ingress": [
                {"hostname": "remove.test", "service": "http://localhost:30001"},
                {"hostname": "keep.test", "service": "http://localhost:30002"},
                {"service": "http_status:503"},
            ],
        }

    def test_update_preserves_unrelated_routes_options_and_catchall(self):
        updated = tunnel_route.update_config(self.config, "new.test", "http://localhost:30003")
        self.assertEqual(updated["originRequest"], self.config["originRequest"])
        self.assertEqual(updated["warp-routing"], self.config["warp-routing"])
        self.assertEqual(updated["ingress"][-1], {"service": "http_status:503"})
        self.assertEqual(len(self.config["ingress"]), 3)
        self.assertEqual(len(updated["ingress"]), 4)

    def run_concurrent_updates(self, locked):
        mutex = threading.Lock()
        barrier = threading.Barrier(2)
        state = {"config": copy.deepcopy(self.config), "held": False}

        def kubectl(command, **kwargs):
            with mutex:
                if command[1] == "create":
                    if state["held"]:
                        return subprocess.CompletedProcess(command, 1, stderr="AlreadyExists")
                    state["held"] = True
                else:
                    state["held"] = False
                return subprocess.CompletedProcess(command, 0)

        def request(_url, _token, payload=None):
            if payload is None:
                with mutex:
                    snapshot = copy.deepcopy(state["config"])
                if not locked:
                    barrier.wait(timeout=5)
                return {"config": snapshot}
            with mutex:
                state["config"] = payload["config"]
            return {}

        lock = tunnel_route.tunnel_lock if locked else lambda *_args: nullcontext()
        with patch.object(tunnel_route.subprocess, "run", side_effect=kubectl), \
             patch.object(tunnel_route, "cloudflare_request", side_effect=request), \
             patch.object(tunnel_route, "tunnel_lock", side_effect=lock):
            with ThreadPoolExecutor(max_workers=2) as pool:
                add = pool.submit(tunnel_route.update_route, "account", "tunnel", "token", "new.test", "http://localhost:30003")
                remove = pool.submit(tunnel_route.update_route, "account", "tunnel", "token", "remove.test")
                add.result(timeout=10)
                remove.result(timeout=10)
        return {rule.get("hostname") for rule in state["config"]["ingress"] if rule.get("hostname")}

    def test_unlocked_read_modify_write_loses_a_concurrent_change(self):
        self.assertNotEqual(self.run_concurrent_updates(False), {"keep.test", "new.test"})

    def test_shared_lock_preserves_concurrent_add_and_remove(self):
        self.assertEqual(self.run_concurrent_updates(True), {"keep.test", "new.test"})

    def test_uncertain_update_retains_lock_instead_of_admitting_another_writer(self):
        with patch.object(tunnel_route.subprocess, "run", return_value=subprocess.CompletedProcess([], 0)) as run:
            with self.assertRaisesRegex(RuntimeError, "uncertain"):
                with tunnel_route.tunnel_lock("account", "tunnel"):
                    raise RuntimeError("uncertain write outcome")
            self.assertEqual(run.call_count, 1)

    def test_lock_contention_times_out_without_writing_or_deleting(self):
        with patch.object(tunnel_route.subprocess, "run", return_value=subprocess.CompletedProcess([], 1, stderr="AlreadyExists")) as run:
            with self.assertRaises(TimeoutError):
                with tunnel_route.tunnel_lock("account", "tunnel", timeout=0):
                    self.fail("acquired an existing lock")
            self.assertEqual(run.call_count, 1)


if __name__ == "__main__":
    unittest.main()
