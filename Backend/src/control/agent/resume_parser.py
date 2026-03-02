import pdfplumber
from pdfplumber.utils.exceptions import PdfminerException

def resume_parser(file_path):
    text = ""
    try:
        with pdfplumber.open(file_path) as file:
            print(f"{file_path} --------------------------------------------")
            for page in file.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text
    except PdfminerException:
        return ""
    return text
