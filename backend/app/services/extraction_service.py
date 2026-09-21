"""
Document text extraction service.

Supports:
- PDF  → PyMuPDF (fitz)
- DOCX → python-docx

Every page/paragraph retains its source metadata (documentId, page, section).
"""

import io
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


def extract_pdf(
    file_bytes: bytes, document_id: str, document_name: str
) -> List[Dict]:
    """
    Extract text from a PDF, one dict per page.

    Returns:
        List of {documentId, documentName, page, text}
    """
    try:
        import fitz  # PyMuPDF
    except ImportError:
        logger.error("PyMuPDF (fitz) not installed. Cannot process PDF.")
        return []

    pages = []
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text").strip()
            if text:
                pages.append(
                    {
                        "documentId": document_id,
                        "documentName": document_name,
                        "page": page_num + 1,
                        "text": text,
                    }
                )
        doc.close()
    except Exception as e:
        logger.error("PDF extraction failed for %s: %s", document_id, e)

    return pages


def get_pdf_page_count(file_bytes: bytes) -> Optional[int]:
    """Return page count for a PDF file, or None on error."""
    try:
        import fitz

        doc = fitz.open(stream=file_bytes, filetype="pdf")
        count = len(doc)
        doc.close()
        return count
    except Exception as e:
        logger.error("Could not count PDF pages: %s", e)
        return None


def extract_docx(
    file_bytes: bytes, document_id: str, document_name: str
) -> List[Dict]:
    """
    Extract text from a DOCX file.

    Returns:
        List of {documentId, documentName, page, section, text}
        (DOCX has no native page concept — we use paragraph groups as pseudo-pages)
    """
    try:
        from docx import Document
    except ImportError:
        logger.error("python-docx not installed. Cannot process DOCX.")
        return []

    pages = []
    try:
        doc = Document(io.BytesIO(file_bytes))
        current_section = "Document"
        buffer_paragraphs = []
        pseudo_page = 1

        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue

            # Detect headings as section markers
            if para.style.name.startswith("Heading"):
                # Flush current buffer as a page
                if buffer_paragraphs:
                    pages.append(
                        {
                            "documentId": document_id,
                            "documentName": document_name,
                            "page": pseudo_page,
                            "section": current_section,
                            "text": "\n".join(buffer_paragraphs),
                        }
                    )
                    pseudo_page += 1
                    buffer_paragraphs = []
                current_section = text
            else:
                buffer_paragraphs.append(text)

        # Flush remaining
        if buffer_paragraphs:
            pages.append(
                {
                    "documentId": document_id,
                    "documentName": document_name,
                    "page": pseudo_page,
                    "section": current_section,
                    "text": "\n".join(buffer_paragraphs),
                }
            )

    except Exception as e:
        logger.error("DOCX extraction failed for %s: %s", document_id, e)

    return pages


def chunk_pages(
    pages: List[Dict], chunk_size: int = 800, overlap: int = 100
) -> List[Dict]:
    """
    Split page texts into overlapping chunks for retrieval.

    Each chunk retains: documentId, documentName, page, section, chunkIndex, text.
    """
    chunks = []
    chunk_index = 0

    for page in pages:
        text = page["text"]
        words = text.split()
        start = 0

        while start < len(words):
            end = min(start + chunk_size, len(words))
            chunk_text = " ".join(words[start:end])
            chunks.append(
                {
                    "documentId": page["documentId"],
                    "documentName": page.get("documentName", ""),
                    "page": page["page"],
                    "section": page.get("section", ""),
                    "chunkIndex": chunk_index,
                    "text": chunk_text,
                    "metadata": {
                        "documentName": page.get("documentName", ""),
                    },
                }
            )
            chunk_index += 1
            if end == len(words):
                break
            start = end - overlap

    return chunks
