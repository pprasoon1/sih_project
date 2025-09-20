import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-pro",
});

const tools = [
  {
    type: "function",
    function: {
      name: "get_current_location",
      description: "Call this tool to request the user's current GPS location from their device.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "ask_for_photo",
      description: "After collecting the text details and location, call this tool to ask the user to upload a photo of the issue.",
      parameters: { type: "object", properties: {} },
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
          category: { type: "string", enum: ["pothole", "streetlight", "garbage", "water", "tree", "other"] },
          description: { type: "string", description: "A detailed description from the user." },
          latitude: { type: "number" },
          longitude: { type: "number" },
          mediaUrl: { type: "string", description: "The public URL of the uploaded image from Cloudinary." }
        },
        required: ["title", "category", "description", "latitude", "longitude", "mediaUrl"],
      },
    },
  },
];

const modelWithTools = model.bind({ tools });

export const processChatMessageStream = async (history) => {
  const userMessage = history.pop();

  const systemPrompt = `You are "CivicBot", a friendly AI assistant for reporting civic issues. Your goal is to guide the user to provide all necessary details. Follow these steps strictly:
  1. Greet the user and ask them to describe the problem.
  2. From their description, infer the title, description, and category. If the category is unclear, ask them to choose.
  3. Once you have the text details, you MUST call the "get_current_location" tool. Do not ask them to type their address.
  4. After the user's location is provided, confirm it with them.
  5. After location confirmation, you MUST call the "ask_for_photo" tool.
  6. After the user provides the photo URL, and you have all other details, you MUST call the "submit_report" tool.
  7. Be conversational and only ask one thing at a time.`;

  const conversation = [
    new AIMessage(systemPrompt),
    ...history.map(msg => msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)),
    new HumanMessage(userMessage.content),
  ];

  const stream = await modelWithTools.stream(conversation);
  return stream;
};