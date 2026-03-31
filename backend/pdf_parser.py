"""PDF text extraction using PyMuPDF."""

from typing import Optional

from logger import get_logger

log = get_logger("pdf_parser")


async def parse_pdf(file_bytes: bytes) -> Optional[str]:
    """
    Extract text from a PDF file.

    Args:
        file_bytes: Raw bytes of the PDF file

    Returns:
        Extracted text content or None if failed
    """
    try:
        import fitz  # PyMuPDF

        log.debug(f"Parsing PDF | size={len(file_bytes)} bytes")

        # Open PDF from bytes
        doc = fitz.open(stream=file_bytes, filetype="pdf")

        text_content = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if text.strip():
                text_content.append(f"--- Page {page_num + 1} ---\n{text}")

        doc.close()

        if text_content:
            result = "\n\n".join(text_content)
            log.info(f"PDF parsed | pages={len(text_content)} | chars={len(result)}")
            return result

        log.warning("PDF parsed but no text content found")
        return None

    except ImportError:
        log.error("PyMuPDF not installed")
        return None
    except Exception as e:
        log.exception(f"Error parsing PDF: {e}")
        return None
