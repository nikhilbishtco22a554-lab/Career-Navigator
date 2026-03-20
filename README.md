# Skill-Bridge Career Navigator

## 📄 README Template  

**Candidate Name:** Nikhil Bisht  
**Scenario Chosen:** Skill-Bridge Career Navigator - Building a career platform that looks at your current skills/portfolio and suggests exactly what you need to learn to land your dream job.  
**Estimated Time Spent:** ~4.5 hours  

---

## 🚀 Quick Start

**Prerequisites:**  
- Python 3.9+ 
- A running Redis server (either local or cloud URL in `.env`)
- API keys for Gemini or Groq inside `backend/.env`

**Run Commands:**  
To run the project locally, you need to start the backend and frontend separately:

1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
2. **Frontend:** (Open a second terminal)
   ```bash
   python -m http.server 3000 -d frontend
   ```
   *Then just open your browser to `http://localhost:3000` to see the UI.*

**Test Commands:**  
If you want to test the AI payloads without using the frontend:
```bash
python backend/test_api.py
```

---

## 🎥 Project Demo Video

Check out this video walkthrough to see the Career Navigator in action:

[Watch on YouTube](https://www.youtube.com/watch?v=blWTIDnwO8g)

---

## 🤖 AI Disclosure

**Did you use an AI assistant (Copilot, ChatGPT, etc.)?**  
Yes, I used AI to help structure the frontend styling and speed up writing the backend FastAPI routing boilerplate.

**How did you verify the suggestions?**  
- **Visual Verification**: I booted up the frontend server to make sure the CSS looked clean and the dynamic tabs actually switched when clicked.
- **API Testing**: I monitored the backend terminal logs to ensure data was passing correctly, and checked my `test_api.py` script to see if the AI accurately parsed the fake resumes into my Redis cache.

**Give one example of a suggestion you rejected or changed:**  
At first, the AI recommended generating full URLs for the courses it suggested. I rejected this because LLMs are notorious for "hallucinating" fake links that just lead to 404 dead pages. Instead, I changed its prompt to only output the course provider's name (like Coursera) and a real price estimate in INR, which is far more reliable.

---

## ⚖️ Tradeoffs & Prioritization

**What did you cut to stay within the 4–6 hour limit?**  
- I chose to build the frontend in plain Vanilla HTML/JS instead of a heavier framework like React or Next.js. This saved a lot of tooling and configuration time.
- I skipped adding a full user login/authentication system (OAuth) so I could focus purely on the core AI roadmap logic.

**What would you build next if you had more time?**  
- **Auto-fetching GitHub/LinkedIn**: Instead of making users manually describe their projects, I'd connect the GitHub API so the app could pull their top code repositories directly.
- **Live Interview Chat**: Right now, the app just spits out 3 interview questions. I'd love to turn that into an interactive live chatbot that reads your answers and grades you in real-time.

**Known limitations:**  
- **Course Hallucinations**: Sometimes the Groq/Gemini models might suggest a course title that doesn't perfectly match what's currently active on Udemy.
- **Temporary Sessions**: Since I'm using an ephemeral Redis cache instead of a solid database like PostgreSQL, your data resets if your session expires.