"""
Text processing utilities — chunking, section detection, normalization.
"""

import re
from typing import List


def normalize_whitespace(text: str) -> str:
    """Collapse multiple spaces/newlines to single space."""
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" {2,}", " ", text)
    return text.strip()


def detect_section(text: str) -> str:
    """
    Try to detect a section header from the first line of a text block.
    Returns the section header or empty string.
    """
    first_line = text.strip().split("\n")[0].strip()
    # Simple heuristic: if the first line is short and ends with a colon, it's likely a heading
    if len(first_line) < 100 and (
        first_line.endswith(":")
        or re.match(r"^\d+\.", first_line)
        or first_line.isupper()
    ):
        return first_line
    return ""


def split_into_sentences(text: str) -> List[str]:
    """Split text into sentences (approximate)."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return [s.strip() for s in sentences if s.strip()]


def extract_numbers(text: str) -> List[int]:
    """Extract all integers from text."""
    return [int(n) for n in re.findall(r"\b\d+\b", text)]
