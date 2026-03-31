"""Utility functions for validation and logging."""

import re
from typing import Optional
from urllib.parse import urlparse


def validate_url(url: str) -> bool:
    """
    Validate that a string is a properly formatted URL.

    Args:
        url: URL string to validate

    Returns:
        True if valid URL, False otherwise
    """
    try:
        result = urlparse(url)
        return all([result.scheme in ("http", "https"), result.netloc])
    except Exception:
        return False


def validate_linkedin_url(url: str) -> bool:
    """
    Validate that a URL is a LinkedIn company profile URL.

    Args:
        url: URL string to validate

    Returns:
        True if valid LinkedIn company URL, False otherwise
    """
    if not validate_url(url):
        return False

    parsed = urlparse(url)
    return "linkedin.com" in parsed.netloc and "/company/" in parsed.path


def extract_company_name_from_url(url: str) -> Optional[str]:
    """
    Attempt to extract a company name from a URL.

    Args:
        url: Company website URL

    Returns:
        Extracted company name or None
    """
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()

        # Remove common prefixes
        domain = re.sub(r"^(www\.|app\.|api\.)", "", domain)

        # Get the main domain name (before TLD)
        parts = domain.split(".")
        if len(parts) >= 2:
            name = parts[0]
            # Capitalize
            return name.title()

        return None
    except Exception:
        return None


def log_cost(input_tokens: int, output_tokens: int, model: str = "claude-sonnet-4-20250514") -> dict:
    """
    Calculate and log API cost.

    Args:
        input_tokens: Number of input tokens
        output_tokens: Number of output tokens
        model: Model name for pricing

    Returns:
        Dictionary with cost breakdown
    """
    # Pricing per million tokens (as of 2024)
    pricing = {
        "claude-sonnet-4-20250514": {"input": 3.00, "output": 15.00},
        "claude-3-5-sonnet-20241022": {"input": 3.00, "output": 15.00},
        "claude-3-opus-20240229": {"input": 15.00, "output": 75.00},
        "claude-3-haiku-20240307": {"input": 0.25, "output": 1.25},
    }

    rates = pricing.get(model, pricing["claude-sonnet-4-20250514"])

    input_cost = (input_tokens / 1_000_000) * rates["input"]
    output_cost = (output_tokens / 1_000_000) * rates["output"]
    total_cost = input_cost + output_cost

    cost_info = {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "input_cost": round(input_cost, 6),
        "output_cost": round(output_cost, 6),
        "total_cost": round(total_cost, 6),
        "model": model
    }

    print(f"[Cost] {model}: {input_tokens} in / {output_tokens} out = ${total_cost:.4f}")

    return cost_info


def truncate_text(text: str, max_length: int = 10000) -> str:
    """
    Truncate text to a maximum length while preserving word boundaries.

    Args:
        text: Text to truncate
        max_length: Maximum character length

    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text

    truncated = text[:max_length]
    # Find the last space to avoid cutting mid-word
    last_space = truncated.rfind(" ")
    if last_space > max_length * 0.8:
        truncated = truncated[:last_space]

    return truncated + "... [truncated]"
