"""News enrichment via Tavily API (stub implementation)."""

import os
from typing import Optional


async def fetch_news(company_name: str) -> Optional[list[dict]]:
    """
    Fetch recent news about a company using Tavily API.

    Args:
        company_name: Name of the company to search for

    Returns:
        List of news items or None if failed
    """
    api_key = os.environ.get("TAVILY_API_KEY")

    if not api_key:
        print("[Enrichment] TAVILY_API_KEY not set, returning mock data")
        return [
            {
                "title": f"Recent news about {company_name}",
                "url": "https://example.com/news",
                "content": f"Mock news content about {company_name}.",
                "published_date": "2024-01-15"
            }
        ]

    # TODO: Implement actual Tavily integration
    # from tavily import TavilyClient
    # client = TavilyClient(api_key=api_key)
    # response = client.search(
    #     query=f"{company_name} company news",
    #     search_depth="advanced",
    #     max_results=5
    # )
    # return response.get("results", [])

    return [
        {
            "title": f"Recent news about {company_name}",
            "url": "https://example.com/news",
            "content": f"Mock news content about {company_name}.",
            "published_date": "2024-01-15"
        }
    ]
