import numpy as np
import math
from datetime import datetime


# Cosine Similarity
def cosine_sim(vec1, vec2):
    if vec1 is None or vec2 is None:
        return 0.0

    vec1 = np.array(vec1)
    vec2 = np.array(vec2)

    if np.linalg.norm(vec1) == 0 or np.linalg.norm(vec2) == 0:
        return 0.0

    return float(np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2)))

#Skills Score
def compute_skills_score(jd_values, resume_values):

    resume_set = set(map(str.lower, resume_values.get("skills", [])))

    # Structured Mode
    if jd_values.get("mode") == "structured":

        must_set = set(map(str.lower, jd_values.get("must", [])))
        nice_set = set(map(str.lower, jd_values.get("nice", [])))

        if must_set:
            match_ratio = len(must_set & resume_set) / len(must_set)

            if match_ratio != 1.0:
                return None

            must_score = match_ratio
        else:
            must_score = 1.0

        if nice_set:
            nice_score = len(nice_set & resume_set) / len(nice_set)
        else:
            nice_score = 0.0

        must_semantic = 0.0
        nice_semantic = 0.0

        if (jd_values.get("must_embedding") is not None and resume_values.get("skills_embedding") is not None):
            must_semantic = cosine_sim( jd_values["must_embedding"], resume_values["skills_embedding"])

        if (jd_values.get("nice_embedding") is not None and resume_values.get("skills_embedding") is not None):
            nice_semantic = cosine_sim(jd_values["nice_embedding"], resume_values["skills_embedding"])
        
        if(must_set and nice_set):
            final_skill_score = (0.6 * must_score + 0.2 * nice_score + 0.15 * must_semantic + 0.05 * nice_semantic)
            
        elif (must_set):
            final_skill_score = (0.7 * must_score +0.3 * must_semantic)
        print("1.a must", must_score,nice_score, must_semantic,nice_semantic, final_skill_score ,"\n")

        return {
            "mode": "structured",
            "must_match_ratio": must_score,
            "nice_match_ratio": nice_score,
            "must_semantic": must_semantic,
            "nice_semantic": nice_semantic,
            "final": final_skill_score
        }

    # General Mode
    else:

        general_set = set(map(str.lower, jd_values.get("general_skills", [])))

        if general_set:
            keyword_score = len(general_set & resume_set) / len(general_set)
        else:
            keyword_score = 0.0

        semantic_score = 0.0

        if (jd_values.get("skills_embedding") is not None and resume_values.get("skills_embedding") is not None):
            semantic_score = cosine_sim(jd_values["skills_embedding"], resume_values["skills_embedding"])

        final_skill_score = (0.6 * keyword_score +0.4 * semantic_score)
        
        print("1.b general",keyword_score, semantic_score, "\n")

        return {
            "mode": "general",
            "keyword_match_ratio": keyword_score,
            "semantic": semantic_score,
            "final": final_skill_score
        }

# Education Score
def compute_education_score(jd_values, resume_values):
    
    ed_embed = jd_values.get("education_embedding")
    if ed_embed:
        ed_score = max(cosine_sim(ed_value,resume_values.get("education_embedding")) for ed_value in ed_embed)
        
        print("2. edu",ed_score,"\n")
        
        return ed_score
    else:
        return None


# Role Similarity Score
def compute_role_similarity_score(jd_values, resume_values, threshold=0.75):

    similarities = []
    relevant_indexes = []

    for i, role_emb in enumerate(resume_values.get("role_embedding", [])):

        sim = cosine_sim(jd_values.get("title_embedding"),role_emb)

        similarities.append(sim)

        if sim >= threshold:
            relevant_indexes.append(i)

    return similarities, relevant_indexes


# Experience Score
def compute_experience_score(jd_values, resume_values, similarities, relevant_indexes):

    if not relevant_indexes:
        return None

    jd_required_years = jd_values.get("year", 0)
    if jd_required_years <= 0:
        return None

    role_fit_score = max(similarities[i] for i in relevant_indexes)

    total_years = sum(resume_values["role"][i].get("year_of_experience", 0) for i in relevant_indexes )

    if total_years >= jd_required_years - 1:
        experience_ratio = min(total_years / jd_required_years, 1.0)
    else:
        experience_ratio = total_years / jd_required_years
        
    print("3. role exp",total_years, experience_ratio, role_fit_score, "\n")

    return {
        "total_years": total_years,
        "ratio": experience_ratio,
        "role_fit": role_fit_score
    }


# Recency Decay Score
def compute_recency_decay_score(resume_values, relevant_indexes, decay_lambda=0.15):

    if not relevant_indexes:
        return 1.0

    current_year = datetime.now().year
    end_years = []

    for i in relevant_indexes:
        role = resume_values["role"][i]
        end_date = role.get("end_year")

        if not end_date:
            continue

        if isinstance(end_date, str) and end_date.lower() == "present":
            end_years.append(current_year)
        else:
            try:
                end_years.append(int(end_date))
            except:
                continue

    if not end_years:
        return 1.0

    most_recent_year = max(end_years)
    years_since_last = current_year - most_recent_year
    
    print("4. rec",math.exp(-decay_lambda * years_since_last),"\n")

    return math.exp(-decay_lambda * years_since_last)


# Responsibility Score
def compute_responsibility_score(jd_embeddings, resume_embeddings, top_k=5):

    if not jd_embeddings or not resume_embeddings:
        return None

    scores = []

    for jd_emb in jd_embeddings:
        for res_emb in resume_embeddings:
            scores.append(cosine_sim(jd_emb, res_emb))

    scores.sort(reverse=True)

    if not scores:
        return None

    top_scores = scores[:top_k]
    
    print("5. resp",sum(top_scores) / len(top_scores),"\n")

    return sum(top_scores) / len(top_scores)


# Dynamic Final Score
def compute_dynamic_final_score(components):

    total_weight = 0
    weighted_sum = 0

    for value in components.values():

        if value is None:
            continue

        score, weight = value
        total_weight += weight
        weighted_sum += score * weight

    if total_weight == 0:
        return 0.0
    
    print("6. Final",weighted_sum / total_weight )

    return weighted_sum / total_weight


# Main Score Function
def create_scores(jd_values, resume_values):

    # ---------------- SKILLS ----------------
    skills_result = compute_skills_score(jd_values, resume_values)

    if skills_result is None:
        return {
            "rejected": True,
            "reason": "Missing required must-have skills"
        }

    skill_score = skills_result["final"]

    # ---------------- EDUCATION ----------------
    education_score = None
    if (jd_values.get("education_embedding") is not None and resume_values.get("education_embedding") is not None):
        education_score = min(compute_education_score(jd_values, resume_values),1)

    # ---------------- RESPONSIBILITY ----------------
    resp_score = compute_responsibility_score(jd_values.get("resp_embeddings"),resume_values.get("resp_embeddings"))

    # ---------------- EXPERIENCE ----------------
    experience_ratio = None
    role_fit_score = None
    recency_factor = None

    if jd_values.get("year", 0) > 0 and resume_values.get("role_embedding"):

        similarities, relevant_indexes = compute_role_similarity_score(jd_values,resume_values)
        if relevant_indexes:

            experience_result = compute_experience_score(jd_values,resume_values,similarities,relevant_indexes)

            if experience_result:

                experience_ratio = experience_result["ratio"]
                role_fit_score = experience_result["role_fit"]

                recency_factor = compute_recency_decay_score(resume_values, relevant_indexes)
        else:
            return None
    

    # ---------------- DYNAMIC SCORING ----------------
    components = {
        "skill": (skill_score, 0.40),

        "education": (education_score, 0.10)
        if education_score is not None else None,

        "responsibility": (resp_score, 0.20)
        if resp_score is not None else None,

        "experience_ratio": (experience_ratio, 0.10)
        if experience_ratio is not None else None,

        "role_fit": (role_fit_score, 0.10)
        if role_fit_score is not None else None,

        "recency": (recency_factor, 0.10)
        if recency_factor is not None else None
    }

    final_score = compute_dynamic_final_score(components)


    return {
        "rejected": False,
        "skills_score": skills_result,
        "education_score": education_score,
        "responsibility_score": resp_score,
        "experience_ratio": experience_ratio,
        "role_fit_score": role_fit_score,
        "recency_factor": recency_factor,
        "final_score": final_score
    }