from __future__ import annotations

import ipaddress
import re
import time
from collections import defaultdict, deque
from datetime import datetime, timezone
from urllib.parse import urlparse

from flask import Flask, jsonify, render_template, request

app = Flask(__name__, static_folder="static", template_folder="templates")

app.config.update(
    MAX_CONTENT_LENGTH=32 * 1024,
    JSON_SORT_KEYS=False,
)

# Process-local rate limiter.
# For multiple production instances, use a shared store such as Redis.
_RATE_BUCKETS: dict[str, deque[float]] = defaultdict(deque)
_RATE_WINDOW = 60.0
_RATE_LIMIT = 30

HOST_RE = re.compile(
    r"^(?=.{1,253}$)"
    r"(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+"
    r"[A-Za-z]{2,63}$"
)


def client_key() -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()

    return request.remote_addr or "unknown"


def rate_limited() -> bool:
    now = time.monotonic()
    bucket = _RATE_BUCKETS[client_key()]

    while bucket and now - bucket[0] > _RATE_WINDOW:
        bucket.popleft()

    if len(bucket) >= _RATE_LIMIT:
        return True

    bucket.append(now)
    return False


def normalize_target(value: object) -> str:
    if not isinstance(value, str):
        return ""

    return value.strip()[:253]


def classify_target(target: str) -> dict:
    """
    Local-only classification.
    No external target is contacted.
    """

    if not target:
        return {
            "valid": False,
            "type": "empty",
            "message": "Enter a domain, IP address, or URL.",
        }

    candidate = target

    if "://" in candidate:
        parsed = urlparse(candidate)
        host = parsed.hostname or ""
        scheme = parsed.scheme.lower()

        if scheme not in {"http", "https"} or not host:
            return {
                "valid": False,
                "type": "url",
                "message": "Only HTTP/HTTPS URLs are accepted.",
            }

        target = host

    try:
        ip = ipaddress.ip_address(target)

        scope = "private" if ip.is_private else "public"

        return {
            "valid": True,
            "type": "ip",
            "scope": scope,
            "message": f"Valid {scope} IP address.",
        }

    except ValueError:
        pass

    if HOST_RE.fullmatch(target.lower()):
        return {
            "valid": True,
            "type": "domain",
            "scope": "domain",
            "message": "Valid domain syntax. No network request was made.",
        }

    return {
        "valid": False,
        "type": "unknown",
        "message": (
            "Input is not a valid domain, IP address, "
            "or HTTP/HTTPS URL."
        ),
    }


@app.after_request
def security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"

    response.headers["Referrer-Policy"] = (
        "strict-origin-when-cross-origin"
    )

    response.headers["Permissions-Policy"] = (
        "camera=(self), microphone=(), geolocation=()"
    )

    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data:; "
        "connect-src 'self'; "
        "media-src 'self' blob:; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    )

    if request.is_secure:
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )

    return response


@app.before_request
def protect_api():
    if request.path.startswith("/api/") and rate_limited():
        return (
            jsonify(
                {
                    "ok": False,
                    "error": "Rate limit exceeded. Try again shortly.",
                }
            ),
            429,
        )


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/health")
def health():
    return jsonify(
        {
            "ok": True,
            "service": "MK Cyber Hub",
            "version": "2.0",
        }
    )


@app.get("/api/stats")
def stats():
    return jsonify(
        {
            "ok": True,
            "platform": {
                "modules": 8,
                "api_endpoints": 6,
                "security_profile": "hardened",
            },
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
    )


@app.get("/api/news")
def news():
    return jsonify(
        {
            "ok": True,
            "items": [
                {
                    "title": (
                        "Security updates are available through "
                        "Dependabot"
                    ),
                    "tag": "DEFENSIVE",
                },
                {
                    "title": (
                        "Keep dependencies pinned and review "
                        "changes before merge"
                    ),
                    "tag": "BEST PRACTICE",
                },
                {
                    "title": (
                        "Use least privilege and strong input "
                        "validation for public APIs"
                    ),
                    "tag": "HARDENING",
                },
            ],
        }
    )


@app.post("/api/analyze")
def analyze():
    payload = request.get_json(silent=True) or {}

    result = classify_target(
        normalize_target(payload.get("target"))
    )

    return jsonify(
        {
            "ok": True,
            "result": result,
        }
    )


@app.post("/api/osint/validate")
def osint_validate():
    payload = request.get_json(silent=True) or {}

    result = classify_target(
        normalize_target(payload.get("target"))
    )

    return jsonify(
        {
            "ok": True,
            "result": result,
            "note": (
                "Local validation only; "
                "no target was contacted."
            ),
        }
    )


@app.post("/api/security/ssl")
def ssl_check():
    payload = request.get_json(silent=True) or {}

    target = normalize_target(payload.get("target"))
    result = classify_target(target)

    if result["valid"] and result["type"] == "domain":
        return jsonify(
            {
                "ok": True,
                "result": {
                    "valid": True,
                    "message": (
                        "Domain syntax is valid. "
                        "Live TLS inspection is intentionally "
                        "disabled in this build."
                    ),
                },
            }
        )

    return jsonify(
        {
            "ok": True,
            "result": {
                "valid": False,
                "message": (
                    "Enter a valid domain for TLS inspection."
                ),
            },
        }
    )


@app.errorhandler(400)
def bad_request(_):
    return (
        jsonify(
            {
                "ok": False,
                "error": "Bad request.",
            }
        ),
        400,
    )


@app.errorhandler(404)
def not_found(_):
    if request.path.startswith("/api/"):
        return (
            jsonify(
                {
                    "ok": False,
                    "error": "Endpoint not found.",
                }
            ),
            404,
        )

    return render_template("index.html"), 404


@app.errorhandler(413)
def too_large(_):
    return (
        jsonify(
            {
                "ok": False,
                "error": "Request payload is too large.",
            }
        ),
        413,
    )


@app.errorhandler(500)
def server_error(_):
    return (
        jsonify(
            {
                "ok": False,
                "error": "Internal server error.",
            }
        ),
        500,
    )


if __name__ == "__main__":
    import os

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "5000")),
    )
