"""Web and LinkedIn scraping via Firecrawl."""

import os
from typing import Optional

from logger import get_logger

log = get_logger("scraper")


async def scrape_website(url: str) -> Optional[dict]:
    """
    Scrape a company website using Firecrawl.

    Args:
        url: The company website URL to scrape

    Returns:
        Dictionary with scraped content or None if failed
    """
    api_key = os.environ.get("FIRECRAWL_API_KEY")

    if not api_key:
        log.warning("FIRECRAWL_API_KEY not set, cannot scrape website")
        return None

    try:
        from firecrawl import FirecrawlApp

        log.info(f"Scraping website | url={url}")
        app = FirecrawlApp(api_key=api_key)

        # Scrape the URL and get markdown content
        result = app.scrape_url(url, params={
            'formats': ['markdown'],
            'onlyMainContent': True
        })

        if result and result.get('markdown'):
            content = result.get('markdown', '')
            metadata = result.get('metadata', {})
            title = metadata.get('title', 'Company Website')

            log.info(f"Website scraped | url={url} | chars={len(content)} | title={title}")

            return {
                "url": url,
                "title": title,
                "content": content,
                "metadata": metadata
            }
        else:
            log.warning(f"No content returned from Firecrawl | url={url}")
            return None

    except ImportError:
        log.error("firecrawl-py not installed")
        return None
    except Exception as e:
        log.exception(f"Error scraping website: {e}")
        return None


async def scrape_linkedin(url: str) -> Optional[dict]:
    """
    Scrape a LinkedIn company profile using Firecrawl.

    Args:
        url: The LinkedIn company URL to scrape

    Returns:
        Dictionary with scraped content or None if failed
    """
    api_key = os.environ.get("FIRECRAWL_API_KEY")

    if not api_key:
        log.warning("FIRECRAWL_API_KEY not set, cannot scrape LinkedIn")
        return None

    try:
        from firecrawl import FirecrawlApp

        log.info(f"Scraping LinkedIn | url={url}")
        app = FirecrawlApp(api_key=api_key)

        # Scrape LinkedIn profile
        result = app.scrape_url(url, params={
            'formats': ['markdown'],
            'onlyMainContent': True
        })

        if result and result.get('markdown'):
            content = result.get('markdown', '')
            metadata = result.get('metadata', {})
            title = metadata.get('title', 'LinkedIn Profile')

            log.info(f"LinkedIn scraped | url={url} | chars={len(content)} | title={title}")

            return {
                "url": url,
                "title": title,
                "content": content,
                "metadata": metadata
            }
        else:
            log.warning(f"No content returned from Firecrawl | url={url}")
            return None

    except ImportError:
        log.error("firecrawl-py not installed")
        return None
    except Exception as e:
        log.exception(f"Error scraping LinkedIn: {e}")
        return None
