import requests
import json
import uuid
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

# BASE_URL = "http://127.0.0.1:8000"
BASE_URL = "http://127.0.0.1:8000" # Using local for tests, update to Vercel if needed
API_KEY = os.getenv("API_KEY", "secret-api-key-123")

def run_step(step_num, title, payload, headers):
    print(f"\n[Step {step_num}] {title}")
    try:
        resp = requests.post(f"{BASE_URL}/analyze", headers=headers, json=payload)
        resp.raise_for_status()
        print(f"Response: {json.dumps(resp.json(), indent=2)}")
    except Exception as e:
        print(f"Error in Step {step_num}: {e}")
        if hasattr(e, 'response') and e.response is not None:
             print(e.response.text)

def test_api():
    session_id = str(uuid.uuid4())
    print(f"--- Starting Test Session: {session_id} ---")
    
    headers = {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
    }

    # 1. New Grad to Cloud Engineer
    payload_1 = {
        "sessionId": session_id,
        "resume_text": "Recent CS Graduate. Proficient in Python, Java, Data Structures, and basic SQL. Academic projects in Machine Learning and Web Development.",
        "target_role": "Cloud Engineer at AWS",
        "portfolio_summary": "GitHub has 10 repos, mostly school projects and a simple React app."
    }
    run_step(1, "Testing Cloud Engineer Gap Analysis", payload_1, headers)

    # 2. Career Switcher Marketing to Data Analytics
    payload_2 = {
        "sessionId": str(uuid.uuid4()),
        "resume_text": "5 years in Digital Marketing. Expert in Google Analytics, SEO, and Excel. Looking for a more data-focused role.",
        "target_role": "Data Analyst",
        "portfolio_summary": ""
    }
    run_step(2, "Testing Career Switcher to Data Analyst", payload_2, headers)

    print("\n--- Test Complete ---")

if __name__ == "__main__":
    test_api()
