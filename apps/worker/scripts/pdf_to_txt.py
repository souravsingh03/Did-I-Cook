import os
import sys
from pathlib import Path

try:
    from PyPDF2 import PdfReader
except ImportError:
    print("PyPDF2 not found. Please install with: pip install PyPDF2")
    sys.exit(1)

try:
    import pytesseract
    from pdf2image import convert_from_path
except ImportError:
    pytesseract = None
    convert_from_path = None
    print("OCR dependencies not found. For OCR support, install with: pip install pytesseract pdf2image pillow")

def extract_text_from_pdf(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        return text.strip() if text.strip() else None
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return None

def ocr_pdf(pdf_path):
    if not (pytesseract and convert_from_path):
        print(f"OCR not available for {pdf_path}. Skipping.")
        return None
    try:
        images = convert_from_path(pdf_path)
        text = "\n".join(pytesseract.image_to_string(img) for img in images)
        return text.strip() if text.strip() else None
    except Exception as e:
        print(f"OCR failed for {pdf_path}: {e}")
        return None

def convert_pdfs_in_folder(pdf_folder, txt_folder):
    os.makedirs(txt_folder, exist_ok=True)
    for pdf_file in Path(pdf_folder).glob("*.pdf"):
        txt_file = Path(txt_folder) / (pdf_file.stem + ".txt")
        print(f"Processing {pdf_file} -> {txt_file}")
        text = extract_text_from_pdf(pdf_file)
        if not text:
            print(f"No text found in {pdf_file}, trying OCR...")
            text = ocr_pdf(pdf_file)
        if text:
            with open(txt_file, "w", encoding="utf-8") as f:
                f.write(text)
            print(f"Saved text to {txt_file}")
        else:
            print(f"Failed to extract any text from {pdf_file}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python pdf_to_txt.py <pdf_folder> <txt_folder>")
        sys.exit(1)
    convert_pdfs_in_folder(sys.argv[1], sys.argv[2])
