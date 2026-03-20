document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
        });
    });

    // Form Submission
    const form = document.getElementById('analyze-form');
    const submitBtn = document.getElementById('submit-btn');
    const welcomeText = document.getElementById('welcome-text');
    const agentNotes = document.getElementById('agent-notes');
    const loader = document.getElementById('loader');
    const resultsContainer = document.getElementById('results-container');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Gather Data
        const payload = {
            sessionId: crypto.randomUUID(),
            target_role: document.getElementById('target-role').value,
            resume_text: document.getElementById('resume-text').value,
            portfolio_summary: document.getElementById('portfolio-text').value
        };

        // UI State: Loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Analyzing...';
        resultsContainer.classList.add('hidden');
        loader.classList.remove('hidden');
        welcomeText.textContent = "Analyzing Your Profile";
        agentNotes.textContent = "Our AI is currently mapping your skills against industry standards...";

        try {
            const response = await fetch('http://127.0.0.1:8000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // Try reading json response for error message
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { detail: response.statusText };
                }
                throw new Error(errorData.detail || 'Server error');
            }

            const data = await response.json();
            renderResults(data.data);
            
            // UI State: Success
            welcomeText.textContent = "Analysis Complete";
            agentNotes.textContent = data.data.agent_notes || "Here is your personalized roadmap to success.";
            loader.classList.add('hidden');
            resultsContainer.classList.remove('hidden');

            // Set Gap Tab as active initially
            tabBtns[0].click();

        } catch (error) {
            alert(`Error: ${error.message}`);
            welcomeText.textContent = "Error Occurred";
            agentNotes.textContent = "Please check your network connection and try again.";
            loader.classList.add('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Analyze Profile';
        }
    });

    function renderResults(data) {
        // Gap Analysis
        const currentList = document.getElementById('current-skills-list');
        const missingList = document.getElementById('missing-skills-list');
        
        const currentSkills = data?.gap_analysis?.current_skills || [];
        const missingSkills = data?.gap_analysis?.missing_skills || [];

        currentList.innerHTML = currentSkills.length > 0 ? 
            currentSkills.map(skill => `<li>${skill}</li>`).join('') :
            "<li>No current skills identified</li>";
            
        missingList.innerHTML = missingSkills.length > 0 ?
            missingSkills.map(skill => `<li>${skill}</li>`).join('') :
            "<li>No missing skills identified</li>";

        // Roadmap
        const roadmapTimeline = document.getElementById('roadmap-timeline');
        if (data.learning_roadmap && data.learning_roadmap.length > 0) {
            roadmapTimeline.innerHTML = data.learning_roadmap.map(item => {
                const cost = item.cost_estimate || 'N/A';
                const isFree = cost.toLowerCase().includes('free') || cost.includes('0');
                const badgeClass = isFree ? 'free' : 'paid';
                
                return `
                <div class="roadmap-item">
                    <div class="roadmap-card">
                        <div class="card-header">
                            <h4>${item.skill}</h4>
                            <span class="price-badge ${badgeClass}">${cost}</span>
                        </div>
                        <div class="meta-info">
                            <span class="provider">🏛 ${item.provider || 'Online'}</span>
                            <span class="time">⏱ ${item.estimated_time}</span>
                        </div>
                        <p class="course">${item.course_suggestion}</p>
                        <a href="${item.course_link || '#'}" target="_blank" class="course-link">View Course &rarr;</a>
                    </div>
                </div>
                `;
            }).join('');
        } else {
             roadmapTimeline.innerHTML = "<p>No roadmap items generated.</p>";
        }

        // Interview
        const interviewDiv = document.getElementById('interview-questions');
        if (data.mock_interview_questions && data.mock_interview_questions.length > 0) {
             interviewDiv.innerHTML = data.mock_interview_questions.map(q => `
                <div class="question-card">${q}</div>
            `).join('');
        } else {
             interviewDiv.innerHTML = "<p>No questions generated.</p>";
        }
    }
});
