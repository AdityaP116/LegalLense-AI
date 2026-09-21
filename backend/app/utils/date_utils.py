"""
Date utilities — ISO parsing, uncertain date handling.
"""

import re
from datetime import datetime, timezone
from typing import Optional

DATE_FORMATS = [
    "%Y-%m-%d",
    "%d %B %Y",
    "%B %d, %Y",
    "%d/%m/%Y",
    "%m/%d/%Y",
    "%d-%m-%Y",
]


def parse_date(date_str: str) -> Optional[str]:
    """
    Try to parse a date string into ISO format.
    Returns ISO date string or None if parsing fails.
    """
    if not date_str:
        return None

    date_str = date_str.strip()

    # Already ISO
    if re.match(r"^\d{4}-\d{2}-\d{2}$", date_str):
        return date_str

    for fmt in DATE_FORMATS:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue

    return None


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
