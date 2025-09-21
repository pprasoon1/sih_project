import { GoogleGenerativeAI } from '@langchain/google-genai';
import { GoogleCloudSpeechToText } from '@google-cloud/speech';
import { createReadStream } from 'fs';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize AI services
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const speechClient = new GoogleCloudSpeechToText();

/**
 * Agent Service for AI-powered civic issue reporting
 * Handles image analysis, voice processing, and intelligent categorization
 */
class AgentService {
  constructor() {
    this.supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    this.supportedAudioTypes = ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/webm'];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
  }

  /**
   * Analyze image to extract issue information
   * @param {Buffer} imageBuffer - Image file buffer
   * @param {string} mimeType - Image MIME type
   * @returns {Object} Analysis result with title, description, and category
   */
  async analyzeImage(imageBuffer, mimeType) {
    try {
      if (!this.supportedImageTypes.includes(mimeType)) {
        throw new Error(`Unsupported image type: ${mimeType}`);
      }

      if (imageBuffer.length > this.maxFileSize) {
        throw new Error('Image file too large. Maximum size is 10MB.');
      }

      // Convert buffer to base64 for Gemini API
      const base64Image = imageBuffer.toString('base64');
      
      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Analyze this image of a civic infrastructure issue and provide:
        1. A concise title (max 50 characters)
        2. A detailed description of the issue
        3. The most appropriate category from: pothole, streetlight, garbage, water, tree, other
        
        Focus on:
        - What type of infrastructure problem is visible
        - Severity and potential impact
        - Specific details that would help city workers understand the issue
        
        Respond in JSON format:
        {
          "title": "Brief descriptive title",
          "description": "Detailed description of the issue",
          "category": "one of the specified categories",
          "confidence": 0.0-1.0,
          "severity": "low|medium|high|critical",
          "suggestedPriority": "low|medium|high"
        }
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        }
      ]);

      const response = await result.response;
      const analysisText = response.text();
      
      // Parse JSON response
      const analysis = JSON.parse(analysisText);
      
      // Validate and sanitize response
      return this.validateAnalysisResult(analysis);
      
    } catch (error) {
      console.error('Image analysis error:', error);
      
      // Return fallback analysis
      return {
        title: 'Infrastructure Issue Detected',
        description: 'An infrastructure issue has been identified in the uploaded image. Please review and provide additional details if needed.',
        category: 'other',
        confidence: 0.3,
        severity: 'medium',
        suggestedPriority: 'medium',
        error: 'AI analysis failed, using fallback'
      };
    }
  }

  /**
   * Process voice input to extract issue information
   * @param {Buffer} audioBuffer - Audio file buffer
   * @param {string} mimeType - Audio MIME type
   * @returns {Object} Transcription and analysis result
   */
  async processVoiceInput(audioBuffer, mimeType) {
    try {
      if (!this.supportedAudioTypes.includes(mimeType)) {
        throw new Error(`Unsupported audio type: ${mimeType}`);
      }

      // Save audio to temporary file
      const tempFilePath = path.join(__dirname, '../uploads', `temp_${Date.now()}.wav`);
      await this.saveBufferToFile(audioBuffer, tempFilePath);

      // Configure speech recognition
      const audio = {
        content: audioBuffer.toString('base64')
      };

      const config = {
        encoding: this.getAudioEncoding(mimeType),
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        model: 'latest_long'
      };

      const request = {
        audio: audio,
        config: config,
      };

      // Perform speech recognition
      const [response] = await speechClient.recognize(request);
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

      // Clean up temporary file
      await unlink(tempFilePath);

      if (!transcription.trim()) {
        throw new Error('No speech detected in audio');
      }

      // Analyze transcription for issue information
      const analysis = await this.analyzeText(transcription);

      return {
        transcription: transcription.trim(),
        title: analysis.title,
        description: analysis.description,
        category: analysis.category,
        confidence: analysis.confidence,
        severity: analysis.severity,
        suggestedPriority: analysis.suggestedPriority
      };

    } catch (error) {
      console.error('Voice processing error:', error);
      throw new Error(`Voice processing failed: ${error.message}`);
    }
  }

  /**
   * Analyze text input to extract issue information
   * @param {string} text - Text description
   * @returns {Object} Analysis result
   */
  async analyzeText(text) {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Empty text input');
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Analyze this civic issue description and extract:
        1. A concise title (max 50 characters)
        2. A detailed description (expand if needed)
        3. The most appropriate category from: pothole, streetlight, garbage, water, tree, other
        4. Severity assessment
        5. Priority suggestion
        
        Text: "${text}"
        
        Respond in JSON format:
        {
          "title": "Brief descriptive title",
          "description": "Detailed description of the issue",
          "category": "one of the specified categories",
          "confidence": 0.0-1.0,
          "severity": "low|medium|high|critical",
          "suggestedPriority": "low|medium|high"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();
      
      const analysis = JSON.parse(analysisText);
      return this.validateAnalysisResult(analysis);

    } catch (error) {
      console.error('Text analysis error:', error);
      
      // Return fallback analysis
      return {
        title: this.extractTitleFromText(text),
        description: text,
        category: 'other',
        confidence: 0.5,
        severity: 'medium',
        suggestedPriority: 'medium',
        error: 'AI analysis failed, using fallback'
      };
    }
  }

  /**
   * Validate and sanitize analysis result
   * @param {Object} analysis - Raw analysis result
   * @returns {Object} Validated analysis result
   */
  validateAnalysisResult(analysis) {
    const validCategories = ['pothole', 'streetlight', 'garbage', 'water', 'tree', 'other'];
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    const validPriorities = ['low', 'medium', 'high'];

    return {
      title: this.sanitizeText(analysis.title || 'Issue Detected', 50),
      description: this.sanitizeText(analysis.description || 'Issue description', 500),
      category: validCategories.includes(analysis.category) ? analysis.category : 'other',
      confidence: Math.max(0, Math.min(1, parseFloat(analysis.confidence) || 0.5)),
      severity: validSeverities.includes(analysis.severity) ? analysis.severity : 'medium',
      suggestedPriority: validPriorities.includes(analysis.suggestedPriority) ? analysis.suggestedPriority : 'medium',
      originalAnalysis: analysis
    };
  }

  /**
   * Extract title from text (fallback method)
   * @param {string} text - Input text
   * @returns {string} Extracted title
   */
  extractTitleFromText(text) {
    if (!text) return 'Issue Reported';
    
    // Take first 50 characters and clean up
    const title = text.substring(0, 50).trim();
    return title.endsWith('.') ? title.slice(0, -1) : title;
  }

  /**
   * Sanitize text input
   * @param {string} text - Input text
   * @param {number} maxLength - Maximum length
   * @returns {string} Sanitized text
   */
  sanitizeText(text, maxLength = 1000) {
    if (!text) return '';
    
    return text
      .replace(/[<>]/g, '') // Remove potential HTML
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, maxLength);
  }

  /**
   * Get audio encoding from MIME type
   * @param {string} mimeType - Audio MIME type
   * @returns {string} Audio encoding
   */
  getAudioEncoding(mimeType) {
    const encodingMap = {
      'audio/wav': 'LINEAR16',
      'audio/mp3': 'MP3',
      'audio/m4a': 'MP3',
      'audio/webm': 'WEBM_OPUS'
    };
    
    return encodingMap[mimeType] || 'LINEAR16';
  }

  /**
   * Save buffer to temporary file
   * @param {Buffer} buffer - File buffer
   * @param {string} filePath - File path
   * @returns {Promise} Save operation
   */
  async saveBufferToFile(buffer, filePath) {
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      writeStream.write(buffer);
      writeStream.end();
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }

  /**
   * Get processing statistics
   * @returns {Object} Processing statistics
   */
  getStats() {
    return {
      supportedImageTypes: this.supportedImageTypes,
      supportedAudioTypes: this.supportedAudioTypes,
      maxFileSize: this.maxFileSize,
      services: {
        imageAnalysis: 'Google Gemini 1.5 Flash',
        voiceProcessing: 'Google Cloud Speech-to-Text',
        textAnalysis: 'Google Gemini 1.5 Flash'
      }
    };
  }
}

export default new AgentService();
