import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
        const currentMessages = isHiddenFromUi ? messages : [...messages, userMessage];
        
        if (!isHiddenFromUi) {
            setMessages(currentMessages);
            setInput('');
        }
        setIsThinking(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/chat/report', 
                { history: currentMessages },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.tool_calls) {
                handleToolCall(res.data.tool_calls[0]);
            } else {
                const agentMessage = { role: 'assistant', content: res.data.content };
                setMessages(prev => [...prev, agentMessage]);
            }
        } catch (error) {
            const errorMessage = { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
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
            <div className="chat-header">
                <h3>CivicBot Assistant</h3>
            </div>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                        <div className="message-bubble">{msg.content}</div>
                    </div>
                ))}
                {isThinking && <div className="message assistant"><div className="message-bubble typing-indicator"><span></span><span></span><span></span></div></div>}
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