# Agent Report Flow Component

## Overview

The `AgentReportFlow` component provides an intelligent, guided workflow for civic issue reporting. It automates the reporting process by accepting multiple input modalities (image, voice, text) and using AI to extract relevant information, while maintaining compatibility with the existing backend API.

## Features

### 🤖 Agent Workflow
- **Step-by-step guidance** with visual progress indicators
- **Auto-advance timers** (5-second countdown) with pause/resume controls
- **Retry and cancel** options at any step
- **Seamless integration** with existing report submission API

### 📸 Smart Image Analysis
- **AI-powered image processing** to extract issue category and description
- **Automatic categorization** based on visual content
- **OCR capabilities** for text extraction from images
- **Mock implementation** ready for real AI service integration

### 🎤 Voice Recognition
- **Speech-to-text transcription** using Web Speech API
- **Real-time voice input** with visual feedback
- **Automatic title extraction** from voice descriptions
- **Fallback to text input** if voice recognition fails

### 📍 Location Services
- **Automatic geolocation** detection using browser API
- **Coordinate extraction** and validation
- **Location confirmation** step for accuracy
- **Error handling** for location access denial

### ✅ Confirmation & Submission
- **Editable preview** of all extracted information
- **Manual override** capabilities for any field
- **Media file management** with multiple upload support
- **Auto-submission** with existing API endpoints

## Usage

### Basic Integration

```jsx
import AgentReportFlow from './components/AgentReportFlow';

const MyComponent = () => {
  const handleComplete = (reportData) => {
    console.log('Report completed:', reportData);
    // Handle successful submission
  };

  const handleCancel = () => {
    console.log('User cancelled');
    // Handle cancellation
  };

  return (
    <AgentReportFlow 
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
};
```

### With Modal Integration

```jsx
import { useState } from 'react';
import AgentReportFlow from './components/AgentReportFlow';

const MyPage = () => {
  const [showAgent, setShowAgent] = useState(false);

  return (
    <div>
      <button onClick={() => setShowAgent(true)}>
        Start Agent Workflow
      </button>
      
      {showAgent && (
        <div className="modal">
          <AgentReportFlow 
            onComplete={() => setShowAgent(false)}
            onCancel={() => setShowAgent(false)}
          />
        </div>
      )}
    </div>
  );
};
```

## Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onComplete` | `function` | No | Callback when report is successfully submitted |
| `onCancel` | `function` | No | Callback when user cancels the workflow |

## Workflow Steps

### Step 1: Input Modality Selection
- User chooses between image, voice, or text input
- Visual options with clear descriptions
- Auto-advance after 5 seconds if no selection

### Step 2: Input Processing
- **Image**: AI analysis for category and description extraction
- **Voice**: Real-time speech-to-text transcription
- **Text**: Manual description entry with title extraction

### Step 3: Category Selection
- Visual category picker with preview of extracted data
- User can override AI-suggested category
- Auto-advance with selected category

### Step 4: Location Confirmation
- Display automatically detected coordinates
- User confirmation required
- Error handling for location access issues

### Step 5: Review & Edit
- Editable preview of all report data
- Manual override capabilities
- Additional media file upload option

### Step 6: Submission
- Automatic submission using existing API
- Loading states and error handling
- Success confirmation

### Step 7: Success Screen
- Confirmation of successful submission
- Options to submit another report or close

## API Integration

The component uses the existing report submission API:

```javascript
// API endpoint
POST https://backend-sih-project-l67a.onrender.com/api/reports

// Headers
Content-Type: multipart/form-data
Authorization: Bearer <token>

// Form data
{
  title: string,
  description: string,
  category: string,
  coordinates: string, // JSON string of [lng, lat]
  media: File[] // Array of media files
}
```

## AI Service Integration

### Current Implementation
The component includes a mock AI service for image analysis:

```javascript
const analyzeImage = async (file) => {
  // Mock implementation
  return {
    title: 'Infrastructure Issue Detected',
    description: 'Visual analysis suggests a potential infrastructure problem.',
    category: 'other'
  };
};
```

### Real AI Service Integration
Replace the mock implementation with actual AI services:

```javascript
// Example with Google Vision API
const analyzeImage = async (file) => {
  const response = await fetch('/api/analyze-image', {
    method: 'POST',
    body: file
  });
  return await response.json();
};
```

### Supported AI Services
- **Google Vision API** - Image analysis and OCR
- **Azure Computer Vision** - Image understanding
- **AWS Rekognition** - Image and video analysis
- **Custom ML models** - Deployed via API

## Styling

The component includes comprehensive CSS with:
- **Responsive design** for mobile and desktop
- **Modern gradient backgrounds** and animations
- **Accessible color schemes** and contrast
- **Smooth transitions** and hover effects
- **Mobile-optimized** touch interactions

## Browser Compatibility

### Required APIs
- **Geolocation API** - For location detection
- **Web Speech API** - For voice recognition
- **File API** - For image uploads
- **FormData API** - For multipart uploads

### Supported Browsers
- Chrome 25+
- Firefox 44+
- Safari 6.1+
- Edge 79+

## Error Handling

The component includes comprehensive error handling for:
- **Location access denial** - User-friendly error messages
- **Voice recognition failures** - Fallback to text input
- **Image analysis errors** - Graceful degradation
- **Network failures** - Retry mechanisms
- **API errors** - Clear error messages

## Customization

### Styling Customization
Override CSS variables for theming:

```css
.agent-report-flow {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #4CAF50;
  --error-color: #f44336;
}
```

### Workflow Customization
Modify the workflow steps by editing the `renderStep()` function:

```javascript
const renderStep = () => {
  switch (currentStep) {
    case 1:
      // Custom step implementation
      break;
    // Add more steps as needed
  }
};
```

## Performance Considerations

- **Lazy loading** of AI services
- **Image compression** before upload
- **Debounced input** handling
- **Memory cleanup** on component unmount
- **Efficient re-renders** with React hooks

## Security Considerations

- **Input validation** on all user inputs
- **File type validation** for uploads
- **XSS prevention** in text inputs
- **CSRF protection** via API tokens
- **Secure file handling** for uploads

## Testing

### Unit Tests
```javascript
import { render, fireEvent } from '@testing-library/react';
import AgentReportFlow from './AgentReportFlow';

test('renders input selection step', () => {
  render(<AgentReportFlow />);
  expect(screen.getByText('Choose how you\'d like to report')).toBeInTheDocument();
});
```

### Integration Tests
- Test complete workflow from start to finish
- Mock AI services and API calls
- Test error scenarios and edge cases
- Verify accessibility compliance

## Troubleshooting

### Common Issues

1. **Location not detected**
   - Check browser permissions
   - Verify HTTPS connection
   - Test on different devices

2. **Voice recognition not working**
   - Check microphone permissions
   - Verify browser support
   - Test with different browsers

3. **Image analysis failing**
   - Check file size limits
   - Verify image format support
   - Test with different image types

4. **API submission errors**
   - Check authentication token
   - Verify network connectivity
   - Check API endpoint availability

## Future Enhancements

- **Multi-language support** for voice recognition
- **Advanced AI models** for better image analysis
- **Offline capability** with sync when online
- **Batch processing** for multiple reports
- **Real-time collaboration** features
- **Advanced analytics** and reporting

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Test with different input types
4. Verify API connectivity
5. Check component documentation
