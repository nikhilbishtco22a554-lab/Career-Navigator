const OpenAI = require('openai');
const User = require('../models/User');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const extractResponseText = (response) => {
  if (!response?.output) {
    return '';
  }

  return response.output
    .map((item) => {
      if (!item?.content) {
        return item?.text || '';
      }
      return item.content.map((block) => block?.text || '').join('');
    })
    .join('');
};

const buildPrompt = (currentSkills, targetRole) => {
  return `You are an AI career assistant. Generate ONLY a single JSON object with no markdown and no explanation.
The JSON must use this exact structure:
{
  "skillGaps": ["skill1", "skill2"],
  "roadmap": [{ "week": 1, "topic": "string", "resource": "string", "provider": "string" }],
  "interviewQuestions": ["q1", "q2", "q3"],
  "estimatedWeeks": number
}
Do NOT include any URLs or hyperlinks.
For resources, only include the topic name and provider, for example:
  "resource": "React hooks deep dive"
  "provider": "freeCodeCamp"
Use this user information exactly:
Current skills: ${JSON.stringify(currentSkills)}
Target role: ${targetRole}`;
};

exports.generateRoadmap = async (req, res) => {
  try {
    const { currentSkills, targetRole } = req.body;

    if (!Array.isArray(currentSkills) || currentSkills.length === 0 || !targetRole) {
      return res.status(400).json({ error: true, message: 'currentSkills array and targetRole are required.' });
    }

    const prompt = buildPrompt(currentSkills, targetRole);

    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
      max_tokens: 1000,
    });

    const rawText = extractResponseText(response).trim();

    let roadmapData;
    try {
      roadmapData = JSON.parse(rawText);
    } catch (parseError) {
      return res.status(500).json({ error: true, message: 'Unable to parse OpenAI response as JSON.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found.' });
    }

    user.savedRoadmap = roadmapData;
    await user.save();

    return res.json({ roadmap: roadmapData });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message || 'Roadmap generation failed.' });
  }
};

exports.getMyRoadmap = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('savedRoadmap');

    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found.' });
    }

    return res.json({ roadmap: user.savedRoadmap || null });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message || 'Unable to fetch saved roadmap.' });
  }
};

exports.gradeAnswer = async (req, res) => {
  try {
    const { question, answer, targetRole } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: true, message: 'Question and answer are required.' });
    }

    const prompt = `You are an expert interviewer for the role ${targetRole || 'the target role'}. Evaluate the candidate answer to the interview question below. Return ONLY a JSON object with no markdown or extra explanation in this format:\n{\n  "feedback": "string"\n}\nQuestion: ${question}\nAnswer: ${answer}`;

    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
      max_tokens: 400,
    });

    const rawText = extractResponseText(response).trim();

    let feedbackData;
    try {
      feedbackData = JSON.parse(rawText);
    } catch (parseError) {
      return res.status(500).json({ error: true, message: 'Unable to parse OpenAI response as JSON.' });
    }

    return res.json({ feedback: feedbackData.feedback || 'No feedback available.' });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message || 'Answer grading failed.' });
  }
};
