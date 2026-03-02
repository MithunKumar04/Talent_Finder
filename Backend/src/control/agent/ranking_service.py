from pathlib import Path
from src.control.agent.resume_parser import resume_parser
from src.control.agent.resume_extractor import resume_extractor
from src.control.agent.jd_extractor import jd_extractor
from src.control.agent.embedding import get_embedding
from src.control.agent.scoring_agent import create_scores
from src.control.agent.explanation_builder import build_candidate_explanation_llm

RESUME_FOLDER = Path("_resumes")


def detect_skill_mode(jd_output):
    must = jd_output.get("must_have_skills", [])
    nice = jd_output.get("nice_to_have_skills", [])
    general = jd_output.get("skills", [])

    if must:
        return {
            "mode": "structured",
            "must": must,
            "nice": nice
        }

    return {
        "mode": "general",
        "skills": general
    }


def rank_resumes(jd_text: str):

    jd_output = jd_extractor(jd_text)
    skill_structure = detect_skill_mode(jd_output)

    jd_values = {
        "mode": skill_structure["mode"],
        "education_embedding": [],
        "title_embedding": None,
        "year": jd_output.get("years_of_experience", 0),
        "resp_embeddings": []
    }

    # Education
    if jd_output.get("education"):
        jd_values["education_embedding"] = [get_embedding(edu) for edu in jd_output["education"] if edu]

    # Job title
    if jd_output.get("job_name"):
        jd_values["title_embedding"] = get_embedding(jd_output["job_name"])

    # Responsibilities
    if jd_output.get("key_resp"):
        jd_values["resp_embeddings"] = [
            get_embedding(resp)
            for resp in jd_output["key_resp"]
            if resp
        ]

    # skills - standard
    if skill_structure["mode"] == "structured":

        jd_values["must"] = skill_structure["must"]
        jd_values["nice"] = skill_structure["nice"]

        jd_values["must_embedding"] = (
            get_embedding(",".join(skill_structure["must"]))
            if skill_structure["must"] else None
        )

        jd_values["nice_embedding"] = (
            get_embedding(",".join(skill_structure["nice"]))
            if skill_structure["nice"] else None
        )

    #skills - general
    else:
        jd_values["general_skills"] = skill_structure["skills"]

        jd_values["skills_embedding"] = (
            get_embedding(",".join(skill_structure["skills"]))
            if skill_structure["skills"] else None
        )

    results = []

    for file in RESUME_FOLDER.glob("*.pdf"):

        text = resume_parser(file)
        if not text:
            continue

        resume_output = resume_extractor(text)
        if not resume_output:
            continue

        candidate_name = resume_output.get("name") or file.stem

        resume_values = {
            "skills": resume_output.get("skills", []),
            "skills_embedding": None,
            "education_embedding": None,
            "role": resume_output.get("experience", []),
            "role_embedding": [],
            "resp_embeddings": []
        }

        # Resume skill embedding
        skills_text = ",".join(resume_values["skills"])
        if skills_text.strip():
            resume_values["skills_embedding"] = get_embedding(skills_text)

        # Resume education embedding
        edu_text = resume_output.get("education", "")
        if edu_text.strip():
            resume_values["education_embedding"] = get_embedding(edu_text)

        # Resume roles embedding
        if resume_values["role"]:
            resume_values["role_embedding"] = [
                get_embedding(exp["role"])
                for exp in resume_values["role"]
                if exp.get("role")
            ]

        # Resume responsibilities embedding
        if resume_output.get("key_resp"):
            resume_values["resp_embeddings"] = [
                get_embedding(r)
                for r in resume_output["key_resp"]
                if r
            ]

        scores = create_scores(jd_values, resume_values)
        
        #Explanation payload 
        explanation_payload = {
            "mode": jd_values["mode"],

            "jd": {
                "must_have_skills": jd_values.get("must", []),
                "nice_to_have_skills": jd_values.get("nice", []),
                "general_skills": jd_values.get("general_skills", []),
                "required_experience_years": jd_values.get("year", 0),
                "required_education": jd_output.get("education", ""),
                "key_responsibilities": jd_output.get("key_resp", [])
            },

            "resume": {
                "skills": resume_values.get("skills", []),
                "experience": resume_values.get("role", []),
                "education": resume_output.get("education", ""),
                "key_responsibilities": resume_output.get("key_resp", [])
            },

            "score_result": scores
        }

        explanation = build_candidate_explanation_llm(explanation_payload)

        #Rejected Candidates
        if not scores or scores.get("rejected"):
            results.append({
                "name": candidate_name,
                "email": resume_output["email"],
                "status": "Rejected",
                "final_score": 0,
                "explanation": explanation
            })
        else:
            results.append({
                "name": candidate_name,
                "email": resume_output["email"],
                "status": "Accepted",
                "final_score": round(scores.get("final_score", 0), 3),
                "explanation": explanation
            })
                
    accepted = [r for r in results if r.get("status") != "Rejected"]
    rejected = [r for r in results if r.get("status") == "Rejected"]

    accepted.sort(key=lambda x: x["final_score"], reverse=True)

    for i, candidate in enumerate(accepted, start=1):
        candidate["rank"] = i

    for candidate in rejected:
        candidate["rank"] = 0 
    return accepted + rejected

