"""FastAPI application for Account Research Co-Pilot."""

import asyncio
import json
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from models import ResearchRequest, SSEEvent
from scraper import scrape_website, scrape_linkedin
from pdf_parser import parse_pdf
from enrichment import fetch_news
from synthesizer import synthesize_one_pager, parse_one_pager_response, SynthesisResult
from utils import validate_url, validate_linkedin_url, extract_company_name_from_url, truncate_text


app = FastAPI(
    title="Account Research Co-Pilot",
    description="Generate B2B sales one-pagers from company data",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def format_sse(event: str, data: dict) -> str:
    """Format data as Server-Sent Event."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/research")
async def research(
    company_url: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    company_name: Optional[str] = Form(None),
    pdf_file: Optional[UploadFile] = File(None)
):
    """
    Generate a sales one-pager from company data.

    Accepts multipart form data with at least one of:
    - company_url: Company website URL
    - linkedin_url: LinkedIn company profile URL
    - company_name: Company name for news search
    - pdf_file: PDF document with company information

    Returns Server-Sent Events stream with progress updates and final result.
    """
    # Validate at least one input provided
    has_input = any([
        company_url,
        linkedin_url,
        company_name,
        pdf_file and pdf_file.filename
    ])

    if not has_input:
        raise HTTPException(
            status_code=400,
            detail="At least one input (company URL, LinkedIn URL, company name, or PDF) is required"
        )

    # Validate URLs if provided
    if company_url and not validate_url(company_url):
        raise HTTPException(status_code=400, detail="Invalid company URL format")

    if linkedin_url and not validate_linkedin_url(linkedin_url):
        raise HTTPException(status_code=400, detail="Invalid LinkedIn URL format")

    async def event_generator():
        context_parts = []
        effective_company_name = company_name

        try:
            # Step 1: Scrape website
            yield format_sse("status", {"step": 1, "message": "Scraping company website..."})

            if company_url:
                website_data = await scrape_website(company_url)
                if website_data:
                    context_parts.append(f"## Website Content\n{website_data.get('content', '')}")
                    if not effective_company_name:
                        effective_company_name = extract_company_name_from_url(company_url)
                yield format_sse("status", {"step": 1, "message": "Website scraped", "complete": True})
            else:
                yield format_sse("status", {"step": 1, "message": "No website URL provided", "skipped": True})

            # Step 2: Scrape LinkedIn
            yield format_sse("status", {"step": 2, "message": "Scraping LinkedIn profile..."})

            if linkedin_url:
                linkedin_data = await scrape_linkedin(linkedin_url)
                if linkedin_data:
                    context_parts.append(f"## LinkedIn Profile\n{linkedin_data.get('content', '')}")
                yield format_sse("status", {"step": 2, "message": "LinkedIn scraped", "complete": True})
            else:
                yield format_sse("status", {"step": 2, "message": "No LinkedIn URL provided", "skipped": True})

            # Step 3: Parse PDF
            yield format_sse("status", {"step": 3, "message": "Processing uploaded document..."})

            if pdf_file and pdf_file.filename:
                pdf_bytes = await pdf_file.read()
                pdf_content = await parse_pdf(pdf_bytes)
                if pdf_content:
                    context_parts.append(f"## Uploaded Document\n{truncate_text(pdf_content)}")
                yield format_sse("status", {"step": 3, "message": "Document processed", "complete": True})
            else:
                yield format_sse("status", {"step": 3, "message": "No document uploaded", "skipped": True})

            # Step 4: Fetch news
            yield format_sse("status", {"step": 4, "message": "Fetching recent news..."})

            if effective_company_name:
                news_data = await fetch_news(effective_company_name)
                if news_data:
                    news_text = "\n".join([
                        f"- {item.get('title', 'News')}: {item.get('content', '')[:200]}"
                        for item in news_data[:5]
                    ])
                    context_parts.append(f"## Recent News\n{news_text}")
                yield format_sse("status", {"step": 4, "message": "News fetched", "complete": True})
            else:
                yield format_sse("status", {"step": 4, "message": "No company name for news search", "skipped": True})

            # Build full context
            if not context_parts:
                # If no external data, use company name as minimal context
                if effective_company_name:
                    context_parts.append(f"Company Name: {effective_company_name}")
                else:
                    yield format_sse("error", {"message": "No data could be gathered"})
                    return

            full_context = "\n\n".join(context_parts)

            # Step 5: Generate one-pager with Claude
            yield format_sse("status", {"step": 5, "message": "Generating one-pager with AI..."})

            full_response = ""
            synthesis_result = SynthesisResult()
            async for chunk in synthesize_one_pager(full_context, synthesis_result):
                full_response += chunk
                yield format_sse("chunk", {"text": chunk})

            # Parse and validate the response
            try:
                one_pager = parse_one_pager_response(full_response)
                yield format_sse("complete", {
                    "data": one_pager.model_dump(),
                    "tokens": {
                        "input": synthesis_result.input_tokens,
                        "output": synthesis_result.output_tokens,
                        "cost": round(synthesis_result.cost, 4)
                    }
                })
            except Exception as e:
                print(f"[Main] Error parsing response: {e}")
                # Return raw response if parsing fails
                yield format_sse("complete", {
                    "raw": full_response,
                    "parse_error": str(e),
                    "tokens": {
                        "input": synthesis_result.input_tokens,
                        "output": synthesis_result.output_tokens,
                        "cost": round(synthesis_result.cost, 4)
                    }
                })

        except Exception as e:
            print(f"[Main] Error in pipeline: {e}")
            yield format_sse("error", {"message": str(e)})

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
