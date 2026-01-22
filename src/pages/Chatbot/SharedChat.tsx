import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatApi, Chat, ChatMessage } from '../../services/chatApi';
import './Chatbot.css';

interface Message {
  id?: number | string;
  type: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isError?: boolean;
  created_at?: string;
}

function SafeMarkdown({ content }: { content: string }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown>{String(content || '')}</ReactMarkdown>
    </div>
  );
}

export default function SharedChat() {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shareId) {
      loadSharedChat(shareId);
    }
  }, [shareId]);

  const loadSharedChat = async (id: string) => {
    try {
      setLoading(true);
      const sharedChat = await chatApi.getSharedChat(id);
      setChat(sharedChat);
      
      // Convert backend messages to frontend format
      const formattedMessages: Message[] = sharedChat.messages.map((msg: ChatMessage) => ({
        id: msg.id,
        type: (msg.message_type || msg.type) as 'user' | 'assistant',
        content: msg.content,
        isError: msg.is_error || msg.isError,
        timestamp: msg.created_at ? new Date(msg.created_at) : new Date(),
        created_at: msg.created_at,
      }));
      
      setMessages(formattedMessages);
    } catch (err: any) {
      console.error('Failed to load shared chat:', err);
      setError('Failed to load shared chat. It may not exist or may have been unshared.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="chatbot-container">
        <div className="chat-main-area empty-mode">
          <div className="empty-state-centered">
            <p>Loading shared chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="chatbot-container">
        <div className="chat-main-area empty-mode">
          <div className="empty-state-centered">
            <h2>Chat Not Found</h2>
            <p>{error || 'This chat does not exist or is not shared.'}</p>
            <button onClick={() => navigate('/chatbot')} className="new-chat-button">
              <ArrowLeft className="icon" />
              <span>Go to Chatbot</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chat-main-area">
        {/* Top Bar */}
        <div className="chat-top-bar">
          <div className="top-bar-left">
            <button
              onClick={() => navigate('/chatbot')}
              className="menu-toggle-button"
              type="button"
              aria-label="Back to chatbot"
            >
              <ArrowLeft className="icon" />
            </button>
            <div className="chat-title">
              <div className="chat-icon-wrapper">
                <Sparkles className="icon" />
              </div>
              <span className="chat-title-text">Shared Chat: {chat.title}</span>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="messages-container">
          <div className="messages-content">
            <div className="messages-list">
              {messages.map((message) => (
                <div key={message.id} className="message-wrapper">
                  <div className={`message-bubble ${message.type === 'assistant' ? 'ai-message' : 'user-message'} ${message.isError ? 'error' : ''}`}>
                    <div className="message-header">
                      <span className="message-sender">
                        {message.type === 'assistant' ? (
                          <>
                            <Sparkles className="icon-tiny" />
                            SkillMate AI
                          </>
                        ) : (
                          'User'
                        )}
                      </span>
                      <span className="message-time">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div className="message-text">
                      {message.type === 'assistant' ? (
                        <SafeMarkdown content={message.content} />
                      ) : (
                        <p>{message.content || ''}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
