import json
import re
from src.control.agent.llm import llm


def resume_extractor(text):

    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    phone_match = re.search(r'(\+?\d{10,13})', text)

    prompt = f"""
            You are a resume extractor.

            Extract:
            1. name
            2. skills (technical only)
            3. education (degree + course) (only one college degree a single string no dict no list)(convert it into a format if bachelor of engineering
            means BE, Bachelor of technology means BTech, computer science as CSE, Information Technology means IT, like that change for everything
            Artificial intelligence and machine Learning as AI-ML adn Artificial Intelligence and Data science as AI-DS)
            4. experience:(if there are more add them in the array of same format)
                - role
                - year_of_experience
                - start_year
                - end_year
            5. key_resp - key responsibilities

            If something not available return empty.

            Return valid JSON only.

            output format:

            {{
                "name": "",
                "skills: [],
                "education: "",
                "experience" : [
                    "role" : "",
                    "year_of_experience" : 0,
                    "start_year" : 2000,
                    "end_year" : 2003
                ]
                "key_resp" : []
            }}

            Resume:
            \"\"\"{text}\"\"\"
            """

    result = llm.invoke(prompt)
    raw_output = result.content

    default_response = {
        "name": "",
        "email": email_match.group(0) if email_match else None,
        "phone": phone_match.group(0) if phone_match else None,
        "skills": [],
        "education": "",
        "experience": [],
        "key_resp": []
    }

    if not raw_output or not raw_output.strip():
        return default_response

    raw_output = raw_output.strip()

    if raw_output.startswith("```"):
        raw_output = raw_output.split("```")[1]

    try:
        parsed = json.loads(raw_output)

        parsed.setdefault("name", "")
        parsed.setdefault("skills", [])
        parsed.setdefault("education", "")
        parsed.setdefault("experience", [])
        parsed.setdefault("key_resp", [])

        parsed["email"] = email_match.group(0) if email_match else None
        parsed["phone"] = phone_match.group(0) if phone_match else None
        
        print(parsed)

        return parsed  # ✅ THIS WAS MISSING

    except Exception:
        return default_response