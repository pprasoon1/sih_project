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
      description: "Call this tool to request the user's current GPS location from their device.",
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
      name: "ask_for_photo",
      description: "After collecting the text details and location, call this tool to ask the user to upload a photo of the issue.",
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
    const systemPrompt = `You are "CivicBot", a friendly AI assistant for reporting civic issues. Your goal is to guide users through the complete process of submitting a civic issue report.

WORKFLOW STEPS (follow strictly in order):
1. Greet the user warmly and ask them to describe the civic issue they want to report
2. From their description, extract and confirm:
   - Title (short, descriptive)
   - Category (pothole, streetlight, garbage, water, tree, or other)
   - Detailed description
3. Once text details are confirmed, call "get_current_location" tool to get GPS coordinates
4. After location is obtained, confirm the location with the user
5. Call "ask_for_photo" tool to request a photo of the issue
6. After photo is uploaded, call "submit_report" with ALL required data
7. Confirm successful submission

IMPORTANT RULES:
- Be conversational and friendly
- Ask only ONE question at a time
- Don't proceed to next step until current step is complete
- Always confirm details with the user before moving forward
- If category is unclear from description, ask user to choose from the available options
- Don't ask users to manually type their address - always use the location tool

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