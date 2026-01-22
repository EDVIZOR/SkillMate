# Chat Storage & Sharing Feature

## Overview
This Django app implements chat storage and sharing functionality for the SkillMate chatbot. All chats are saved to the backend database, and users can generate shareable links for their conversations.

## Features

### 1. Chat Storage
- ✅ All chats saved to database
- ✅ Messages persisted with timestamps
- ✅ User association (authenticated users)
- ✅ Automatic title generation

### 2. Shareable Links
- ✅ Unique share ID for each chat
- ✅ Public access to shared chats (no auth required)
- ✅ Toggle share/unshare functionality
- ✅ Copy share link to clipboard

### 3. API Endpoints

**Base URL:** `/api/chats/`

1. `GET /api/chats/` - Get all user's chats
2. `POST /api/chats/` - Create new chat
3. `GET /api/chats/<id>/` - Get specific chat
4. `PATCH /api/chats/<id>/` - Update chat (title, share status)
5. `DELETE /api/chats/<id>/` - Delete chat
6. `POST /api/chats/<id>/messages/` - Save messages to chat
7. `POST /api/chats/<id>/message/` - Add single message
8. `POST /api/chats/<id>/share/` - Share/unshare chat
9. `POST /api/chats/create-with-messages/` - Create chat with messages
10. `GET /api/chats/share/<share_id>/` - Get shared chat (public)

## Models

### Chat
- `user`: ForeignKey to User (nullable for anonymous)
- `title`: Chat title
- `share_id`: Unique shareable ID (auto-generated)
- `is_shared`: Boolean for share status
- `created_at`, `updated_at`: Timestamps

### ChatMessage
- `chat`: ForeignKey to Chat
- `message_type`: 'user' or 'assistant'
- `content`: Message text
- `is_error`: Boolean for error messages
- `created_at`: Timestamp

## Frontend Integration

### Chatbot Component
- Loads chats from backend on mount
- Saves chats automatically after each message
- Share button in sidebar for each chat
- Copy link button in top bar for shared chats

### Shared Chat View
- Public route: `/chatbot/share/<share_id>`
- No authentication required
- Read-only view of shared conversations

## Usage

### Share a Chat
1. Click the share icon (Share2) next to a chat in the sidebar
2. Chat becomes shared and link is copied to clipboard
3. Share link format: `http://localhost:3000/chatbot/share/<share_id>`

### View Shared Chat
1. Open the share link in browser
2. View the conversation (read-only)
3. No login required

## Database

All chats and messages are stored in:
- `chats_chat` table
- `chats_chatmessage` table

Migrations applied and ready to use.
