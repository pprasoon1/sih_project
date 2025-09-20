import { processInputsAndAnalyze } from '../services/reportAgentService.js';
import Report from "../models/Report.js";
import User from "../models/User.js";
import { createAndEmitNotification } from "../utils/notificationHelper.js";

// Store processing sessions
const processingSessions = new Map();

export const initializeAgenticReport = async (req, res) => {
  try {
    const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Initialize session
    processingSessions.set(sessionId, {
      userId: req.user._id,
      stage: 'collecting_inputs',
      inputs: {
        image: null,
        voiceTranscript: null,
        location: null
      },
      analysisResult: null,
      reportData: null,
      createdAt: new Date()
    });

    res.json({
      success: true,
      sessionId,
      message: "Session initialized. Please provide image and voice input.",
      stage: 'collecting_inputs'
    });

  } catch (error) {
    console.error('Error initializing agentic report:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize session' });
  }
};

export const uploadInputs = async (req, res) => {
  try {
    const { sessionId, voiceTranscript } = req.body;
    const session = processingSessions.get(sessionId);

    if (!session || session.userId.toString() !== req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid session' });
    }

    // Handle image upload
    let mediaUrl = null;
    if (req.file) {
      // Use your existing cloudinary upload
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      mediaUrl = uploadResult.secure_url;
    }

    // Get location
    let location = null;
    if (req.body.latitude && req.body.longitude) {
      location = {
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude)
      };
    }

    // Update session with inputs
    session.inputs = {
      image: mediaUrl,
      voiceTranscript: voiceTranscript || '',
      location: location
    };
    session.stage = 'analyzing';

    // Analyze inputs using AI
    try {
      const analysisResult = await processInputsAndAnalyze(
        mediaUrl ? 'Image provided showing a civic issue' : 'No image provided',
        voiceTranscript || 'No voice input provided',
        location
      );

      session.analysisResult = analysisResult;
      session.stage = 'analysis_complete';

      // Extract report data from AI response
      let reportData = null;
      if (analysisResult.tool_calls && analysisResult.tool_calls.length > 0) {
        const extractTool = analysisResult.tool_calls.find(call => call.name === 'extract_report_data');
        if (extractTool) {
          reportData = extractTool.args;
        }
      }

      if (!reportData) {
        // Fallback extraction if tool call fails
        reportData = {
          title: 'Civic Issue Report',
          description: voiceTranscript || 'Issue reported via image',
          category: 'other',
          urgency: 'medium',
          confidence: 0.5
        };
      }

      session.reportData = reportData;
      session.stage = 'ready_to_submit';

      processingSessions.set(sessionId, session);

      res.json({
        success: true,
        sessionId,
        stage: 'ready_to_submit',
        reportData,
        analysisResult: analysisResult.content || 'Analysis completed',
        editTimer: 15000 // 15 seconds to edit
      });

    } catch (analysisError) {
      console.error('Analysis error:', analysisError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to analyze inputs',
        error: analysisError.message 
      });
    }

  } catch (error) {
    console.error('Error processing inputs:', error);
    res.status(500).json({ success: false, message: 'Failed to process inputs' });
  }
};

export const editReportData = async (req, res) => {
  try {
    const { sessionId, updates } = req.body;
    const session = processingSessions.get(sessionId);

    if (!session || session.userId.toString() !== req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid session' });
    }

    if (session.stage !== 'ready_to_submit') {
      return res.status(400).json({ success: false, message: 'Session not ready for edits' });
    }

    // Update report data
    session.reportData = { ...session.reportData, ...updates };
    processingSessions.set(sessionId, session);

    res.json({
      success: true,
      reportData: session.reportData,
      message: 'Report data updated successfully'
    });

  } catch (error) {
    console.error('Error editing report data:', error);
    res.status(500).json({ success: false, message: 'Failed to update report data' });
  }
};

export const submitAgenticReport = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = processingSessions.get(sessionId);

    if (!session || session.userId.toString() !== req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid session' });
    }

    const { reportData, inputs } = session;
    
    if (!reportData) {
      return res.status(400).json({ success: false, message: 'No report data to submit' });
    }

    // Create coordinates array
    const coordinates = inputs.location ? 
      [inputs.location.longitude, inputs.location.latitude] : 
      [0, 0]; // Default coordinates if location not available

    // Create report using existing system
    const report = await Report.create({
      reporterId: session.userId,
      title: reportData.title,
      description: reportData.description,
      category: reportData.category,
      location: { type: "Point", coordinates },
      mediaUrls: inputs.image ? [inputs.image] : [],
      urgency: reportData.urgency || 'medium',
      metadata: {
        confidence: reportData.confidence,
        processingMethod: 'agentic',
        voiceTranscript: inputs.voiceTranscript,
        analysisResult: session.analysisResult?.content || ''
      }
    });

    const reportToEmit = await Report.findById(report._id).populate("reporterId", "name email");

    // Handle real-time events and notifications (same as existing system)
    req.io.emit("newReport", reportToEmit);

    const admins = await User.find({ role: 'admin' });
    const notificationTitle = "New Agentic Report Submitted";
    const notificationBody = `An AI-processed report "${report.title}" was submitted by ${req.user.name}.`;

    admins.forEach(admin => {
      createAndEmitNotification(req.io, admin._id, notificationTitle, notificationBody, report._id);
    });

    // Award points
    await User.findByIdAndUpdate(session.userId, { $inc: { points: 10 } }); // More points for agentic reports

    // Check for badges
    const reportCount = await Report.countDocuments({ reporterId: session.userId });
    if (reportCount === 1) {
      await User.findByIdAndUpdate(session.userId, { $addToSet: { badges: 'first_report' } });
    }

    // Clean up session
    processingSessions.delete(sessionId);

    res.json({
      success: true,
      report: reportToEmit,
      message: 'Report submitted successfully! +10 points earned.',
      pointsEarned: 10
    });

  } catch (error) {
    console.error('Error submitting agentic report:', error);
    res.status(500).json({ success: false, message: 'Failed to submit report' });
  }
};

export const getSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = processingSessions.get(sessionId);

    if (!session || session.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({
      success: true,
      sessionId,
      stage: session.stage,
      reportData: session.reportData,
      analysisResult: session.analysisResult?.content || null
    });

  } catch (error) {
    console.error('Error getting session status:', error);
    res.status(500).json({ success: false, message: 'Failed to get session status' });
  }
};

// Clean up old sessions periodically
setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of processingSessions.entries()) {
    if (now - session.createdAt > 30 * 60 * 1000) { // 30 minutes
      processingSessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes
