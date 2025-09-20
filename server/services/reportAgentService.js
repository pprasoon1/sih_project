// services/reportAgentService.js
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.0-flash-exp",
  temperature: 0.3,
});

const tools = [
  {
    type: "function",
    function: {
      name: "analyze_inputs",
      description: "Analyze the provided image and voice transcript to extract civic issue details",
      parameters: {
        type: "object",
        properties: {
          imageDescription: { type: "string", description: "Description of what's visible in the image" },
          voiceTranscript: { type: "string", description: "Transcript of the voice input" },
          location: { 
            type: "object", 
            properties: {
              latitude: { type: "number" },
              longitude: { type: "number" }
            }
          }
        },
        required: ["imageDescription", "voiceTranscript"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "extract_report_data",
      description: "Extract structured report data from the analysis",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Concise title for the issue" },
          description: { type: "string", description: "Detailed description of the issue" },
          category: { 
            type: "string", 
            enum: ["pothole", "streetlight", "garbage", "water", "tree", "other"],
            description: "Category of the civic issue"
          },
          urgency: { 
            type: "string", 
            enum: ["low", "medium", "high", "critical"],
            description: "Urgency level of the issue"
          },
          confidence: { type: "number", description: "Confidence score (0-1) in the analysis" }
        },
        required: ["title", "description", "category", "urgency", "confidence"]
      }
    }
  }
];

const modelWithTools = model.bindTools(tools);

export const processInputsAndAnalyze = async (imageDescription, voiceTranscript, location) => {
  try {
    const systemPrompt = `You are CivicBot, an AI agent that analyzes civic issues from images and voice descriptions.

Your task is to:
1. Analyze the image and voice input to understand the civic issue
2. Extract structured data for a civic report
3. Categorize the issue appropriately
4. Assess urgency level
5. Generate a clear title and detailed description

Available categories:
- pothole: Road damage, potholes, cracks
- streetlight: Street lighting issues, broken lights
- garbage: Waste management, illegal dumping, overflowing bins
- water: Water leaks, drainage issues, flooding
- tree: Fallen trees, dangerous branches, vegetation blocking roads
- other: Any other civic issue

Urgency levels:
- low: Minor issues, cosmetic problems
- medium: Issues that need attention but not immediately dangerous
- high: Issues that could cause safety problems
- critical: Immediate safety hazards

Be thorough in your analysis and provide detailed descriptions that will help authorities understand and address the issue effectively.`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`Please analyze this civic issue:
      
Image Description: ${imageDescription}
Voice Input: ${voiceTranscript}
Location: ${location ? `${location.latitude}, ${location.longitude}` : 'Not provided'}

Please extract structured report data from this information.`)
    ];

    const response = await modelWithTools.invoke(messages);
    return response;

  } catch (error) {
    console.error('Error in processInputsAndAnalyze:', error);
    throw error;
  }
};
