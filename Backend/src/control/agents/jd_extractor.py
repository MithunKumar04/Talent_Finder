import json
from llm import llm


def jd_extractor(JD_text):
    
    
    prompt = f"""
            You are an expert HR talent intelligence system. Your job is to perform 
            structured extraction from a Job Description (JD).

            Analyze the JD carefully — extract what is explicitly stated 
            
            Create the generic key name so those fields can be available in a resume that is going to be compared with 
            
            JD TEXT:
            {JD_text}

            Return ONLY valid JSON .
            No explanation. No markdown. No extra text.

            Response must be a json format key value pair and the value may be list of strings 
            If a particular field is present give that or dont give it in the response even as null
            """
    result = llm.invoke(prompt)
    raw_output = result.content

    return raw_output