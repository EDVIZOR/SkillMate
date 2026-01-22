import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Menu, Sparkles, MessageSquare, Trash2, Clock, Share2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendMessageToLongCat, ChatMessage as LongCatMessage } from '../../services/longcatApi';
import { chatApi, Chat, ChatMessage } from '../../services/chatApi';
import './Chatbot.css';

// Safe Markdown renderer component
interface SafeMarkdownProps {
  content: string;
}

function SafeMarkdown({ content }: SafeMarkdownProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown>{String(content || '')}</ReactMarkdown>
    </div>
  );
}

interface Message {
  id?: number | string;
  type: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isError?: boolean;
  created_at?: string;
}

export default function Chatbot() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Chat[]>([]);
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Load conversations from backend on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const chats = await chatApi.getChats();
      setConversations(chats);
      
      // Auto-select first conversation if available
      if (chats.length > 0 && !activeConversation) {
        loadConversation(chats[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load conversations. Please refresh the page.');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (chatId: number) => {
    try {
      const chat = await chatApi.getChat(chatId);
      setActiveConversation(chatId);
      
      // Convert backend messages to frontend format
      const formattedMessages: Message[] = chat.messages.map((msg: ChatMessage) => ({
        id: msg.id,
        type: (msg.message_type || msg.type) as 'user' | 'assistant',
        content: msg.content,
        isError: msg.is_error || msg.isError,
        timestamp: msg.created_at ? new Date(msg.created_at) : new Date(),
        created_at: msg.created_at,
      }));
      
      setMessages(formattedMessages);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Failed to load conversation.');
    }
  };

  const saveChatToBackend = async (chatId: number | null, title: string, messagesToSave: Message[]) => {
    try {
      if (chatId) {
        // Update existing chat
        await chatApi.saveMessages(chatId, messagesToSave);
        await chatApi.updateChat(chatId, { title });
      } else {
        // Create new chat
        const newChat = await chatApi.createChatWithMessages(title, messagesToSave);
        setActiveConversation(newChat.id);
        return newChat;
      }
    } catch (err) {
      console.error('Failed to save chat to backend:', err);
      // Don't throw - allow user to continue
    }
  };

  const copyShareLink = async (shareUrl: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShareChat = async (chatId: number) => {
    try {
      const chat = conversations.find(c => c.id === chatId);
      if (!chat) return;
      
      // Toggle share status
      const updatedChat = await chatApi.shareChat(chatId, !chat.is_shared);
      
      // Update local state
      setConversations(conversations.map(c => 
        c.id === chatId ? updatedChat : c
      ));
      
      // Copy link if sharing
      if (updatedChat.is_shared) {
        await copyShareLink(updatedChat.share_url);
      }
    } catch (err) {
      console.error('Failed to share chat:', err);
      setError('Failed to share chat.');
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const userInput = input.trim();
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    setError('');

    try {
      // Convert messages to LongCat API format
      const chatMessages: LongCatMessage[] = updatedMessages
        .filter(msg => !msg.isError)
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      // Send to LongCat API
      const response = await sendMessageToLongCat(chatMessages);

      if (response.choices && response.choices.length > 0) {
        const aiContent = response.choices[0].message.content;
        
        const aiMessage: Message = {
          id: Date.now() + 1,
          type: 'assistant',
          content: aiContent,
          timestamp: new Date()
        };

        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);

        // Generate title from first user message if new conversation
        let title = 'New Conversation';
        if (finalMessages.length > 0) {
          const firstUserMsg = finalMessages.find(m => m.type === 'user');
          if (firstUserMsg) {
            title = firstUserMsg.content.substring(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '');
          }
        }

        // Save to backend
        const savedChat = await saveChatToBackend(activeConversation, title, finalMessages);
        
        // Reload conversations to get updated data
        await loadConversations();
        
        // If new chat was created, load it
        if (savedChat) {
          await loadConversation(savedChat.id);
        }
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      // Show error message
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Sorry, I encountered an error: ${err.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
        isError: true
      };
      setMessages([...updatedMessages, errorMessage]);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const createNewChat = () => {
    setActiveConversation(null);
    setMessages([]);
    setError('');
  };

  const deleteConversation = async (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await chatApi.deleteChat(id);
      const updatedConversations = conversations.filter(c => c.id !== id);
      setConversations(updatedConversations);
      
      if (activeConversation === id) {
        setActiveConversation(null);
        setMessages([]);
        // Load first remaining conversation if available
        if (updatedConversations.length > 0) {
          await loadConversation(updatedConversations[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setError('Failed to delete conversation.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot-container">
      {/* Sidebar */}
      <div className={`chatbot-sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <button
            onClick={createNewChat}
            className="new-chat-button"
            type="button"
          >
            <Plus className="icon" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="chat-history">
          {conversations.length === 0 ? (
            <div className="empty-conversations">
              <MessageSquare className="icon-large" />
              <p>No conversations yet</p>
              <p className="subtitle">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="conversations-list">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`conversation-item ${activeConversation === conv.id ? 'active' : ''}`}
                  type="button"
                >
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <MessageSquare className="icon-small" />
                      <p className="conversation-title">
                        {conv.title}
                        {conv.is_shared && (
                          <span className="shared-badge" title="This chat is shared">
                            <Share2 className="icon-tiny" />
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="conversation-meta">
                      <span className="conversation-date">
                        <Clock className="icon-tiny" />
                        {formatDate(conv.updated_at)}
                      </span>
                      <span className="message-count">{conv.message_count} messages</span>
                    </div>
                  </div>
                  <div className="conversation-actions">
                    <button 
                      className={`share-button ${conv.is_shared ? 'shared-active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareChat(conv.id);
                      }}
                      type="button"
                      aria-label={conv.is_shared ? "Unshare conversation" : "Share conversation"}
                      title={conv.is_shared ? "Unshare conversation" : "Share conversation - Click to get shareable link"}
                    >
                      <Share2 className={`icon-small ${conv.is_shared ? 'shared' : ''}`} />
                    </button>
                    <button 
                      className="delete-button"
                      onClick={(e) => deleteConversation(conv.id, e)}
                      type="button"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="icon-small" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`chat-main-area ${messages.length === 0 && !loading ? 'empty-mode' : ''}`}>
        {/* Top Bar */}
        <div className="chat-top-bar">
          <div className="top-bar-left">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="menu-toggle-button"
              type="button"
              aria-label="Toggle sidebar"
            >
              <Menu className="icon" />
            </button>
            <div className="chat-title">
              <div className="chat-icon-wrapper">
                <Sparkles className="icon" />
              </div>
              <span className="chat-title-text">SkillMate AI Assistant</span>
            </div>
          </div>
          {activeConversation && conversations.find(c => c.id === activeConversation)?.is_shared && (
            <div className="share-link-container">
              <button
                onClick={() => {
                  const chat = conversations.find(c => c.id === activeConversation);
                  if (chat) {
                    copyShareLink(chat.share_url);
                  }
                }}
                className="share-link-button"
                type="button"
                title="Copy share link"
              >
                {shareLinkCopied ? (
                  <>
                    <Check className="icon-small" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="icon-small" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError('')} type="button">×</button>
          </div>
        )}

        {/* Messages Container */}
        <div className="messages-container">
          <div className="messages-content">
            {messages.length === 0 && !loading ? (
              <div className="empty-state-centered">
                <div className="empty-state-content">
                  <h2 className="empty-state-title">Ask our AI anything</h2>
                  <p className="empty-state-subtitle">What can I ask you to do?</p>
                  <div className="centered-input-wrapper">
                    <div className="centered-input-container">
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything"
                        className="centered-chat-input"
                        rows={1}
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className={`centered-send-button ${input.trim() && !isTyping ? 'enabled' : 'disabled'}`}
                        type="button"
                        aria-label="Send message"
                      >
                        <Send className="icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="messages-list">
                  {messages.map((message) => {
                    const isAI = message.type === 'assistant';
                    return (
                      <div key={message.id} className={`message-wrapper ${isAI ? 'ai-message-wrapper' : 'user-message-wrapper'}`}>
                        <div className={`message-bubble ${isAI ? 'ai-message' : 'user-message'} ${message.isError ? 'error' : ''}`}>
                          <div className="message-header">
                            <span className="message-sender">
                              {isAI ? (
                                <>
                                  <Sparkles className="icon-tiny" />
                                  SkillMate AI
                                </>
                              ) : (
                                'You'
                              )}
                            </span>
                            <span className="message-time">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <div className="message-text">
                            {isAI ? (
                              <SafeMarkdown content={message.content} />
                            ) : (
                              <p>{message.content || ''}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="message-wrapper ai-message-wrapper">
                      <div className="message-bubble ai-message typing">
                        <div className="message-header">
                          <span className="message-sender">
                            <Sparkles className="icon-tiny" />
                            SkillMate AI
                          </span>
                        </div>
                        <div className="typing-indicator">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area - Only shown when messages exist */}
                <div className="input-area">
                  <div className="input-container">
                    <div className="input-wrapper">
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything"
                        className="chat-input"
                        rows={1}
                        disabled={isTyping}
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className={`send-button ${input.trim() && !isTyping ? 'enabled' : 'disabled'}`}
                        type="button"
                        aria-label="Send message"
                      >
                        <Send className="icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
