import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import {
  JsonOutputToolsParser,
  JsonOutputKeyToolsParser,
} from "langchain/output_parsers";
import { Report } from "../models/Report.js"; // Assuming you export your models
import { User } from "../models/User.js";

// 1. Initialize the AI Model
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  modelName: "gemini-pro",
});

// 2. Define the "Tools" the AI can use
const tools = [
  {
    type: "function",
    function: {
      name: "submit_report",
      description: "Submits the final report to the database once all information is collected.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "A short, descriptive title for the issue, e.g., 'Large pothole on Elm Street'." },
          category: {
            type: "string",
            enum: ["pothole", "streetlight", "garbage", "water", "tree", "other"],
            description: "The category of the civic issue."
          },
          description: { type: "string", description: "A detailed description of the issue provided by the user." },
          latitude: { type: "number", description: "The latitude of the issue's location." },
          longitude: { type: "number", description: "The longitude of the issue's location." }
        },
        required: ["title", "category", "description", "latitude", "longitude"],
      },
    },
  },
];

// Bind the tools to the model
const modelWithTools = model.bind({ tools });

// 3. Define the Agent's Logic
export const processChatMessage = async (history, userId) => {
  const userMessage = history.pop(); // Get the latest user message

  const systemPrompt = `You are a helpful and friendly AI assistant for "CivicVoice". Your goal is to help a citizen report a civic issue.
  1. Your primary goal is to collect enough information to call the "submit_report" function. You need a title, category, description, and location (latitude/longitude).
  2. Be conversational. Ask questions one at a time. Do not ask for all information at once.
  3. Start by asking for the nature of the problem. From their answer, infer the title, description, and potentially the category.
  4. If the category is not clear, ask the user to choose from the available options.
  5. Ask for their location. The user will provide latitude and longitude.
  6. Once you have all the necessary information, you MUST call the "submit_report" tool.
  7. Do not make up any information. If something is unclear, ask the user for clarification.
  `;

  const conversation = [
    new AIMessage(systemPrompt), // The agent's instructions
    ...history.map(msg => msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)),
    new HumanMessage(userMessage.content),
  ];

  const response = await modelWithTools.invoke(conversation);
  
  // 4. Check if the AI wants to use a tool
  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0];
    if (toolCall.name === "submit_report") {
      const { title, category, description, latitude, longitude } = toolCall.args;
      
      // Use the tool: Save the report to the database
      const report = await Report.create({
        title, category, description,
        reporterId: userId,
        location: { type: 'Point', coordinates: [longitude, latitude] },
        // For now, we'll skip the image. We can ask the user to upload it on a confirmation page.
      });

      // Award points
      await User.findByIdAndUpdate(userId, { $inc: { points: 5 } });
      
      // TODO: Notify Admins
      
      return {
        content: `Thank you! I've successfully submitted your report. Your report ID is ${report._id}. Is there anything else I can help you with?`,
        reportId: report._id, // Send back the reportId for a potential redirect
      };
    }
  }

  // 5. If no tool is used, just return the AI's conversational response
  return { content: response.content };
};