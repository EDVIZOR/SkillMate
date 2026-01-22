"""
AI-Driven Global Command Handling Service for SkillMate
FastAPI service for processing natural language commands
"""

import os
import json
import re
from typing import Optional, Literal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx

# FastAPI app
app = FastAPI(title="SkillMate AI Command Service", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3003", "http://127.0.0.1:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# LongCat API Configuration
LONGCAT_API_KEY = os.getenv("LONGCAT_API_KEY", "ak_2Yp4WA49w88C76U1bl0qD3cx6Y68l")
LONGCAT_API_URL = "https://api.longcat.chat/openai/v1/chat/completions"
MODEL = "LongCat-Flash-Chat"

# Whitelisted targets
VALID_TARGETS = Literal["ROADMAP", "APTITUDE_TEST", "CHATBOT", "PROFILE", "NONE"]
VALID_INTENTS = Literal["NAVIGATE", "OTHER"]

# Route mapping (deterministic, safe)
TARGET_TO_ROUTE = {
    "ROADMAP": "/roadmaps",
    "APTITUDE_TEST": "/assessment/start",
    "CHATBOT": "/chatbot",
    "PROFILE": "/profile",
    "NONE": None
}

# Request/Response Models
class CommandRequest(BaseModel):
    command: str = Field(..., description="User's natural language command", min_length=1)

class ClassificationResponse(BaseModel):
    intent: VALID_INTENTS = Field(..., description="Classified intent type")
    target: VALID_TARGETS = Field(..., description="Classified target from whitelist")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")

class ActionResponse(BaseModel):
    action: Literal["REDIRECT", "ASK_CLARIFICATION"] = Field(..., description="Action to take")
    route: Optional[str] = Field(None, description="Route to navigate to (if REDIRECT)")
    message: Optional[str] = Field(None, description="Clarification message (if ASK_CLARIFICATION)")

# AI Classification Prompt
CLASSIFICATION_PROMPT = """You are a command classification system for SkillMate, an educational platform for CS students.

Your ONLY job is to analyze user input and classify it into:
1. INTENT: Either "NAVIGATE" (user wants to go somewhere) or "OTHER" (not navigation)
2. TARGET: One of these EXACT values: "ROADMAP", "APTITUDE_TEST", "CHATBOT", "PROFILE", or "NONE"

VALID TARGETS:
- ROADMAP: User wants to see learning roadmaps/paths (e.g., "open roadmap", "show learning path", "rodmap", "road map")
- APTITUDE_TEST: User wants to take/start an assessment/test (e.g., "take test", "start aptitude", "begin assessment", "aptitude test")
- CHATBOT: User wants to chat with AI (e.g., "open chatbot", "chat with ai", "talk to assistant", "chatbot")
- PROFILE: User wants to see their profile (e.g., "open profile", "show my profile", "profile page", "my info")
- NONE: Cannot determine target or intent is OTHER

IMPORTANT RULES:
1. Be VERY forgiving of spelling mistakes, typos, and informal language
2. "opn rodmap" → ROADMAP
3. "open learning path" → ROADMAP
4. "take aptitude" → APTITUDE_TEST
5. "chat bot" → CHATBOT
6. "my profile" → PROFILE
7. If user asks a question or wants explanation, use intent "OTHER" and target "NONE"
8. If unclear, use target "NONE"

You MUST respond ONLY with valid JSON in this exact format:
{
  "intent": "NAVIGATE" or "OTHER",
  "target": "ROADMAP" or "APTITUDE_TEST" or "CHATBOT" or "PROFILE" or "NONE",
  "confidence": 0.0-1.0
}

Return ONLY the JSON object, no other text."""

async def classify_command_with_ai(command: str) -> ClassificationResponse:
    """
    Use AI to classify user command into intent and target.
    Handles spelling errors and informal language.
    """
    try:
        messages = [
            {"role": "system", "content": CLASSIFICATION_PROMPT},
            {"role": "user", "content": f"Classify this command: {command}"}
        ]
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                LONGCAT_API_URL,
                headers={
                    "Authorization": f"Bearer {LONGCAT_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": MODEL,
                    "messages": messages,
                    "temperature": 0.1,  # Low temperature for deterministic classification
                    "max_tokens": 150,  # Limit tokens for JSON-only response
                    "response_format": {"type": "json_object"}  # Force JSON response
                }
            )
            response.raise_for_status()
            data = response.json()
            
            if not data.get("choices") or len(data["choices"]) == 0:
                raise ValueError("No response from AI")
            
            ai_content = data["choices"][0]["message"]["content"].strip()
            
            # Parse JSON response
            # Remove markdown code blocks if present
            ai_content = re.sub(r'```json\s*', '', ai_content)
            ai_content = re.sub(r'```\s*', '', ai_content)
            
            # Extract JSON object
            json_match = re.search(r'\{[\s\S]*\}', ai_content)
            if json_match:
                ai_content = json_match.group(0)
            
            parsed = json.loads(ai_content)
            
            # Validate and return
            intent = parsed.get("intent", "OTHER")
            target = parsed.get("target", "NONE")
            confidence = float(parsed.get("confidence", 0.5))
            
            # Ensure valid values (type-safe)
            if intent not in ["NAVIGATE", "OTHER"]:
                intent = "OTHER"
            if target not in ["ROADMAP", "APTITUDE_TEST", "CHATBOT", "PROFILE", "NONE"]:
                target = "NONE"
            
            # Clamp confidence
            confidence = max(0.0, min(1.0, confidence))
            
            return ClassificationResponse(
                intent=intent,  # type: ignore
                target=target,  # type: ignore
                confidence=confidence
            )
            
    except Exception as e:
        print(f"AI Classification Error: {e}")
        # Fallback to keyword-based classification
        return fallback_classification(command)

def fallback_classification(command: str) -> ClassificationResponse:
    """
    Fallback keyword-based classification when AI fails.
    Handles common typos and variations.
    """
    lower_command = command.lower()
    
    # Roadmap keywords (very forgiving)
    roadmap_keywords = ["roadmap", "road map", "rodmap", "rod map", "learning path", 
                       "learning path", "path", "road", "map", "guide", "plan"]
    if any(keyword in lower_command for keyword in roadmap_keywords):
        return ClassificationResponse(intent="NAVIGATE", target="ROADMAP", confidence=0.7)
    
    # Aptitude test keywords
    test_keywords = ["test", "aptitude", "assessment", "quiz", "exam", "evaluate", 
                    "aptitude test", "take test", "start test", "begin test"]
    if any(keyword in lower_command for keyword in test_keywords):
        return ClassificationResponse(intent="NAVIGATE", target="APTITUDE_TEST", confidence=0.7)
    
    # Chatbot keywords
    chatbot_keywords = ["chat", "chatbot", "chat bot", "ai", "assistant", "talk", 
                       "conversation", "help", "ask"]
    if any(keyword in lower_command for keyword in chatbot_keywords):
        return ClassificationResponse(intent="NAVIGATE", target="CHATBOT", confidence=0.7)
    
    # Profile keywords
    profile_keywords = ["profile", "my profile", "account", "info", "information", 
                       "personal", "settings", "details"]
    if any(keyword in lower_command for keyword in profile_keywords):
        return ClassificationResponse(intent="NAVIGATE", target="PROFILE", confidence=0.7)
    
    # Default: cannot determine
    return ClassificationResponse(intent="OTHER", target="NONE", confidence=0.3)

def resolve_action(classification: ClassificationResponse) -> ActionResponse:
    """
    Deterministic action resolver.
    Maps valid targets to routes safely.
    Never trusts AI output directly - only uses whitelisted mappings.
    """
    # If intent is not NAVIGATE, ask for clarification
    if classification.intent != "NAVIGATE":
        return ActionResponse(
            action="ASK_CLARIFICATION",
            message="I'm not sure what you'd like to do. Try: 'open roadmap', 'take test', 'open chatbot', or 'show profile'."
        )
    
    # If target is NONE, ask for clarification
    if classification.target == "NONE":
        return ActionResponse(
            action="ASK_CLARIFICATION",
            message="Which would you like to open? Roadmap, Aptitude Test, Chatbot, or Profile?"
        )
    
    # Map target to route (deterministic, safe)
    route = TARGET_TO_ROUTE.get(classification.target)
    
    if route:
        return ActionResponse(
            action="REDIRECT",
            route=route
        )
    else:
        return ActionResponse(
            action="ASK_CLARIFICATION",
            message="I couldn't determine where you want to go. Please try again."
        )

@app.post("/api/ai/command", response_model=ActionResponse)
async def process_command(request: CommandRequest):
    """
    Main endpoint for processing AI commands.
    
    Flow:
    1. Receive natural language command
    2. Classify using AI (with fallback)
    3. Resolve action deterministically
    4. Return safe, structured response
    """
    try:
        # Step 1: Classify command using AI
        classification = await classify_command_with_ai(request.command)
        
        # Step 2: Resolve action deterministically
        action = resolve_action(classification)
        
        return action
        
    except Exception as e:
        print(f"Error processing command: {e}")
        # Return safe fallback
        return ActionResponse(
            action="ASK_CLARIFICATION",
            message="I'm having trouble understanding. Please try: 'open roadmap', 'take test', 'open chatbot', or 'show profile'."
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ai_command_service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

