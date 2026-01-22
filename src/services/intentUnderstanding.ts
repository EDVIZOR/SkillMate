import { sendMessageToLongCat, ChatMessage } from './longcatApi';
import { getPersonalizationContext, recordInteraction } from './aiMemory';

/**
 * Intent categories for SkillMate AI Command Bar
 */
export enum IntentType {
  EXPLAIN_CONCEPT = 'EXPLAIN_CONCEPT',
  GUIDE_DOMAIN = 'GUIDE_DOMAIN',
  START_APTITUDE_TEST = 'START_APTITUDE_TEST',
  CONFUSION_HELP = 'CONFUSION_HELP',
  SHOW_ROADMAP = 'SHOW_ROADMAP',
  NAVIGATE = 'NAVIGATE',
  GENERAL_QUESTION = 'GENERAL_QUESTION',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Structured intent response from AI
 */
export interface IntentResponse {
  intent: IntentType;
  topic?: string;
  domain?: string;
  confidence: number;
  context?: string;
  parameters?: Record<string, any>;
}

/**
 * System prompt for intent classification
 * This prompt instructs the AI to only classify intent and return structured JSON
 */
const INTENT_CLASSIFICATION_PROMPT = `You are an intent classification system for SkillMate, an AI-guided platform for first-year CS engineering students.

Your ONLY job is to analyze user input and classify it into one of these intent categories:

1. EXPLAIN_CONCEPT - User wants to understand a concept (e.g., "I don't understand AI", "What is software development?")
2. GUIDE_DOMAIN - User wants help choosing a CS domain (e.g., "Which domain should I choose?", "Should I pick AI or Software?")
3. START_APTITUDE_TEST - User wants to start an assessment/test (e.g., "start test", "begin aptitude test", "take assessment")
4. CONFUSION_HELP - User expresses confusion or needs general help (e.g., "I am confused", "I need help", "I don't know what to do")
5. SHOW_ROADMAP - User wants to see learning path/roadmap (e.g., "how do I learn AI?", "what should I do next?", "show me a roadmap")
6. NAVIGATE - User wants to go to a specific page (e.g., "go to dashboard", "show my profile", "open roadmaps")
7. GENERAL_QUESTION - User asks a general question that doesn't fit other categories
8. UNKNOWN - Cannot determine intent

You MUST respond ONLY with valid JSON in this exact format:
{
  "intent": "INTENT_TYPE",
  "topic": "extracted topic or concept if relevant",
  "domain": "CS domain mentioned if relevant (Software, AI/ML, Data Science, Cybersecurity, Cloud)",
  "confidence": 0.0-1.0,
  "context": "brief context about what user is asking",
  "parameters": {}
}

Rules:
- Return ONLY the JSON object, no other text
- confidence should be between 0.0 and 1.0
- Extract topic/domain from user input when relevant
- Be precise and deterministic
- If unclear, use UNKNOWN intent with lower confidence

Examples:
User: "I don't understand AI"
Response: {"intent": "EXPLAIN_CONCEPT", "topic": "AI", "confidence": 0.95, "context": "User wants explanation of AI concept"}

User: "Which domain should I choose?"
Response: {"intent": "GUIDE_DOMAIN", "confidence": 0.9, "context": "User needs help choosing CS domain"}

User: "start aptitude test"
Response: {"intent": "START_APTITUDE_TEST", "confidence": 0.98, "context": "User wants to begin assessment"}

User: "I am confused"
Response: {"intent": "CONFUSION_HELP", "confidence": 0.85, "context": "User expresses confusion and needs help"}

User: "how do I learn software development?"
Response: {"intent": "SHOW_ROADMAP", "topic": "Software Development", "domain": "Software", "confidence": 0.92, "context": "User wants learning roadmap for software development"}

Now classify this user input:`;

/**
 * Parse AI response and extract structured intent
 */
function parseIntentResponse(aiResponse: string): IntentResponse {
  try {
    // Try to extract JSON from the response
    // The AI might return JSON wrapped in markdown code blocks or with extra text
    let jsonString = aiResponse.trim();
    
    // Remove markdown code blocks if present
    jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Try to find JSON object in the response
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }
    
    const parsed = JSON.parse(jsonString);
    
    // Validate and normalize the response
    const intent: IntentResponse = {
      intent: parsed.intent && Object.values(IntentType).includes(parsed.intent)
        ? parsed.intent as IntentType
        : IntentType.UNKNOWN,
      topic: parsed.topic || undefined,
      domain: parsed.domain || undefined,
      confidence: typeof parsed.confidence === 'number' 
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0.5,
      context: parsed.context || undefined,
      parameters: parsed.parameters || {}
    };
    
    return intent;
  } catch (error) {
    console.error('Failed to parse intent response:', error);
    console.error('Raw AI response:', aiResponse);
    
    // Fallback: return unknown intent
    return {
      intent: IntentType.UNKNOWN,
      confidence: 0.0,
      context: 'Failed to parse AI response'
    };
  }
}

/**
 * Classify user intent from natural language input
 * 
 * @param userInput - Raw user input from command bar
 * @returns Structured intent response
 */
export async function classifyIntent(userInput: string): Promise<IntentResponse> {
  if (!userInput || !userInput.trim()) {
    return {
      intent: IntentType.UNKNOWN,
      confidence: 0.0,
      context: 'Empty input'
    };
  }

  try {
    // Get personalization context from memory
    const memoryContext = getPersonalizationContext();
    
    // Enhance prompt with memory context if available
    let enhancedPrompt = INTENT_CLASSIFICATION_PROMPT;
    
    if (memoryContext.recentContext.lastTopic) {
      enhancedPrompt += `\n\nContext: The student recently asked about "${memoryContext.recentContext.lastTopic}".`;
    }
    
    if (memoryContext.discussedDomains.length > 0) {
      enhancedPrompt += `\n\nThe student has shown interest in: ${memoryContext.discussedDomains.join(', ')}.`;
    }
    
    if (memoryContext.confusionAreas.length > 0) {
      enhancedPrompt += `\n\nThe student has expressed confusion about: ${memoryContext.confusionAreas.join(', ')}.`;
    }
    
    // Prepare messages for AI
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: enhancedPrompt
      },
      {
        role: 'user',
        content: userInput.trim()
      }
    ];

    // Send to LongCat API with constrained parameters for deterministic responses
    const response = await sendMessageToLongCat(
      messages,
      500, // Limit tokens for faster, more focused responses
      0.1  // Low temperature for more deterministic classification
    );

    if (response.choices && response.choices.length > 0) {
      const aiContent = response.choices[0].message.content;
      const intentResponse = parseIntentResponse(aiContent);
      
      // Record interaction in memory
      recordInteraction(intentResponse.intent, intentResponse.topic || intentResponse.domain);
      
      // Log for debugging
      console.log('Intent Classification:', {
        input: userInput,
        intent: intentResponse,
        memoryContext: memoryContext
      });
      
      return intentResponse;
    } else {
      throw new Error('No response from AI');
    }
  } catch (error) {
    console.error('Intent classification error:', error);
    
    // Fallback: try simple keyword matching as backup
    return fallbackIntentClassification(userInput);
  }
}

/**
 * Fallback intent classification using simple keyword matching
 * Used when AI API fails
 */
function fallbackIntentClassification(userInput: string): IntentResponse {
  const lowerInput = userInput.toLowerCase();
  
  // START_APTITUDE_TEST
  if (lowerInput.match(/\b(start|begin|take|do|run)\b.*\b(test|assessment|aptitude|quiz)\b/)) {
    return {
      intent: IntentType.START_APTITUDE_TEST,
      confidence: 0.7,
      context: 'Keyword match: test/assessment'
    };
  }
  
  // EXPLAIN_CONCEPT
  if (lowerInput.match(/\b(what|explain|tell me about|understand|don't understand|don't know)\b/)) {
    const topicMatch = lowerInput.match(/\b(ai|machine learning|software|data science|cybersecurity|cloud|devops)\b/i);
    return {
      intent: IntentType.EXPLAIN_CONCEPT,
      topic: topicMatch ? topicMatch[0] : undefined,
      confidence: 0.6,
      context: 'Keyword match: explanation request'
    };
  }
  
  // GUIDE_DOMAIN
  if (lowerInput.match(/\b(which|choose|pick|select|should i)\b.*\b(domain|path|career|field)\b/)) {
    return {
      intent: IntentType.GUIDE_DOMAIN,
      confidence: 0.65,
      context: 'Keyword match: domain selection'
    };
  }
  
  // CONFUSION_HELP
  if (lowerInput.match(/\b(confused|help|lost|don't know|unsure|stuck)\b/)) {
    return {
      intent: IntentType.CONFUSION_HELP,
      confidence: 0.7,
      context: 'Keyword match: confusion/help'
    };
  }
  
  // SHOW_ROADMAP
  if (lowerInput.match(/\b(how|learn|roadmap|path|steps|what to do|next)\b/)) {
    return {
      intent: IntentType.SHOW_ROADMAP,
      confidence: 0.6,
      context: 'Keyword match: learning path'
    };
  }
  
  // NAVIGATE
  if (lowerInput.match(/\b(go to|show|open|navigate|visit)\b.*\b(dashboard|profile|roadmap|chatbot)\b/)) {
    const pageMatch = lowerInput.match(/\b(dashboard|profile|roadmap|chatbot)\b/);
    return {
      intent: IntentType.NAVIGATE,
      confidence: 0.7,
      parameters: { page: pageMatch ? pageMatch[0] : undefined }
    };
  }
  
  // Default: UNKNOWN
  return {
    intent: IntentType.UNKNOWN,
    confidence: 0.3,
    context: 'Fallback classification: no clear intent match'
  };
}

/**
 * Get human-readable description of intent
 */
export function getIntentDescription(intent: IntentType): string {
  const descriptions: Record<IntentType, string> = {
    [IntentType.EXPLAIN_CONCEPT]: 'Explain a concept',
    [IntentType.GUIDE_DOMAIN]: 'Guide domain selection',
    [IntentType.START_APTITUDE_TEST]: 'Start aptitude test',
    [IntentType.CONFUSION_HELP]: 'Help with confusion',
    [IntentType.SHOW_ROADMAP]: 'Show learning roadmap',
    [IntentType.NAVIGATE]: 'Navigate to page',
    [IntentType.GENERAL_QUESTION]: 'General question',
    [IntentType.UNKNOWN]: 'Unknown intent'
  };
  
  return descriptions[intent] || 'Unknown';
}

