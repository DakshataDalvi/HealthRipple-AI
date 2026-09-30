export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: { message: 'Method Not Allowed' } }),
    };
  }

  try {
    const { prompt, expectJson = false, enableSearch = false } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: { message: 'Prompt is required' } }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: { code: 'NO_API_KEY', message: 'Gemini API key is not configured on the server. Set GEMINI_API_KEY in Netlify.' } }),
      };
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

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: { message: data?.error?.message ?? `HTTP ${response.status}`, status: response.status } }),
      };
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!rawText) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: { code: 'EMPTY_RESPONSE', message: 'Gemini returned an empty response.' } }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ text: rawText }),
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { code: 'NETWORK_ERROR', message: 'Failed to connect to Gemini API.' } }),
    };
  }
};
