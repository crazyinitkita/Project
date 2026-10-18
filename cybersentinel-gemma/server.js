
import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Add GEMINI_API_KEY to your .env file");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const MODEL = "gemma-4-31b-it";

// Gemma on the current Google GenAI SDK expects structured user content.
// Passing a raw string can return a 500 INTERNAL error even when the API key
// and model are valid.
function userContent(text) {
  return [{
    role: "user",
    parts: [{ text }]
  }];
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/explain", async (req, res) => {
  try {
    const { prediction, evidence } = req.body;


    
    if (
      typeof prediction !== "string" ||
      !Array.isArray(evidence) ||
      !evidence.every(item => typeof item === "string")
    ) {
      return res.status(400).json({
        error: "Provide a prediction and evidence array."
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: userContent(`You are a cautious cybersecurity analyst.
Explain this model alert using only the provided evidence.
Do not invent facts. Give safe investigation steps.

Alert: ${prediction}
Evidence: ${JSON.stringify(evidence)}`)
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty explanation.");
    }

    res.json({ explanation: response.text });
  } catch (error) {
    console.error("Gemini API error:", error.message);

    res.status(502).json({
      error: "Gemini API request failed",
      details: error.message
    });
  }
});

app.post("/api/predict", async (req, res) => {
  try {
    const { features } = req.body;

    if (
      !features ||
      typeof features !== "object" ||
      Array.isArray(features)
    ) {
      return res.status(400).json({
        error: "Provide a features object containing the 78 network features."
      });
    }

    // Step 1: Get the prediction from FastAPI.
    const mlResponse = await fetch(
      "http://127.0.0.1:8000/predict",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features })
      }
    );

    const mlResult = await mlResponse.json();

    if (!mlResponse.ok) {
      return res.status(mlResponse.status).json({
        error: "ML prediction failed",
        details: mlResult
      });
    }

    // Step 2: Prepare evidence for Gemini.
    const evidence = [
      `Risk level: ${mlResult.risk_level}`,
      `Model score: ${mlResult.model_score}`,
      `Review required: ${mlResult.review_required}`,
      `Score note: ${mlResult.score_note}`,
      `Feature context: ${JSON.stringify(mlResult.top_feature_context)}`,
      mlResult.explanation_note
    ];

    // Step 3: Gemini is optional; prediction must survive its failure.
    let explanation;
    let explanationStatus = "available";

    try {
      const aiResponse = await ai.models.generateContent({
        model: MODEL,
        contents: userContent(`You are a cautious cybersecurity analyst.

Explain this machine-learning alert in simple language.
Use only the supplied evidence. Do not invent facts.
Do not treat model confidence as a guarantee of correctness.

Give a short explanation and safe investigation steps.

Prediction: ${mlResult.prediction}
Evidence: ${JSON.stringify(evidence)}`)
      });

      if (!aiResponse.text) {
        throw new Error("Gemini returned an empty explanation.");
      }

      explanation = aiResponse.text;
    } catch (aiError) {
      console.error("Gemini explanation unavailable:", aiError.message);

      explanationStatus = "unavailable";
      explanation =
        `The model predicted ${mlResult.prediction}. ` +
        `Risk level: ${mlResult.risk_level}. ` +
        (mlResult.review_required
          ? "This prediction requires review because its confidence is below the configured threshold. "
          : "This prediction passed the configured confidence threshold, but is not guaranteed correct. ") +
        "The AI explanation service is temporarily unavailable. " +
        "Review the prediction and network evidence before taking action.";
    }

    // Step 4: Return prediction and review fields to the caller.
    return res.json({
      prediction: mlResult.prediction,
      risk_level: mlResult.risk_level,
      review_required: mlResult.review_required,
      confidence_threshold: mlResult.confidence_threshold,
      model_score: mlResult.model_score,
      score_note: mlResult.score_note,
      top_feature_context: mlResult.top_feature_context,
      explanation_note: mlResult.explanation_note,
      explanation,
      explanation_status: explanationStatus
    });
  } catch (error) {
    console.error("Prediction pipeline error:", error.message);

    return res.status(502).json({
      error: "ML prediction failed",
      details: error.message
    });
  }
});

app.listen(Number(process.env.PORT) || 3000, () => {
  console.log("CyberSentinel running on http://localhost:3000");
});
