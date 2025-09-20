import React, { useState, useEffect, useRef } from 'react';
import PhotoUploader from '../components/PhotoUploader';
import './ChatReportPage.css';

const ChatReportPage = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm here to help you report a civic issue. What problem would you like to report?" }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [awaitingPhoto, setAwaitingPhoto] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async (messageContent, isHiddenFromUi = false) => {
        const userMessage = { role: 'user', content: messageContent };
        const newMessages = isHiddenFromUi ? messages : [...messages, userMessage];
        
        if (!isHiddenFromUi) {
            setMessages(newMessages);
            setInput('');
        }
        setIsThinking(true);
        
        setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

        try {
            const response = await fetch('/api/chat/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ history: newMessages }),
            });

            if (!response.body) return;
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);

                if (chunk.includes("<TOOL_CALL>")) {
                    const toolCallJSON = chunk.split('<TOOL_CALL>')[1].replace('</TOOL_CALL>', '');
                    const toolData = JSON.parse(toolCallJSON);
                    handleToolCall(toolData.tool_calls[0]);
                    setMessages(prev => prev.slice(0, -1));
                } else {
                    setMessages(prev => {
                        const lastMsgIndex = prev.length - 1;
                        if (prev[lastMsgIndex]?.role === 'assistant') {
                            const updatedMessages = [...prev];
                            updatedMessages[lastMsgIndex].content += chunk;
                            return updatedMessages;
                        }
                        return prev;
                    });
                }
            }
        } catch (error) {
            console.error("Streaming error:", error);
            setMessages(prev => {
                const lastMsgIndex = prev.length - 1;
                const updatedMessages = [...prev];
                updatedMessages[lastMsgIndex].content = "Sorry, an error occurred. Please try again.";
                return updatedMessages;
            });
        } finally {
            setIsThinking(false);
        }
    };
    
    const handleToolCall = (toolCall) => {
        if (toolCall.name === 'get_current_location') {
            setMessages(prev => [...prev, { role: 'assistant', content: "Great, please allow access to your location so I can pinpoint the issue."}]);
            navigator.geolocation.getCurrentPosition(pos => {
                const { latitude, longitude } = pos.coords;
                sendMessage(`My location is: lat ${latitude}, lng ${longitude}. Please confirm this with me.`, true);
            }, () => {
                sendMessage(`I was unable to get the location. Please type your address.`, true);
            });
        }
        if (toolCall.name === 'ask_for_photo') {
            setMessages(prev => [...prev, { role: 'assistant', content: "Thank you. Now, please upload a photo of the issue."}]);
            setAwaitingPhoto(true);
        }
    };

    const handlePhotoUploaded = (mediaUrl) => {
        setAwaitingPhoto(false);
        sendMessage(`I have uploaded the photo. The URL is: ${mediaUrl}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isThinking) return;
        sendMessage(input);
    };

    return (
        <div className="chat-container">
            <div className="chat-header"><h3>CivicBot Assistant</h3></div>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                        <div className="message-bubble">{msg.content}</div>
                    </div>
                ))}
                {isThinking && messages[messages.length - 1]?.content === "" && (
                    <div className="message assistant"><div className="message-bubble typing-indicator"><span></span><span></span><span></span></div></div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-area">
                {awaitingPhoto ? (
                    <PhotoUploader onUploadComplete={handlePhotoUploaded} />
                ) : (
                    <form onSubmit={handleSubmit} className="chat-input-form">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe the issue here..."
                            disabled={isThinking}
                        />
                        <button type="submit" disabled={isThinking}>Send</button>
                    </form>
                )}
            </div>
        </div>
    );
};
export default ChatReportPage;