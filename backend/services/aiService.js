const OpenAI = require("openai");
const SYSTEM_PROMPT = require("../middleware/systemPrompt");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "SmartChain Hackathon Project",
  },
});

async function analyzeWithAI(inputData) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not set");
  }

  const prompt = `
Analyze this shipment:

Source: ${inputData.source}
Destination: ${inputData.destination}
Cargo: ${inputData.cargo}
Priority: ${inputData.priority}

Distance: ${inputData.distanceKm} km
Duration: ${inputData.durationHours} hours

Weather:
Temperature: ${inputData.weather.temperature}
Rain: ${inputData.weather.rain}
Wind Speed: ${inputData.weather.windSpeed}

Issues:
${inputData.weather.issues.join(", ") || "None"}

Give risk analysis and recommendation.
`;

  const response = await client.chat.completions.create({
    model: "openai/gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });

  let raw = response.choices[0].message.content;

  const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch (e) {
    throw new Error("AI returned invalid JSON");
  }
}

module.exports = { analyzeWithAI };