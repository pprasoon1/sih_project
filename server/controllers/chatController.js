import { processChatMessageStream } from '../services/reportAgentService.js';
import Report from "../models/Report.js";
import User from "../models/User.js";

// Store session data (in production, use Redis or similar)
const sessionStore = new Map();

export const handleChatMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user._id;

        if (!message || !sessionId) {
            return res.status(400).json({ error: 'Message and sessionId are required' });
        }

        // Get or create session data
        let sessionData = sessionStore.get(sessionId) || {
            step: 'photo_upload',
            title: null,
            category: null,
            description: null,
            latitude: null,
            longitude: null,
            mediaUrl: null,
            extractedInfo: null,
            history: []
        };

        // Add user message to history
        sessionData.history.push({ role: 'user', content: message });

        // Process the message with AI
        const aiResponse = await processChatMessageStream(sessionData.history, sessionData);

        let responseContent = aiResponse.content || '';
        let toolCalls = aiResponse.tool_calls || [];

        // Handle tool calls
        if (toolCalls && toolCalls.length > 0) {
            const toolCall = toolCalls[0];
            
            switch (toolCall.name) {
                case 'get_current_location':
                    sessionData.step = 'awaiting_location';
                    responseContent += '\n\n📍 Getting your location automatically...';
                    
                    return res.json({
                        message: responseContent,
                        action: 'request_location',
                        sessionId: sessionId
                    });

                case 'display_extracted_info':
                    const { title, category, description, confidence } = toolCall.args;
                    sessionData.extractedInfo = { title, category, description, confidence };
                    sessionData.title = title;
                    sessionData.category = category;
                    sessionData.description = description;
                    sessionData.step = 'info_displayed';
                    
                    console.log('Updated session with extracted info:', JSON.stringify(sessionData, null, 2));
                    
                    responseContent = `🔍 **I've analyzed your photo and description:**\n\n**Title:** ${title}\n**Category:** ${category}\n**Description:** ${description}\n\n*Confidence: ${Math.round(confidence * 100)}%*\n\n⏰ You can edit any of these details in the next 10 seconds, or I'll proceed automatically.`;
                    
                    sessionStore.set(sessionId, sessionData);
                    return res.json({
                        message: responseContent,
                        action: 'display_extracted_info',
                        extractedInfo: { title, category, description, confidence },
                        sessionId: sessionId
                    });

                case 'submit_report':
                    try {
                        // Use session data if tool call args are missing
                        const title = toolCall.args?.title || sessionData.title || sessionData.extractedInfo?.title;
                        const category = toolCall.args?.category || sessionData.category || sessionData.extractedInfo?.category;
                        const description = toolCall.args?.description || sessionData.description || sessionData.extractedInfo?.description;
                        const latitude = toolCall.args?.latitude || sessionData.latitude;
                        const longitude = toolCall.args?.longitude || sessionData.longitude;
                        const mediaUrl = toolCall.args?.mediaUrl || sessionData.mediaUrl;
                        
                        console.log('Submit report data:', { title, category, description, latitude, longitude, mediaUrl });
                        
                        // Validate all required data
                        if (!title || !category || !description || !latitude || !longitude || !mediaUrl) {
                            throw new Error(`Missing required data for report submission: ${JSON.stringify({ title, category, description, latitude, longitude, mediaUrl })}`);
                        }

                        // Create the report
                        const report = await Report.create({
                            title,
                            category,
                            description,
                            reporterId: userId,
                            location: { 
                                type: 'Point', 
                                coordinates: [longitude, latitude] 
                            },
                            mediaUrls: [mediaUrl],
                            status: 'pending',
                            createdAt: new Date()
                        });

                        // Update user points
                        await User.findByIdAndUpdate(userId, { 
                            $inc: { points: 5 } 
                        });

                        // Clear session data
                        sessionStore.delete(sessionId);

                        responseContent = `✅ **Report Successfully Submitted!**\n\n**Report ID:** ${report._id}\n**Title:** ${title}\n**Category:** ${category}\n\nThank you for helping improve our community! You've earned 5 points. 🏆\n\nIs there anything else you'd like to report?`;

                        return res.json({
                            message: responseContent,
                            action: 'report_submitted',
                            reportId: report._id,
                            sessionId: sessionId
                        });

                    } catch (error) {
                        console.error('Error submitting report:', error);
                        responseContent = '❌ Sorry, there was an error submitting your report. Please try again.';
                        
                        return res.json({
                            message: responseContent,
                            action: 'error',
                            sessionId: sessionId
                        });
                    }
            }
        }

        // Add AI response to history
        sessionData.history.push({ role: 'assistant', content: responseContent });
        sessionStore.set(sessionId, sessionData);

        return res.json({
            message: responseContent,
            sessionId: sessionId
        });

    } catch (error) {
        console.error("Error in chat message handler:", error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: 'Sorry, I encountered an error. Please try again.'
        });
    }
};

export const handleLocationUpdate = async (req, res) => {
    try {
        const { latitude, longitude, sessionId } = req.body;
        const userId = req.user._id;

        if (!latitude || !longitude || !sessionId) {
            return res.status(400).json({ error: 'Location data and sessionId are required' });
        }

        let sessionData = sessionStore.get(sessionId);
        if (!sessionData) {
            return res.status(400).json({ error: 'Invalid session' });
        }

        // Update session with location data
        sessionData.latitude = latitude;
        sessionData.longitude = longitude;
        sessionData.step = 'location_received';

        // Add location confirmation to history
        const locationMessage = `📍 Location received: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        sessionData.history.push({ role: 'user', content: locationMessage });

        // Automatically submit the report since we have all required data
        const title = sessionData.title || sessionData.extractedInfo?.title;
        const category = sessionData.category || sessionData.extractedInfo?.category;
        const description = sessionData.description || sessionData.extractedInfo?.description;
        const mediaUrl = sessionData.mediaUrl;
        
        console.log('Auto-submitting report with session data:', { title, category, description, latitude, longitude, mediaUrl });
        
        // Validate we have all required data
        if (!title || !category || !description || !mediaUrl) {
            console.error('Missing required data for auto-submission:', { title, category, description, mediaUrl });
            return res.status(400).json({ 
                error: 'Missing required data for report submission',
                message: 'Some required information is missing. Please try again.'
            });
        }
        
        try {
            // Create the report
            const report = await Report.create({
                title,
                category,
                description,
                reporterId: userId,
                location: { 
                    type: 'Point', 
                    coordinates: [longitude, latitude] 
                },
                mediaUrls: [mediaUrl],
                status: 'pending',
                createdAt: new Date()
            });

            // Update user points
            await User.findByIdAndUpdate(userId, { 
                $inc: { points: 5 } 
            });

            // Clear session data
            sessionStore.delete(sessionId);

            const responseContent = `✅ **Report Successfully Submitted!**\n\n**Report ID:** ${report._id}\n**Title:** ${title}\n**Category:** ${category}\n\nThank you for helping improve our community! You've earned 5 points. 🏆\n\nIs there anything else you'd like to report?`;

            return res.json({
                message: responseContent,
                action: 'report_submitted',
                reportId: report._id,
                sessionId: sessionId
            });

        } catch (error) {
            console.error('Error auto-submitting report from location update:', error);
            return res.status(500).json({ 
                error: 'Failed to submit report',
                message: '❌ Sorry, there was an error submitting your report. Please try again.'
            });
        }

    } catch (error) {
        console.error("Error handling location update:", error);
        return res.status(500).json({ error: 'Failed to process location' });
    }
};

export const handlePhotoWithDescription = async (req, res) => {
    try {
        const { mediaUrl, description, sessionId } = req.body;

        if (!mediaUrl || !sessionId) {
            return res.status(400).json({ error: 'Photo URL, description, and sessionId are required' });
        }

        let sessionData = sessionStore.get(sessionId);
        if (!sessionData) {
            sessionData = {
                step: 'photo_upload',
                title: null,
                category: null,
                description: null,
                latitude: null,
                longitude: null,
                mediaUrl: null,
                extractedInfo: null,
                history: []
            };
        }

        // Update session with photo and description
        sessionData.mediaUrl = mediaUrl;
        sessionData.step = 'photo_processed';
        sessionData.description = description;
        
        console.log('Updated session data:', JSON.stringify(sessionData, null, 2));

        // Add photo and description to history
        const photoMessage = `📷 Photo uploaded: ${mediaUrl}\n📝 Description: ${description}`;
        sessionData.history.push({ role: 'user', content: photoMessage });

        // Process with AI to extract information
        const aiResponse = await processChatMessageStream(sessionData.history, sessionData);
        
        console.log('AI Response:', JSON.stringify(aiResponse, null, 2));
        
        let responseContent = aiResponse.content || '';
        let toolCalls = aiResponse.tool_calls || [];

        // Handle tool calls
        if (toolCalls && toolCalls.length > 0) {
            const toolCall = toolCalls[0];
            
            switch (toolCall.name) {
                case 'display_extracted_info':
                    const { title, category, description: extractedDesc, confidence } = toolCall.args;
                    sessionData.extractedInfo = { title, category, description: extractedDesc, confidence };
                    sessionData.step = 'info_displayed';
                    
                    responseContent = `🔍 **I've analyzed your photo and description:**\n\n**Title:** ${title}\n**Category:** ${category}\n**Description:** ${extractedDesc}\n\n*Confidence: ${Math.round(confidence * 100)}%*\n\n⏰ You can edit any of these details in the next 10 seconds, or I'll proceed automatically.`;
                    
                    sessionStore.set(sessionId, sessionData);
                    return res.json({
                        message: responseContent,
                        action: 'display_extracted_info',
                        extractedInfo: { title, category, description: extractedDesc, confidence },
                        sessionId: sessionId
                    });

                case 'get_current_location':
                    sessionData.step = 'awaiting_location';
                    responseContent += '\n\n📍 Getting your location automatically...';
                    
                    sessionStore.set(sessionId, sessionData);
                    return res.json({
                        message: responseContent,
                        action: 'request_location',
                        sessionId: sessionId
                    });
            }
        }

        // Add AI response to history
        sessionData.history.push({ role: 'assistant', content: responseContent });
        sessionStore.set(sessionId, sessionData);

        return res.json({
            message: responseContent,
            sessionId: sessionId
        });

    } catch (error) {
        console.error("Error handling photo with description:", error);
        return res.status(500).json({ error: 'Failed to process photo and description' });
    }
};

export const handlePhotoUpdate = async (req, res) => {
    try {
        const { mediaUrl, sessionId } = req.body;

        if (!mediaUrl || !sessionId) {
            return res.status(400).json({ error: 'Photo URL and sessionId are required' });
        }

        let sessionData = sessionStore.get(sessionId);
        if (!sessionData) {
            return res.status(400).json({ error: 'Invalid session' });
        }

        // Update session with photo data
        sessionData.mediaUrl = mediaUrl;
        sessionData.step = 'photo_received';

        // Add photo confirmation to history
        const photoMessage = `📷 Photo uploaded successfully`;
        sessionData.history.push({ role: 'user', content: photoMessage });

        // Process final submission with AI
        const aiResponse = await processChatMessageStream(sessionData.history, sessionData);
        
        // The AI should now call submit_report tool
        if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
            const toolCall = aiResponse.tool_calls[0];
            if (toolCall.name === 'submit_report') {
                // Handle the submission (this will trigger the submit_report case above)
                req.body = { 
                    message: 'Submit the report now', 
                    sessionId 
                };
                return handleChatMessage(req, res);
            }
        }

        return res.json({
            message: 'Photo received! Processing your report...',
            sessionId: sessionId
        });

    } catch (error) {
        console.error("Error handling photo update:", error);
        return res.status(500).json({ error: 'Failed to process photo' });
    }
};

// Clear session data (cleanup endpoint)
export const clearSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        sessionStore.delete(sessionId);
        return res.json({ message: 'Session cleared' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to clear session' });
    }
};
