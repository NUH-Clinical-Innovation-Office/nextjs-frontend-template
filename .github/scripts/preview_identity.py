"""Stable, bounded preview names shared by deployment and cleanup."""

import hashlib
import os
import re


def preview_identity(repository, branch):
    def slug(value, length):
        return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")[:length].rstrip("-") or "preview"

    digest = hashlib.sha256(f"{repository}\0{branch}".encode()).hexdigest()[:12]
    repo = slug(repository.split("/")[-1], 12)
    ref = slug(branch, 12)
    suffix = f"{repo}-{ref}-{digest}"
    return {
        "NAMESPACE": f"nextjs-{suffix}",
        "RELEASE": f"nextjs-app-{suffix}",
        "HOST_LABEL": f"{ref}-dev-{repo}-{digest}",
    }


if __name__ == "__main__":
    identity = preview_identity(os.environ["GITHUB_REPOSITORY"], os.environ["PREVIEW_BRANCH"])
    with open(os.environ["GITHUB_OUTPUT"], "a") as output:
        for key, value in identity.items():
            output.write(f"{key}={value}\n")
