import { processChatMessage } from '../services/reportAgentService.js';

export const handleChatMessage = async (req, res) => {
    try {
        const { history } = req.body;
        const userId = req.user._id;

        if (!history || history.length === 0) {
            return res.status(400).json({ message: 'Chat history is required.' });
        }

        const agentResponse = await processChatMessage(history, userId);
        res.json(agentResponse);
    } catch (error) {
        console.error("Error in chat controller:", error);
        res.status(500).json({ message: "An error occurred with the AI agent." });
    }
};