// server.js (restructured to function-based style)
const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const cors = require('cors');
const pdfParse = require('pdf-parse');
require("dotenv").config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = process.env.GROQ_API_KEY;

function createApp() {
  const app = express();
  app.use(fileUpload());
  app.use(cors());
  app.use(express.json());

  app.post('/upload', handleUpload);
  app.post('/analyze-resume', handleAnalyzeResume);

  return app;
}

// Helper: Rate limiting delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Handler: /upload
async function handleUpload(req, res) {
  try {
    const pdf = req.files.resume;
    const data = await pdfParse(pdf);
    const text = data.text;

    const email = text.match(/[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0] || '';
    const phone = text.match(/\+?\d{10,13}/)?.[0] || '';
    const linkedIn = text.match(/linkedin\.com\/[^\s]+/i)?.[0] || '';
    const github = text.match(/github\.com\/[^\s]+/i)?.[0] || '';
    const name = text.split('\n')[0];

    res.json({
      name,
      email,
      phone,
      linkedIn,
      github,
      summary: text.slice(0, 300)
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to parse PDF" });
  }
}

// Function: Call Groq API with retry
async function callGroqWithRetry(prompt, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to call Groq API...`);
      const response = await axios.post(GROQ_API_URL, {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a professional resume reviewer and career coach specializing in tech industry recruitment. Provide detailed, actionable feedback."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data?.choices?.[0]?.message?.content;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.response?.status, error.response?.statusText,error.response?.data);

      if (error.response?.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Rate limit hit. Waiting ${waitTime / 1000} seconds before retry...`);
        if (attempt < maxRetries) {
          await delay(waitTime);
          continue;
        } else {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
      } else if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your Groq API key.');
      } else {
        throw error;
      }
    }
  }
}

// Handler: /analyze-resume
async function handleAnalyzeResume(req, res) {
  const resumeData = req.body;

  if (!resumeData || Object.keys(resumeData).length === 0) {
    return res.status(400).json({ error: "No resume data provided" });
  }

  const prompt = `
Analyze this resume data and provide 5 personalized improvement tips for tech jobs:

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Requirements:
1. Give 5 specific, actionable suggestions
2. Explain why each is important for tech roles
3. Use numbered format for clarity
4. Focus on content, keywords, and structure
5. Make it personalized to the actual data provided

Be practical and direct in your advice.
`;

  try {
    const tips = await callGroqWithRetry(prompt);

    if (!tips) {
      return res.status(500).json({ error: "No response from Groq API" });
    }

    res.json({ tips });
  } catch (err) {
    console.error("Error analyzing resume:", err.message);

    if (err.message.includes('Rate limit')) {
      res.status(429).json({
        error: "API rate limit exceeded. Please wait a moment and try again."
      });
    } else if (err.message.includes('Invalid API key')) {
      res.status(401).json({ error: "Invalid API key configuration" });
    } else {
      res.status(500).json({ error: "Failed to analyze resume" });
    }
  }
}

// Main entry point
function main() {
  const app = createApp();
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log("Using Groq API for resume analysis");
  });
}

main();
