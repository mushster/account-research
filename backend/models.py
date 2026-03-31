"""Pydantic models for Account Research Co-Pilot."""

from typing import Literal, Optional
from pydantic import BaseModel, Field


class ResearchRequest(BaseModel):
    """Input request for research generation."""
    company_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    company_name: Optional[str] = None
    pdf_content: Optional[str] = None


class CompanySnapshot(BaseModel):
    """Basic company information."""
    name: str
    industry: Optional[str] = None
    hq: Optional[str] = None
    size: Optional[str] = None
    funding_stage: Optional[str] = None
    tech_stack_signals: list[str] = Field(default_factory=list)


class PainPoint(BaseModel):
    """Identified pain point with source attribution."""
    point: str
    source: Literal["inferred", "sourced"]
    evidence: Optional[str] = None


class OutreachAngle(BaseModel):
    """Suggested outreach approach."""
    hook: str
    reasoning: str


class Objection(BaseModel):
    """Potential objection with rebuttal."""
    objection: str
    rebuttal: str


class Signal(BaseModel):
    """Recent company signal or news."""
    signal: str
    date: Optional[str] = None
    relevance: Optional[str] = None


class DraftEmail(BaseModel):
    """Generated outreach email draft."""
    subject: str
    body: str


class OnePagerResponse(BaseModel):
    """Complete one-pager response with all sections."""
    company_snapshot: CompanySnapshot
    pain_points: list[PainPoint] = Field(default_factory=list)
    outreach_angles: list[OutreachAngle] = Field(default_factory=list)
    objections: list[Objection] = Field(default_factory=list)
    signals: list[Signal] = Field(default_factory=list)
    draft_email: Optional[DraftEmail] = None


class SSEEvent(BaseModel):
    """Server-sent event for streaming updates."""
    event: Literal["status", "section", "complete", "error"]
    data: dict
