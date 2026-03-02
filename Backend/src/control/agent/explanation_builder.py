import json
from langchain_core.messages import HumanMessage, SystemMessage
from src.control.agent.llm import llm


def build_prompt(payload):

    jd = payload["jd"]
    resume = payload["resume"]
    score_result = payload["score_result"]

    # Determine evaluated sections

    evaluated_sections = {
        "skills": True,

        "experience": jd.get("required_experience_years", 0) > 0,

        "education": bool(jd.get("required_education")),

        "responsibility": bool(jd.get("key_responsibilities"))
    }

    structured_payload = {
        "job_requirements": jd,
        "candidate_profile": resume,
        "score_summary": score_result,
        "evaluated_sections": evaluated_sections
    }

    # REJECTION CASE

    if not score_result or score_result.get("rejected"):

        return f"""
            You are an ATS explanation engine.

            The candidate has been REJECTED.

            STRICT RULES:
            - Clearly explain why the candidate was rejected.
            - Compare JD requirements with candidate profile.
            - Do NOT invent skills or experience.
            - If a section was not evaluated, return it as null.
            - Output ONLY valid JSON.

            JSON FORMAT:
            {{
            "summary": "",
            "skills_explanation": "",
            "experience_explanation": null,
            "education_explanation": null,
            "responsibility_explanation": null,
            "final_justification": ""
            }}

            DATA:
            {json.dumps(structured_payload, indent=2)}
            """

    # NORMAL CASE

    return f"""
        You are an ATS explanation engine.

        STRICT RULES:
        - Compare JD and resume directly.
        - For skills: compare must/nice OR general.
        - For experience: compare required years vs candidate years. For the correct job title only and sum the similar to it
        - For responsibilities: compare JD responsibilities with resume responsibilities, experience and projects.
        - If a section was not evaluated, return null.
        - If the degree and course tell it as similar
        - Do NOT invent information.
        - Output ONLY valid JSON (no markdown).

        JSON FORMAT:
        {{
        "summary": "",
        "skills_explanation": null,
        "experience_explanation": null,
        "education_explanation": null,
        "responsibility_explanation": null,
        "final_justification": ""
        }}

        IMPORTANT:
        If evaluated_sections value is false → set explanation field to null.

        DATA:
        {json.dumps(structured_payload, indent=2)}
        """
    

def build_candidate_explanation_llm(payload):

    prompt = build_prompt(payload)

    messages = [SystemMessage(content="You generate structured ATS explanations."),HumanMessage(content=prompt)]

    response = llm.invoke(messages)
    raw_output = response.content

    try:
        explanation = json.loads(raw_output)
    except Exception:
        explanation = {
            "summary": "Explanation generation failed",
            "skills_explanation": None,
            "experience_explanation": None,
            "education_explanation": None,
            "responsibility_explanation": None,
            "final_justification": None
        }

    # Remove fields that are None
    cleaned_explanation = {
        k: v for k, v in explanation.items()
        if v is not None
    }


    return cleaned_explanation