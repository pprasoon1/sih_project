import { processChatMessageStream } from '../services/reportAgentService.js';
import Report from "../models/Report.js";
import User from "../models/User.js";

export const handleChatMessage = async (req, res) => {
    try {
        const { history } = req.body;
        const userId = req.user._id;

        // Set headers for a Server-Sent Events (SSE) stream
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const stream = await processChatMessageStream(history);

        let toolCalls = [];

        // Iterate over the stream from the AI
        for await (const chunk of stream) {
            if (chunk.tool_calls) {
                toolCalls.push(...(chunk.tool_calls));
            }
            if (chunk.content) {
                res.write(chunk.content);
            }
        }

        // After the stream is finished, check if a tool needs to be executed
        if (toolCalls.length > 0) {
            const toolCall = toolCalls[0];
            if (toolCall.name === "submit_report") {
                const { title, category, description, latitude, longitude, mediaUrl } = toolCall.args;
                
                const report = await Report.create({
                    title, category, description, reporterId: userId,
                    location: { type: 'Point', coordinates: [longitude, latitude] },
                    mediaUrls: [mediaUrl],
                });
                await User.findByIdAndUpdate(userId, { $inc: { points: 5 } });
                
                res.write(`\nReport submitted with ID: ${report._id}. Thank you for your contribution!`);
            } else {
                // For other tools (location, photo), send a special signal to the frontend
                const toolResponse = JSON.stringify({ tool_calls: toolCalls });
                res.write(`\n<TOOL_CALL>${toolResponse}</TOOL_CALL>`);
            }
        }
        
        res.end(); // End the response stream

    } catch (error) {
        console.error("Error in chat stream controller:", error);
        res.end();
    }
};