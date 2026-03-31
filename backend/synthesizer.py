"""Claude API integration for synthesizing one-pagers."""

import json
import os
from typing import AsyncGenerator

import anthropic

from models import OnePagerResponse
from logger import get_logger

log = get_logger("synthesizer")


SYSTEM_PROMPT = """You are an expert B2B sales research analyst. Your job is to analyze company information and generate comprehensive sales one-pagers.

Given the context about a company (from their website, LinkedIn, news, or uploaded documents), generate a structured analysis in JSON format.

Your response MUST be valid JSON with this exact structure:
{
  "company_snapshot": {
    "name": "Company Name",
    "industry": "Industry sector",
    "hq": "Headquarters location",
    "size": "Employee count or range",
    "funding_stage": "Funding stage if known",
    "tech_stack_signals": ["technology1", "technology2"]
  },
  "pain_points": [
    {
      "point": "Specific pain point",
      "source": "sourced" or "inferred",
      "evidence": "Evidence or reasoning"
    }
  ],
  "outreach_angles": [
    {
      "hook": "Opening hook for outreach",
      "reasoning": "Why this angle works"
    }
  ],
  "objections": [
    {
      "objection": "Likely objection",
      "rebuttal": "Suggested rebuttal"
    }
  ],
  "signals": [
    {
      "signal": "Recent news or signal",
      "date": "Date if known",
      "relevance": "Why this matters"
    }
  ],
  "draft_email": {
    "subject": "Email subject line",
    "body": "Full email body"
  }
}

Guidelines:
- Be specific and actionable, not generic
- For pain_points, use "sourced" if directly mentioned in the context, "inferred" if deduced
- Generate 3-5 pain points, 2-3 outreach angles, 2-3 objections
- The draft email should be concise (under 150 words) and personalized
- If information is missing, make reasonable inferences but note them as "inferred"
"""


class SynthesisResult:
    """Container for synthesis result with token usage."""
    def __init__(self):
        self.input_tokens = 0
        self.output_tokens = 0
        self.cost = 0.0


async def synthesize_one_pager(context: str, result: SynthesisResult = None) -> AsyncGenerator[str, None]:
    """
    Generate a one-pager using Claude API with streaming.

    Args:
        context: Combined context from all sources (website, LinkedIn, PDF, news)
        result: Optional SynthesisResult to store token usage

    Yields:
        JSON string chunks as they're generated
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        log.error("ANTHROPIC_API_KEY not set")
        raise ValueError("ANTHROPIC_API_KEY environment variable is required")

    client = anthropic.Anthropic(api_key=api_key)

    user_message = f"""Based on the following company information, generate a comprehensive sales one-pager.

COMPANY CONTEXT:
{context}

Generate the JSON response now:"""

    log.debug(f"Starting Claude API call | context_length={len(context)}")

    # Use streaming for real-time updates
    with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}]
    ) as stream:
        full_response = ""
        for text in stream.text_stream:
            full_response += text
            yield text

    # Get token usage after completion
    response = stream.get_final_message()
    input_tokens = response.usage.input_tokens
    output_tokens = response.usage.output_tokens

    # Cost calculation (Claude Sonnet pricing)
    input_cost = (input_tokens / 1_000_000) * 3.00
    output_cost = (output_tokens / 1_000_000) * 15.00
    total_cost = input_cost + output_cost

    # Store in result object if provided
    if result:
        result.input_tokens = input_tokens
        result.output_tokens = output_tokens
        result.cost = total_cost

    log.info(f"Claude API complete | input_tokens={input_tokens} | output_tokens={output_tokens} | cost=${total_cost:.4f}")


def parse_one_pager_response(json_str: str) -> OnePagerResponse:
    """
    Parse the JSON response from Claude into a OnePagerResponse model.

    Args:
        json_str: Raw JSON string from Claude

    Returns:
        Validated OnePagerResponse model
    """
    # Clean up the JSON string (remove markdown code blocks if present)
    cleaned = json_str.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    log.debug(f"Parsing JSON response | length={len(cleaned)}")

    data = json.loads(cleaned)
    return OnePagerResponse(**data)
