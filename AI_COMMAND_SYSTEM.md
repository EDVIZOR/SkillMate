# AI-Driven Global Command Handling System

## Overview

This system allows users to type natural language commands (with typos, informal phrases, or partial sentences) and be navigated to the correct feature. The architecture ensures clear separation between frontend interaction and backend intelligence.

## Architecture

### Frontend (TypeScript/TSX)
- **GlobalCommandBar Component**: Captures free-text user input
- **aiCommandService.ts**: Sends POST requests to `/api/ai/command`
- **Safe UI Actions**: Client-side routing or clarification messages based on structured response
- **Route Validation**: Only whitelisted routes are accepted

### Backend (Python/FastAPI)
- **AI Classification Layer**: Uses LongCat API to interpret user input
- **Intent Classification**: Returns `NAVIGATE` or `OTHER`
- **Target Classification**: Returns one of: `ROADMAP`, `APTITUDE_TEST`, `CHATBOT`, `PROFILE`, `NONE`
- **Action Resolver**: Deterministic mapping of targets to routes
- **Safety**: Never trusts AI output directly, only uses whitelisted mappings

## Flow

1. **User types command** → GlobalCommandBar captures input
2. **Frontend sends POST** → `/api/ai/command` with `{ command: "opn rodmap" }`
3. **Backend classifies** → AI determines intent and target
4. **Backend resolves action** → Maps target to route deterministically
5. **Frontend receives response** → `{ action: "REDIRECT", route: "/roadmaps" }`
6. **Frontend validates** → Checks route is in whitelist
7. **Frontend navigates** → Safe client-side routing

## Example Commands

| User Input | Classified Target | Route |
|------------|------------------|-------|
| "opn rodmap" | ROADMAP | /roadmaps |
| "open learning path" | ROADMAP | /roadmaps |
| "take aptitude" | APTITUDE_TEST | /assessment/start |
| "start test" | APTITUDE_TEST | /assessment/start |
| "chat bot" | CHATBOT | /chatbot |
| "open chatbot" | CHATBOT | /chatbot |
| "my profile" | PROFILE | /profile |
| "show profile" | PROFILE | /profile |

## Safety Features

1. **Whitelisted Targets**: Only predefined targets are accepted
2. **Deterministic Routing**: Target-to-route mapping is hardcoded
3. **Frontend Validation**: Routes are validated before navigation
4. **No Direct AI Trust**: AI output is validated and mapped deterministically
5. **Fallback Classification**: Keyword-based fallback if AI fails

## Running the System

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements_ai.txt
python start_ai_service.py
```
Service runs on `http://localhost:8001`

### Frontend
```bash
npm run dev
```
Frontend runs on `http://localhost:3003`

## API Endpoint

### POST `/api/ai/command`

**Request:**
```json
{
  "command": "opn rodmap"
}
```

**Response:**
```json
{
  "action": "REDIRECT",
  "route": "/roadmaps"
}
```

or

```json
{
  "action": "ASK_CLARIFICATION",
  "message": "Which would you like to open? Roadmap, Aptitude Test, Chatbot, or Profile?"
}
```

## Files Created

- `backend/ai_command_service.py` - FastAPI service
- `backend/start_ai_service.py` - Startup script
- `backend/requirements_ai.txt` - Python dependencies
- `src/services/aiCommandService.ts` - Frontend service client
- Updated `src/App.tsx` - Integration with command handler

## Key Features

✅ Handles typos and spelling mistakes  
✅ Tolerates informal language  
✅ Deterministic, safe routing  
✅ Clear frontend-backend separation  
✅ Judge-defensible architecture  
✅ Fallback mechanisms for reliability  

