import requests
import json
import uuid
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

BASE_URL = "http://127.0.0.1:8000" 

def run_step(step_num, title, payload):
    print(f"\n[Step {step_num}] {title}")
    try:
        resp = requests.post(f"{BASE_URL}/analyze", json=payload)
        
        # We print both successful responses and anticipated error messages for edge cases
        if resp.status_code == 200:
             print(f"Success! Response: {json.dumps(resp.json(), indent=2)}")
        else:
             print(f"Expected Error Caught: {resp.status_code} - {resp.text}")
             
    except Exception as e:
        print(f"Connection Error: {e}")

def run_tests():
    print("--- Starting Required Hackathon Tests ---")
    
    # 1. Happy Path Test
    payload_happy = {
        "sessionId": str(uuid.uuid4()),
        "resume_text": "Recent CS Graduate. Proficient in Python, Java, Data Structures, and basic SQL. Academic projects in Machine Learning and Web Development.",
        "target_role": "Cloud Engineer at AWS",
        "portfolio_summary": "GitHub has 10 repos, mostly school projects."
    }
    run_step(1, "Testing Happy Path (Cloud Engineer Profile)", payload_happy)

    # 2. Edge Case Test: Input Validation Failure (Empty Resume/Role)
    payload_edge = {
        "sessionId": str(uuid.uuid4()),
        "resume_text": "Short", # Triggers length validation error
        "target_role": "",      # Triggers length validation error
        "portfolio_summary": ""
    }
    run_step(2, "Testing Edge Case (Input Validation with Empty Fields)", payload_edge)

    print("\n--- Tests Complete ---")

if __name__ == "__main__":
    run_tests()
