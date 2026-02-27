from pathlib import Path
from resume_parser import resume_parser
from jd_extractor import jd_extractor
from schema_extractor import schema_extractor

RESUME_FOLDER = Path("_resumes")
text = ""

jd_text = """
    Location: Chennai

Experience: 3–5 Years

Qualification: B.E / B.Tech (CS/IT) or MCA / M.Sc (CS/IT)

Role Overview

We are adding skilled Python Developers with exposure to AI/ML concepts to design and build scalable backend applications, APIs, and automation solutions. This role involves working on enterprise integrations and AI-driven initiatives within a structured engineering environment.

Key Responsibilities

Design, develop, and maintain backend applications using Python
Build and optimize scalable RESTful APIs
Work with frameworks such as Django, Flask, or FastAPI
Design and optimize database schemas and queries (SQL/NoSQL)
Contribute to AI/ML-based solutions and automation initiatives
Implement third-party integrations and enterprise system connections
Debug, test, and optimize applications for performance and reliability
Collaborate with architects, analysts, and cross-functional teams
Adapt to multi-technology environments, including exposure to ABAP where required
Must-Have Skills

Hands-on Python development experience
Strong experience with Django / Flask / FastAPI
Experience in API development and system integrations
Proficiency in SQL or NoSQL databases
Strong debugging, analytical, and problem-solving skills
Understanding of SDLC and Agile methodologies
Effective use of AI tools with hands-on AI/ML and LLM integration in enterprise applications
Exposure to data pipelines and MLOps, including model deployment and monitoring
Willingness to work across multiple technologies
Good-to-Have

Exposure to AI/ML frameworks (TensorFlow, PyTorch, Scikit-learn)
Experience with cloud platforms (AWS/Azure/GCP)
Familiarity with Git and version control best practices
Basic knowledge of Docker or containerization
Exposure to SAP ecosystem or enterprise applications"""

jd_output = jd_extractor(jd_text)
print(jd_output)

schema_values = (jd_output.keys())

print(schema_values)
"""
results = []

jd_schema = schema_extractor(jd_output)

for file in RESUME_FOLDER.glob("*.pdf"):
    text = resume_parser(file)
    if not text:
        continue

    resume_output = jd_extractor(text)
    
    
"""