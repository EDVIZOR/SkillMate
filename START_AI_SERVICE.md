# Starting the AI Command Service

The AI Command Service is a FastAPI backend that processes natural language commands. If you see the error "I'm having trouble connecting", the service is not running.

## Quick Start

1. **Open a new terminal/command prompt**

2. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

3. **Install dependencies (if not already installed):**
   ```bash
   pip install fastapi uvicorn httpx pydantic
   ```

4. **Start the service:**
   ```bash
   python start_ai_service.py
   ```

   Or using uvicorn directly:
   ```bash
   uvicorn ai_command_service:app --host 0.0.0.0 --port 8001 --reload
   ```

5. **Verify it's running:**
   - You should see: "Starting SkillMate AI Command Service on http://localhost:8001"
   - Visit http://localhost:8001/health in your browser to check

## Note

The frontend will automatically fall back to the original AI pipeline if the service is unavailable, so the app will still work - just without the enhanced natural language navigation.

## Troubleshooting

- **Port 8001 already in use**: Change the port in `start_ai_service.py` and update `src/services/aiCommandService.ts`
- **Import errors**: Make sure you're in the `backend` directory when running
- **CORS errors**: Check that `http://localhost:3003` is in the CORS allowed origins in `ai_command_service.py`

