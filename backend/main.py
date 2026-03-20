import os
import json
import requests
from typing import List, Optional, Union, Dict
from fastapi import FastAPI, Header, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import google.generativeai as genai
from groq import Groq
import redis

load_dotenv()

app = FastAPI(title="Skill-Bridge Career Navigator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("API_KEY", "secret-api-key-123")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)
GUVI_CALLBACK_URL = os.getenv("GUVI_CALLBACK_URL")

try:
    r = redis.Redis(
        host=REDIS_HOST, 
        port=REDIS_PORT, 
        password=REDIS_PASSWORD, 
        decode_responses=True,
        socket_connect_timeout=5
    )
    r.ping()
    print("Connected to Redis")
except Exception as e:
    print(f"Warning: Redis connection failed: {e}")
    r = None

class ProfileRequest(BaseModel):
    sessionId: Optional[str] = "default-session"
    resume_text: str = Field(..., description="User's resume or current skills text")
    target_role: str = Field(..., description="Job role or job description the user is aiming for")
    portfolio_summary: Optional[str] = ""

class GapAnalysis(BaseModel):
    current_skills: List[str] = []
    missing_skills: List[str] = []

class LearningRoadmap(BaseModel):
    skill: str
    course_suggestion: str
    provider: str = Field(default="Unknown")
    cost_estimate: str = Field(default="N/A")
    course_link: str = Field(default="#")
    estimated_time: str

class CareerResponseData(BaseModel):
    gap_analysis: GapAnalysis
    learning_roadmap: List[LearningRoadmap]
    mock_interview_questions: List[str]
    agent_notes: str

class CareerResponse(BaseModel):
    status: str
    data: CareerResponseData

def get_session(session_id: str) -> dict:
    if r:
        data = r.get(f"career_session:{session_id}")
        if data:
            return json.loads(data)
    
    return {
        "analysis_count": 0,
        "history": [] 
    }

def save_session(session_id: str, data: dict):
    if r:
        r.set(f"career_session:{session_id}", json.dumps(data))

SYSTEM_PROMPT = """
### CONTEXT: SKILL-BRIDGE CAREER NAVIGATOR ###
You are an AI Career Navigation expert.
Your goal is to parse user input (a resume, current skills, or portfolio) and a target job role.
You will perform a "Gap Analysis", generate a "Dynamic Learning Roadmap", and create "Mock Interview Questions".
Ensure all estimated costs and prices are provided exclusively in Indian Rupees (INR / ₹) instead of USD.

INPUT CONTEXT:
- You will receive the user's current profile/resume and their target role or job description.

OUTPUT FORMAT:
You must respond in VALID JSON format ONLY. Do not add markdown blocks.
{
    "gap_analysis": {
        "current_skills": ["list", "of", "skills"],
        "missing_skills": ["list", "of", "missing", "skills"]
    },
    "learning_roadmap": [
        {
            "skill": "skill",
            "course_suggestion": "course",
            "provider": "e.g., Coursera, Udemy, YouTube",
            "cost_estimate": "Price in INR (e.g., Free, ₹1500/month, ₹400)",
            "course_link": "Provide a real URL to the course, or a valid search URL on the provider's platform",
            "estimated_time": "time"
        }
    ],
    "mock_interview_questions": [
        "q1",
        "q2"
    ],
    "agent_notes": "note"
}
"""

def generate_career_path(session_id: str, request_data: ProfileRequest) -> dict:
    provider = os.getenv("LLM_PROVIDER", "groq").lower()
    
    context_message = f"""
    Resume/Current Skills: "{request_data.resume_text}"
    Portfolio Summary: "{request_data.portfolio_summary}"
    Target Role: "{request_data.target_role}"
    """
    
    try:
        response_text = "{}"
        
        if provider == "groq":
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key: return {"error": "GROQ_API_KEY missing"}
            
            client = Groq(api_key=api_key)
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": context_message}
            ]
            
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile", 
                messages=messages,
                temperature=0.7,
                max_tokens=2048,
                response_format={"type": "json_object"}
            )
            response_text = completion.choices[0].message.content

        elif provider == "gemini":
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key: return {"error": "GEMINI_API_KEY missing"}
            
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash", generation_config={"response_mime_type": "application/json"})
            
            full_prompt = f"{SYSTEM_PROMPT}\n\n{context_message}"
            response = model.generate_content(full_prompt)
            response_text = response.text
            
        else:
            return {"error": f"Unsupported provider {provider}"}

        if "```json" in response_text:
            response_text = response_text.replace("```json", "").replace("```", "")
        elif "```" in response_text:
            response_text = response_text.replace("```", "")
            
        return json.loads(response_text.strip())

    except Exception as e:
        with open("backend/error.log", "a") as f:
            f.write(f"LLM Logic Error: {e}\nResponse Text: {response_text}\n")
        print(f"LLM Logic Error: {e}")
        # Rule-based manual fallback system:
        target = request_data.target_role.lower()
        if "data" in target:
            manual_skills = ["SQL", "Pandas", "Statistics"]
            course = "Data Analysis Bootcamp"
        elif "cloud" in target:
            manual_skills = ["AWS/Azure", "Docker", "Networking"]
            course = "Cloud Foundation Certification"
        elif "frontend" in target or "ui" in target:
            manual_skills = ["React.js", "CSS Grid", "JavaScript APIs"]
            course = "Advanced Frontend Frameworks"
        else:
            manual_skills = ["System Design", "Advanced Algorithms", "Git/CI-CD"]
            course = "Comprehensive Software Engineering Program"
            
        return {
            "gap_analysis": {
                 "current_skills": ["Basic IT Knowledge"],
                 "missing_skills": manual_skills
            },
            "learning_roadmap": [
                {
                    "skill": manual_skills[0],
                    "course_suggestion": course,
                    "provider": "Manual Rules Fallback System",
                    "cost_estimate": "Free",
                    "course_link": "https://www.youtube.com/results?search_query=" + course.replace(" ", "+"),
                    "estimated_time": "1 month"
                }
            ],
            "mock_interview_questions": [
                f"How would you apply your knowledge of {manual_skills[0]} to solve a business problem?",
                "Can you describe a time you learned a new technical skill quickly?"
            ],
            "agent_notes": "AI provider unavailable. Roadmap generated via our manual rule-based fallback system."
        }

def send_callback(session_id: str, session_data: dict, analysis_result: dict):
    """
    Sends the session data to a webhook/callback if configured.
    """
    if not GUVI_CALLBACK_URL:
        return

    payload = {
        "sessionId": session_id,
        "analysisCount": session_data.get("analysis_count", 1),
        "latestAnalysis": analysis_result
    }

    try:
        response = requests.post(GUVI_CALLBACK_URL, json=payload, timeout=5)
        print(f"Callback sent for {session_id}: Status {response.status_code}")
    except Exception as e:
        print(f"Callback failed for {session_id}: {e}")

# --- Routes ---
@app.get("/")
def read_root():
    return {"message": "Skill-Bridge Career Navigator API is running."}

@app.post("/analyze", response_model=CareerResponse)
async def analyze_endpoint(request: ProfileRequest, background_tasks: BackgroundTasks):
    """
    Main execution endpoint for career analysis.
    """
    if len(request.target_role.strip()) < 2:
        raise HTTPException(status_code=400, detail="target_role must be at least 2 characters long")
    if len(request.resume_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="resume_text must be provided and have substantial content")

    session_id = request.sessionId or "default-session"
    
    session = get_session(session_id)
    session["analysis_count"] += 1
    
    session["history"].append({
        "type": "request",
        "target_role": request.target_role
    })

    # Call LLM
    llm_result = generate_career_path(session_id, request)
    
    if "error" in llm_result:
        raise HTTPException(status_code=500, detail=llm_result["error"])

    session["history"].append({
        "type": "response",
        "data": llm_result
    })

    save_session(session_id, session)

    if GUVI_CALLBACK_URL:
        background_tasks.add_task(send_callback, session_id, session, llm_result)
    
    return CareerResponse(
        status="success",
        data=CareerResponseData(**llm_result)
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
