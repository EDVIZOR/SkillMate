# AI Command Service - FastAPI Backend

This service provides AI-driven natural language command processing for SkillMate's Global Command Bar.

## Features

- **Natural Language Processing**: Handles messy, typo-filled commands with high tolerance
- **Intent Classification**: Uses AI to classify user intent (NAVIGATE or OTHER)
- **Target Recognition**: Identifies target from whitelist (ROADMAP, APTITUDE_TEST, CHATBOT, PROFILE, NONE)
- **Deterministic Routing**: Safe, predictable route mapping
- **Spelling Tolerance**: Handles typos like "opn rodmap", "take aptitude", etc.

## Installation

```bash
# Install FastAPI dependencies
pip install -r requirements_ai.txt
```

## Running the Service

```bash
# Option 1: Direct Python
python start_ai_service.py

# Option 2: Uvicorn directly
uvicorn ai_command_service:app --host 0.0.0.0 --port 8001 --reload
```

The service will run on `http://localhost:8001`

## API Endpoints

### POST `/api/ai/command`

Process a natural language command.

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

### GET `/health`

Health check endpoint.

## Architecture

1. **AI Classification Layer**: Uses LongCat API to classify user input
2. **Action Resolver**: Deterministic mapping of targets to routes
3. **Safety Layer**: Only whitelisted routes are returned

## Environment Variables

- `LONGCAT_API_KEY`: LongCat API key (defaults to hardcoded value)

## Security

- Only whitelisted targets are accepted
- Routes are validated before returning
- Frontend validates all routes before navigation
- No direct AI output is trusted

