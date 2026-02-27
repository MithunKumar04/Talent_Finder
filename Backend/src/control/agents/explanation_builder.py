import json
from langchain_core.messages import HumanMessage, SystemMessage
from src.control.agents.llm import llm


def build_prompt(jd_values, resume_values, score_result):
    payload = {
        "job_requirements": {
            "skills": jd_values["skills"],
            "required_experience_years": jd_values["year"]
        },
        "candidate_profile": {
            "skills": resume_values["skills"],
            "experience": resume_values["role"]
        },
        "scoring_breakdown": score_result
    }

    return f"""
            You are an ATS explanation engine.

            STRICT RULES:
            - Do NOT invent skills or experience.
            - Do NOT modify scores.
            - Use ONLY the provided data.
            - Output valid JSON only.

            JSON FORMAT:
            {{
            "summary": "...",
            "skills_explanation": "...",
            "experience_explanation": "...",
            "education_explanation": "...",
            "final_justification": "..."
            }}

            DATA:
            {json.dumps(payload, indent=2)}
            """


def build_candidate_explanation_llm(jd_values, resume_values, score_result):

    prompt = build_prompt(jd_values, resume_values, score_result)

    messages = [
        SystemMessage(content="You generate structured ATS explanations."),
        HumanMessage(content=prompt)
    ]

    response = llm.invoke(messages)

    raw_output = response.content

    try:
        explanation = json.loads(raw_output)
    except Exception:
        explanation = {
            "summary": "Explanation parsing failed",
            "raw_output": raw_output
        }

    explanation["final_score"] = round(score_result["final_score"], 3)

    return explanation