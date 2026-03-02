import json
from src.control.agent.llm import llm


def jd_extractor(text):

    prompt = f"""
            You are a Job Description extractor.

            IMPORTANT RULES:
            - Extract ONLY what is explicitly mentioned.
            - If must-have or mandatory mentioned → fill must_have_skills.
            - If nice-to-have or preferred mentioned → fill nice_to_have_skills.
            - If no separation → put skills under "skills".
            - If something is not mentioned → return empty list or 0.
            - If not must is mention take it as skills

            Extract:
            1. job_name (include short description with "-")
            2. must_have_skills
            3. nice_to_have_skills
            4. skills (only if must/nice not present)
            5. years_of_experience (minimum number else 0)
            6. education (if not mentioned return empty array)(if more given add more as list)(college degree a list of string no dict no list)
            (convert it into a format if bachelor of engineering means BE, Bachelor of technology means BTech, computer science as CSE, 
            Information Technology means IT, like that change for everything Artificial intelligence and machine Learning as AI-ML adn Artificial Intelligence and Data science as AI-DS)
            7. key_resp (only if mentioned)

            Return ONLY valid JSON.

            FORMAT:
            {{
                "job_name": "",
                "must_have_skills": [],
                "nice_to_have_skills": [],
                "skills": [],
                "years_of_experience": 0,
                "education": ["degree + course" , "degree + course" ],
                "key_resp": []
            }}

            JD:
            \"\"\"{text}\"\"\"
            """

    result = llm.invoke(prompt)
    parsed = json.loads(result.content)
    print(parsed)

    return {
        "job_name": parsed.get("job_name", ""),
        "must_have_skills": parsed.get("must_have_skills", []),
        "nice_to_have_skills": parsed.get("nice_to_have_skills", []),
        "skills": parsed.get("skills", []),
        "years_of_experience": parsed.get("years_of_experience", 0),
        "education": parsed.get("education", []),
        "key_resp": parsed.get("key_resp", [])
    }