import os
import warnings

_DEFAULT_SECRET = "dev-secret-change-in-production"

SECRET_KEY: str = os.environ.get("SECRET_KEY") or _DEFAULT_SECRET
JWT_EXPIRY_MINUTES: int = int(os.environ.get("JWT_EXPIRY_MINUTES", str(60 * 24 * 7)))

if SECRET_KEY == _DEFAULT_SECRET:
    warnings.warn(
        "\n\n  *** WARNING: SECRET_KEY is not set — using insecure default. ***\n"
        "  Set the SECRET_KEY environment variable before running in production.\n",
        stacklevel=2,
    )
