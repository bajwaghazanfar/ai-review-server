const { GoogleGenerativeAI } = require("@google/generative-ai");
const gemini_api_key = "AIzaSyAt4hRV4l-0PNOMT8iJaf263exM9Sp85vA";
const googleAI = new GoogleGenerativeAI(gemini_api_key);
const geminiConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 4096,
};
const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-pro",
  geminiConfig,
});

module.exports = { geminiModel: geminiModel };
