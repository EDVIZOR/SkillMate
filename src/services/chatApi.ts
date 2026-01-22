import api from './api';

export interface ChatMessage {
  id?: number;
  message_type?: 'user' | 'assistant';
  type?: 'user' | 'assistant'; // Frontend uses 'type', backend uses 'message_type'
  content: string;
  is_error?: boolean;
  isError?: boolean; // Support both formats
  timestamp?: Date;
  created_at?: string;
}

export interface Chat {
  id: number;
  title: string;
  share_id: string;
  share_url: string;
  is_shared: boolean;
  message_count: number;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export const chatApi = {
  // Get all chats for user
  getChats: async (): Promise<Chat[]> => {
    const response = await api.get('/chats/');
    return response.data;
  },

  // Get a specific chat
  getChat: async (chatId: number): Promise<Chat> => {
    const response = await api.get(`/chats/${chatId}/`);
    return response.data;
  },

  // Create a new chat
  createChat: async (title: string = 'New Conversation'): Promise<Chat> => {
    const response = await api.post('/chats/', { title });
    return response.data;
  },

  // Create chat with messages
  createChatWithMessages: async (
    title: string,
    messages: ChatMessage[]
  ): Promise<Chat> => {
    const response = await api.post('/chats/create-with-messages/', {
      title,
      messages: messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        isError: msg.isError || false,
      })),
    });
    return response.data;
  },

  // Update chat
  updateChat: async (
    chatId: number,
    data: { title?: string; is_shared?: boolean }
  ): Promise<Chat> => {
    const response = await api.patch(`/chats/${chatId}/`, data);
    return response.data;
  },

  // Delete chat
  deleteChat: async (chatId: number): Promise<void> => {
    await api.delete(`/chats/${chatId}/`);
  },

  // Save messages to chat
  saveMessages: async (
    chatId: number,
    messages: ChatMessage[]
  ): Promise<Chat> => {
    const response = await api.post(`/chats/${chatId}/messages/`, {
      messages: messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        isError: msg.isError || false,
      })),
    });
    return response.data;
  },

  // Add a single message
  addMessage: async (
    chatId: number,
    message: ChatMessage
  ): Promise<ChatMessage> => {
    const response = await api.post(`/chats/${chatId}/message/`, {
      type: message.type,
      content: message.content,
      isError: message.isError || false,
    });
    return response.data;
  },

  // Share/unshare chat
  shareChat: async (
    chatId: number,
    isShared: boolean
  ): Promise<Chat> => {
    const response = await api.post(`/chats/${chatId}/share/`, {
      is_shared: isShared,
    });
    return response.data;
  },

  // Get shared chat (public, no auth required)
  getSharedChat: async (shareId: string): Promise<Chat> => {
    const response = await fetch(`/api/chats/share/${shareId}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch shared chat');
    }
    return response.json();
  },
};
