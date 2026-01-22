#!/usr/bin/env python3
"""
Startup script for AI Command Service
Run this to start the FastAPI service on port 8001
"""

import uvicorn

if __name__ == "__main__":
    print("Starting SkillMate AI Command Service on http://localhost:8001")
    print("API endpoint: http://localhost:8001/api/ai/command")
    print("Health check: http://localhost:8001/health")
    print("Press CTRL+C to stop the service")
    # Use import string for reload to work properly
    uvicorn.run("ai_command_service:app", host="0.0.0.0", port=8001, reload=True)

