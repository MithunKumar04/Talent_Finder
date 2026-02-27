from pathlib import Path
from pdfplumber.utils.exceptions import PdfminerException
from src.control.agents.llm import llm
import json
import re

def resume_extractor(text):

    match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    email = match.group(0) if match else None
    
    match = re.search(r'(\+91[\-\s]?)?\d{10}', text)
    phone = match.group(0) if match else None
                    
    prompt = f"""
                You are a resume information extractor.

                Extract the following:
                1. Full name
                2. Skills (list only technical skills or tools not the concepts or roles normalize them in a standard way)
                3. Education history (Only for university or college not needed for schools):
                    - degree + course
                4. Work experience:(only in experience section and dont consider internships just give role as fresher and years of experience 0 for this work experience if no dates are given just leave it as empty string then if no experience is there just put as fresher )
                    - role(if we have same add them combine and have exp in total years and end date as recent among the merged and give some description with a - eg backend developer - build restapi using fastapi dont give a separate key description) 
                    - years of experience
                    - start date(only year)
                    - end date(only year) if given as present return 2025
                output format:
            {{
                    "name" : "",
                    "skills" : [],
                    "education: "degree+course"
                    "work_experience" :[{{
                        "role" : "",
                        "year_of_experience" : 0
                        "start_year": 2000
                        "end_year": 2001
                    }}]
                }}
                Return ONLY valid JSON.
                Give me without markdown wrapped
                Resume text:
                \"\"\"{text}\"\"\"

            """
    print("hi")
    result = llm.invoke(prompt)
    raw_output = result.content
    print(repr(raw_output))
    parsed_output = json.loads(raw_output)
    
    print (result.content)

    
    final_output = {
    "name": parsed_output["name"],
    "email": email,
    "phone": phone,
    "skills": parsed_output["skills"],
    "education": parsed_output["education"],
    "experience": parsed_output["work_experience"]
    }
    return final_output
