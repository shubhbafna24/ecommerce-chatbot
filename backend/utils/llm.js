// utils/llm.js
const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const groq = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: {
    Authorization: `Bearer ${GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  }
});

const askLLM = async (prompt, model = "llama3-70b-8192") => {
  try {
    const response = await groq.post('/chat/completions', {
      model,
      messages: [
        { role: 'system', content: 'You are a helpful eCommerce assistant. Answer clearly and ask clarifying questions if needed.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error('❌ Groq API error:', err.message);
    return 'Sorry, I’m having trouble thinking right now. Please try again later.';
  }
};

module.exports = askLLM;
