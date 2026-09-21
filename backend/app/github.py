"""Cached GitHub profile stats — powers the portfolio's counters.

The public GitHub API is rate-limited per IP (~60 req/hour unauthenticated), so
we cache the result in-memory for GITHUB_CACHE_TTL seconds. Optionally set a
GITHUB_TOKEN env var for a higher limit (not required).
"""
import os
import time
from typing import Dict, Optional

import httpx

from . import config

_cache: Dict[str, Optional[object]] = {"ts": 0.0, "data": None}


async def get_github_stats() -> Dict:
    now = time.time()
    if _cache["data"] is not None and now - float(_cache["ts"]) < config.GITHUB_CACHE_TTL:
        return _cache["data"]  # type: ignore[return-value]

    user = config.GITHUB_USERNAME
    headers = {"Accept": "application/vnd.github+json"}
    token = os.getenv("GITHUB_TOKEN", "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"

    async with httpx.AsyncClient(timeout=15, headers=headers) as client:
        profile_resp = await client.get(f"https://api.github.com/users/{user}")
        profile_resp.raise_for_status()
        profile = profile_resp.json()

        stars = 0
        repos_resp = await client.get(
            f"https://api.github.com/users/{user}/repos",
            params={"per_page": 100, "type": "owner", "sort": "updated"},
        )
        if repos_resp.status_code == 200:
            stars = sum(r.get("stargazers_count", 0) for r in repos_resp.json())

    data = {
        "username": user,
        "public_repos": profile.get("public_repos", 0),
        "followers": profile.get("followers", 0),
        "following": profile.get("following", 0),
        "stars": stars,
    }
    _cache["data"] = data
    _cache["ts"] = now
    return data
