/**
 * AI Command Service - Frontend client for AI command handling
 * Sends natural language commands to backend and receives safe, structured responses
 */

const AI_COMMAND_API_URL = 'http://localhost:8001/api/ai/command';

export interface CommandRequest {
  command: string;
}

export interface ActionResponse {
  action: 'REDIRECT' | 'ASK_CLARIFICATION';
  route?: string;
  message?: string;
}

/**
 * Send a natural language command to the AI command service
 * Returns a structured response with safe actions only
 */
export async function sendCommandToAI(command: string): Promise<ActionResponse | null> {
  try {
    const response = await fetch(AI_COMMAND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command: command.trim() }),
      // Add timeout
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ActionResponse = await response.json();
    
    // Validate response structure
    if (!data.action || (data.action !== 'REDIRECT' && data.action !== 'ASK_CLARIFICATION')) {
      throw new Error('Invalid response format from AI service');
    }

    // If REDIRECT, validate route exists
    if (data.action === 'REDIRECT' && !data.route) {
      throw new Error('REDIRECT action missing route');
    }

    return data;
  } catch (error) {
    // Check if it's a network/timeout error (service not available)
    if (error instanceof TypeError || error instanceof DOMException || 
        (error instanceof Error && (error.message.includes('fetch') || error.message.includes('timeout')))) {
      console.warn('AI Command Service not available, will use fallback:', error);
      // Return null to indicate service is unavailable - frontend should use fallback
      return null;
    }
    
    console.error('Error sending command to AI service:', error);
    // For other errors, return null to use fallback
    return null;
  }
}

/**
 * Validate route is safe before navigation
 */
const SAFE_ROUTES = [
  '/roadmaps',
  '/assessment/start',
  '/chatbot',
  '/profile',
  '/dashboard'
];

export function isRouteSafe(route: string): boolean {
  return SAFE_ROUTES.includes(route);
}

