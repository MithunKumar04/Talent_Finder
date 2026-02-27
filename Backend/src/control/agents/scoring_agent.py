import numpy as np
import math
from datetime import datetime


def cosine_sim(vec1, vec2):
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)

        if np.linalg.norm(vec1) == 0 or np.linalg.norm(vec2) == 0:
            return 0.0

        return float(np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2)))



def compute_skills_score(jd_values, resume_values):
    jd_skills = set(map(str.lower, jd_values["skills"]))
    resume_skills = set(map(str.lower, resume_values["skills"]))

    # Exact match
    matched = jd_skills & resume_skills
    exact_score = len(matched) / max(len(jd_skills), 1)

    # Semantic similarity
    semantic_score = cosine_sim(jd_values["skills_embedding"],resume_values["skills_embedding"])

    final_skill_score = 0.6 * exact_score + 0.4 * semantic_score

    return {
        "exact": exact_score,
        "semantic": semantic_score,
        "final": final_skill_score
    }


def compute_education_score(jd_values, resume_values):
    return cosine_sim(jd_values["education_embedding"],resume_values["education_embedding"])


def compute_role_similarity(jd_values, resume_values, threshold=0.75):
    similarities = []
    relevant_indexes = []
    
    for i, role_emb in enumerate(resume_values["role_embedding"]):
        sim = cosine_sim(jd_values["title_embedding"], role_emb)
        similarities.append(sim)
        if sim >= threshold:
            relevant_indexes.append(i)
    return similarities, relevant_indexes



def compute_experience_score(jd_values, resume_values, similarities, relevant_indexes):

    jd_required_years = jd_values["year"]

    role_fit_score = max(similarities[i] for i in relevant_indexes)

    total_years = sum(
        resume_values["role"][i].get("year_of_experience", 0)
        for i in relevant_indexes
    )

    # 1-year concession
    if total_years >= jd_required_years - 1:
        experience_ratio = min(total_years / jd_required_years, 1.0)
    else:
        experience_ratio = total_years / jd_required_years

    experience_score = role_fit_score * experience_ratio

    return {
        "total_years": total_years,
        "ratio": experience_ratio,
        "role_fit": role_fit_score,
        "experience_score": experience_score
    }



def apply_recency_decay(resume_values, relevant_indexes,experience_score,decay_lambda=0.15):

    current_year = datetime.now().year
    end_years = []

    for i in relevant_indexes:
        role = resume_values["role"][i]
        end_date = role.get("end_date")

        if not end_date or end_date.lower() == "present":
            end_years.append(current_year)
        else:
            end_years.append(end_date)
            

    most_recent_year = max(end_years)
    years_since_last = current_year - most_recent_year

    recency_factor = math.exp(-decay_lambda * years_since_last)

    return experience_score * recency_factor, recency_factor



def compute_final_score(skill_score, education_score, experience_score, role_fit_score, recency_factor):
    final_score = (0.40 * skill_score + 0.20 * experience_score + 0.10 * education_score + 0.20 * role_fit_score + 0.10 * recency_factor)
    return final_score

def compute_final_score_freshers(skill_score, education_score):
    final_score = (0.80 * skill_score + 0.20 * education_score)
    return final_score



def create_scores(jd_values, resume_values):
    skills_result = compute_skills_score(jd_values, resume_values)
    education_score = compute_education_score(jd_values, resume_values)
    jd_year = jd_values["year"]
    print(jd_year)
    
    if jd_year > 0:
        similarities, relevant_indexes = compute_role_similarity(jd_values, resume_values )
        
        if not relevant_indexes:
            return None
        
        
        experience_result = compute_experience_score(jd_values, resume_values, similarities, relevant_indexes)

        final_experience_score, recency_factor = apply_recency_decay(
            resume_values,
            relevant_indexes,
            experience_result["experience_score"],
            jd_values["year"]
        )

        final_score = compute_final_score(
            skills_result["final"],
            education_score,
            final_experience_score,
            experience_result["role_fit"],
            recency_factor
        )
        print(skills_result, education_score,experience_result,similarities,relevant_indexes,recency_factor,final_experience_score,final_score)


        return {
            "skills_score": skills_result,
            "education_score": education_score,
            "role_similarities": similarities,
            "relevant_indexes": relevant_indexes,
            "experience_details": experience_result,
            "recency_factor": recency_factor,
            "final_experience_score": final_experience_score,
            "final_score": final_score
        }
        
    
    final_score = compute_final_score_freshers(skills_result["final"],education_score)
    print(skills_result, education_score,final_score)

    
    return {
        "skills_score": skills_result,
        "education_score": education_score,
        "final_score": final_score
    }