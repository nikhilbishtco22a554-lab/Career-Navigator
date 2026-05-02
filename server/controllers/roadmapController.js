const User = require('../models/User');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateRoadmap = async (req, res) => {
  try {
    const { currentSkills, targetRole } = req.body;

    const prompt = `You are a career advisor. Return ONLY a raw JSON object with no markdown, no backticks, no explanation.
The JSON must have this exact shape:
{
  "skillGaps": ["string"],
  "roadmap": [{ "week": number, "topic": "string", "resource": "string", "provider": "string" }],
  "interviewQuestions": ["string", "string", "string"],
  "estimatedWeeks": number
}
The user has these skills: ${JSON.stringify(currentSkills)}.
Their target role is: ${targetRole}.
Do NOT include any URLs or hyperlinks anywhere. Only use provider names like Coursera, freeCodeCamp, Udemy.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.choices[0].message.content.trim();
    const roadmap = JSON.parse(raw);

    await User.findByIdAndUpdate(req.userId, { savedRoadmap: roadmap });

    res.status(200).json(roadmap);
  } catch (err) {
    console.error('generateRoadmap error:', err.message);
    res.status(500).json({ error: true, message: 'Failed to generate roadmap' });
  }
};

exports.gradeAnswer = async (req, res) => {
  try {
    const { question, answer, targetRole } = req.body;

    const prompt = `You are an interview coach. Return ONLY a raw JSON object with no markdown, no backticks.
Shape: { "score": number (out of 10), "feedback": "2-3 lines of feedback" }
Question: ${question}
Candidate answer: ${answer}
Target role: ${targetRole}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.choices[0].message.content.trim();
    const result = JSON.parse(raw);

    res.status(200).json(result);
  } catch (err) {
    console.error('gradeAnswer error:', err.message);
    res.status(500).json({ error: true, message: 'Failed to grade answer' });
  }
};

exports.getMyRoadmap = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: true, message: 'User not found' });
    res.status(200).json(user.savedRoadmap || null);
  } catch (err) {
    res.status(500).json({ error: true, message: 'Failed to fetch roadmap' });
  }
};