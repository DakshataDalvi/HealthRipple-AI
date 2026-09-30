// Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method Not Allowed' } });
  }

  const { prompt, expectJson = false, enableSearch = false } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: { message: 'Prompt is required' } });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return res.status(401).json({ error: { code: 'NO_API_KEY', message: 'Gemini API key is not configured on the server. Set GEMINI_API_KEY in Vercel.' } });
  }

  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  const url = `${GEMINI_API_URL}?key=${apiKey}`;

  const generationConfig = {
    temperature: 0.3,
    maxOutputTokens: 1024,
    topP: 0.8,
  };

  if (expectJson) {
    generationConfig.responseMimeType = "application/json";
  }

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };

  if (enableSearch) {
    payload.tools = [{ googleSearch: {} }];
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: { message: data?.error?.message ?? `HTTP ${response.status}`, status: response.status } });
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!rawText) {
      return res.status(500).json({ error: { code: 'EMPTY_RESPONSE', message: 'Gemini returned an empty response.' } });
    }

    return res.status(200).json({ text: rawText });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: { code: 'NETWORK_ERROR', message: 'Failed to connect to Gemini API.' } });
  }
}
