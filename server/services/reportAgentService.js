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
      name: "get_current_location",
      description: "Automatically get the user's current GPS location. Call this immediately after processing the photo and description.",
      parameters: { 
        type: "object", 
        properties: {},
        required: []
      },
    },
  },
  {
    type: "function",
    function: {
      name: "display_extracted_info",
      description: "Display the extracted information (title, category, description) to the user with edit options that auto-disappear after 10 seconds.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Extracted title for the civic issue" },
          category: { 
            type: "string", 
            enum: ["pothole", "streetlight", "garbage", "water", "tree", "other"],
            description: "Extracted category of the civic issue"
          },
          description: { type: "string", description: "Extracted detailed description" },
          confidence: { type: "number", description: "Confidence level (0-1) of the extraction" }
        },
        required: ["title", "category", "description", "confidence"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "submit_report",
      description: "Submits the final report to the database once ALL information, including the mediaUrl, is collected.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "A short, descriptive title for the issue." },
          category: { 
            type: "string", 
            enum: ["pothole", "streetlight", "garbage", "water", "tree", "other"],
            description: "Category of the civic issue"
          },
          description: { type: "string", description: "A detailed description from the user." },
          latitude: { type: "number", description: "GPS latitude coordinate" },
          longitude: { type: "number", description: "GPS longitude coordinate" },
          mediaUrl: { type: "string", description: "The public URL of the uploaded image from Cloudinary." }
        },
        required: ["title", "category", "description", "latitude", "longitude", "mediaUrl"],
      },
    },
  },
];

const modelWithTools = model.bindTools(tools);

export const processChatMessageStream = async (history, sessionData = {}) => {
  try {
    const systemPrompt = `You are "CivicBot", a smart AI assistant for reporting civic issues. Your goal is to automatically process civic issue reports from photos and user descriptions.

NEW WORKFLOW (photo-first approach):
1. User uploads a photo and provides initial description
2. Automatically analyze the photo and description to extract:
   - Title (short, descriptive based on what you see)
   - Category (pothole, streetlight, garbage, water, tree, or other)
   - Detailed description (combine user input with photo analysis)
3. Automatically get user's current location using "get_current_location" tool
4. Display all extracted information with edit options that auto-disappear
5. Call "submit_report" with ALL required data once everything is processed
6. Confirm successful submission

IMPORTANT RULES:
- Be proactive and automatic - don't ask for confirmation unless user wants to edit
- Analyze the uploaded photo to understand the civic issue
- Extract as much information as possible from both photo and user description
- If user provides additional details, incorporate them into the description
- Always use the location tool to get GPS coordinates automatically
- Only ask for user input if information is unclear or missing
- Be conversational but efficient - minimize back-and-forth

Current session data: ${JSON.stringify(sessionData)}`;

    // Build conversation history
    const messages = [
      new SystemMessage(systemPrompt),
      ...history.map(msg => 
        msg.role === 'user' 
          ? new HumanMessage(msg.content) 
          : new AIMessage(msg.content)
      )
    ];

    const response = await modelWithTools.invoke(messages);
    return response;

  } catch (error) {
    console.error('Error in processChatMessageStream:', error);
    throw error;
  }
};