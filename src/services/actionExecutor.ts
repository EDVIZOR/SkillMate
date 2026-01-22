import { ActionDecision, ActionType } from './actionRouter';
import { sendMessageToLongCat, ChatMessage } from './longcatApi';
import { 
  generateDomainPreview, 
  generateCareerReasoning, 
  generateLearningRoadmap,
  CSDomain,
  DomainPreviewInput,
  CareerReasoningInput,
  LearningRoadmapInput
} from './domainIntelligence';
import {
  detectDomainFromTopic,
  isDomainTopic,
  isValidDomain,
  formatCareerReasoningMessage,
  formatRoadmapMessage
} from './actionExecutorHelpers';
import {
  getPersonalizationContext,
  recordExplainedConcept,
  recordDiscussedDomain,
  recordConfusionSignal,
  resolveConfusionSignal,
  recordCompletedAction,
  wasConceptExplained,
  wasActionCompleted,
  getMostDiscussedDomains
} from './aiMemory';

/**
 * Result of executing an action
 */
export interface ExecutionResult {
  success: boolean;
  type: 'navigation' | 'message' | 'question' | 'no_action';
  message?: string;
  route?: string;
  question?: string;
  options?: string[];
  error?: string;
}

/**
 * Whitelist of safe navigation routes
 */
const SAFE_ROUTES: Record<string, string> = {
  '/dashboard': '/dashboard',
  '/profile': '/profile',
  '/roadmaps': '/roadmaps',
  '/roadmaps/': '/roadmaps',
  '/chatbot': '/chatbot',
  '/assessment/start': '/assessment/start',
  '/guidance': '/guidance',
  '/academics': '/academics',
  '/progress': '/progress',
  '/achievements': '/achievements',
  '/projects': '/projects',
  '/skills': '/skills'
};

/**
 * System prompts for different action types
 */

const EXPLANATION_PROMPT = `You are a helpful AI assistant for SkillMate, an educational platform for first-year CS engineering students who just completed 12th grade.

Your task is to explain a concept in a clear, beginner-friendly way that:
- Uses simple, everyday language (avoid technical jargon)
- Provides relatable examples that a first-year student can understand
- Is supportive and encouraging
- Builds confidence, not fear
- Is concise (2-3 short paragraphs maximum)

Remember: These students have NO prior coding knowledge. They are just starting their engineering journey.

Explain the following concept:`;

const FOLLOWUP_QUESTION_PROMPT = `You are a helpful AI assistant for SkillMate, an educational platform for first-year CS engineering students.

Generate a short, friendly, clarifying question (1-2 sentences maximum) that helps understand what the student needs. Be warm, supportive, and non-intimidating.

Context: The student said something that needs clarification. Generate a question to help them better.`;

const REASSURANCE_PROMPT = `You are a supportive AI assistant for SkillMate, an educational platform for first-year CS engineering students who just completed 12th grade.

The student is feeling confused or uncertain. Your task is to provide calm, supportive guidance that:
- Reassures them that confusion is normal and okay
- Reduces anxiety and fear
- Is warm, empathetic, and encouraging
- Provides gentle guidance without pressure
- Uses simple, friendly language
- Is brief (2-3 sentences maximum)

Provide reassurance for:`;

/**
 * Execute an action decision safely
 * 
 * @param actionDecision - The action decision from the router
 * @returns Execution result
 */
export async function executeAction(actionDecision: ActionDecision): Promise<ExecutionResult> {
  try {
    switch (actionDecision.action) {
      case ActionType.REDIRECT_TO_PAGE:
        return executeRedirect(actionDecision);
      
      case ActionType.SHOW_EXPLANATION:
        return await executeShowExplanation(actionDecision);
      
      case ActionType.ASK_FOLLOWUP_QUESTION:
        return await executeAskFollowupQuestion(actionDecision);
      
      case ActionType.PROVIDE_REASSURANCE:
        return await executeProvideReassurance(actionDecision);
      
      case ActionType.SHOW_ROADMAP:
        return executeShowRoadmap(actionDecision);
      
      case ActionType.START_ASSESSMENT:
        return executeStartAssessment(actionDecision);
      
      case ActionType.OPEN_CHATBOT:
        return executeOpenChatbot(actionDecision);
      
      case ActionType.NO_ACTION:
      default:
        return {
          success: true,
          type: 'no_action',
          message: actionDecision.messageHint || 'No action needed'
        };
    }
  } catch (error) {
    console.error('Error executing action:', error);
    return {
      success: false,
      type: 'no_action',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Execute REDIRECT_TO_PAGE action
 */
function executeRedirect(actionDecision: ActionDecision): ExecutionResult {
  const route = actionDecision.payload.route;
  
  if (!route) {
    return {
      success: false,
      type: 'navigation',
      error: 'No route specified in action decision'
    };
  }
  
  // Validate route is in whitelist
  const safeRoute = SAFE_ROUTES[route];
  if (!safeRoute) {
    console.warn('Attempted navigation to non-whitelisted route:', route);
    return {
      success: false,
      type: 'navigation',
      error: `Route ${route} is not in the safe routes whitelist`
    };
  }
  
  return {
    success: true,
    type: 'navigation',
    route: safeRoute,
    message: actionDecision.messageHint || `Navigating to ${safeRoute}...`
  };
}

/**
 * Execute SHOW_EXPLANATION action
 * Generates AI explanation for the topic
 * Uses domain intelligence modules for domain-specific topics
 * Personalizes based on memory context
 */
async function executeShowExplanation(actionDecision: ActionDecision): Promise<ExecutionResult> {
  const topic = actionDecision.payload.topic || actionDecision.payload.concept;
  
  if (!topic) {
    return {
      success: false,
      type: 'message',
      error: 'No topic specified for explanation'
    };
  }
  
  // Get memory context for personalization
  const memoryContext = getPersonalizationContext();
  const wasExplained = wasConceptExplained(topic, actionDecision.payload.metadata?.domain);
  
  // Check if concept was already explained - personalize response
  let personalizedPrompt = EXPLANATION_PROMPT;
  
  if (wasExplained) {
    personalizedPrompt += `\n\nIMPORTANT: You've explained "${topic}" to this student before. Reference that previous explanation naturally (e.g., "As we discussed earlier...") and build upon it rather than repeating the same information.`;
  }
  
  if (memoryContext.recentContext.lastTopic && memoryContext.recentContext.lastTopic !== topic) {
    personalizedPrompt += `\n\nThe student recently asked about "${memoryContext.recentContext.lastTopic}". You can reference this connection if relevant.`;
  }
  
  if (memoryContext.explanationStyle === 'very_simple') {
    personalizedPrompt += `\n\nKeep the explanation very simple and brief - the student prefers minimal detail.`;
  } else if (memoryContext.explanationStyle === 'slightly_detailed') {
    personalizedPrompt += `\n\nProvide slightly more detail - the student appreciates a bit more depth.`;
  }
  
  // Check if this is a domain-related explanation
  const domain = detectDomainFromTopic(topic);
  const guidanceType = actionDecision.payload.metadata?.guidanceType;
  
  // Use domain intelligence modules for domain-specific explanations
  if (domain && (guidanceType === 'domain_selection' || isDomainTopic(topic))) {
    try {
      // Record domain discussion
      recordDiscussedDomain(domain, 'high');
      
      // Use Career Reasoning Module for domain guidance
      const reasoningInput: CareerReasoningInput = {
        domain: domain,
        context: actionDecision.payload.metadata?.context
      };
      
      const reasoning = await generateCareerReasoning(reasoningInput);
      
      // Format the reasoning into a friendly message with personalization
      let message = formatCareerReasoningMessage(reasoning);
      
      // Add personalization if relevant
      if (memoryContext.discussedDomains.includes(domain)) {
        message = `I remember you've shown interest in ${domain} before! ${message}`;
      }
      
      // Record explained concept
      recordExplainedConcept(topic, domain, memoryContext.explanationStyle);
      
      return {
        success: true,
        type: 'message',
        message: message
      };
    } catch (error) {
      console.error('Error using domain intelligence module:', error);
      // Fall back to generic explanation
    }
  }
  
  // Generic explanation for non-domain topics
  try {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: personalizedPrompt
      },
      {
        role: 'user',
        content: `Please explain: ${topic}`
      }
    ];
    
    const response = await sendMessageToLongCat(
      messages,
      800, // Limit tokens for concise explanations
      0.7  // Moderate temperature for friendly but accurate responses
    );
    
    if (response.choices && response.choices.length > 0) {
      let explanation = response.choices[0].message.content.trim();
      
      // Record explained concept
      recordExplainedConcept(topic, domain, memoryContext.explanationStyle);
      
      // If domain was discussed, record it
      if (domain) {
        recordDiscussedDomain(domain);
      }
      
      return {
        success: true,
        type: 'message',
        message: explanation
      };
    } else {
      throw new Error('No response from AI');
    }
  } catch (error) {
    console.error('Error generating explanation:', error);
    return {
      success: false,
      type: 'message',
      error: 'Failed to generate explanation. Please try again.',
      message: `I'd love to explain ${topic}, but I'm having trouble right now. Could you try asking again?`
    };
  }
}

/**
 * Execute ASK_FOLLOWUP_QUESTION action
 * Generates or uses provided question
 */
async function executeAskFollowupQuestion(actionDecision: ActionDecision): Promise<ExecutionResult> {
  // If question is already provided in payload, use it
  if (actionDecision.payload.question) {
    return {
      success: true,
      type: 'question',
      question: actionDecision.payload.question,
      options: actionDecision.payload.options
    };
  }
  
  // Otherwise, generate a friendly question using AI
  try {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: FOLLOWUP_QUESTION_PROMPT
      },
      {
        role: 'user',
        content: 'Generate a friendly clarifying question to help the student.'
      }
    ];
    
    const response = await sendMessageToLongCat(
      messages,
      200, // Very short for questions
      0.8  // Higher temperature for more natural, friendly tone
    );
    
    if (response.choices && response.choices.length > 0) {
      const question = response.choices[0].message.content.trim();
      
      return {
        success: true,
        type: 'question',
        question: question,
        options: actionDecision.payload.options
      };
    } else {
      throw new Error('No response from AI');
    }
  } catch (error) {
    console.error('Error generating question:', error);
    // Fallback to generic question
    return {
      success: true,
      type: 'question',
      question: 'Could you tell me a bit more about what you need help with?',
      options: actionDecision.payload.options
    };
  }
}

/**
 * Execute PROVIDE_REASSURANCE action
 * Generates supportive, calming message
 * Personalizes based on memory context
 */
async function executeProvideReassurance(actionDecision: ActionDecision): Promise<ExecutionResult> {
  const reassuranceType = actionDecision.payload.reassuranceType || 'general';
  const context = actionDecision.payload.metadata?.context || '';
  
  // Get memory context
  const memoryContext = getPersonalizationContext();
  const unresolvedConfusion = memoryContext.confusionAreas;
  
  // Record confusion signal
  recordConfusionSignal(reassuranceType as any, context);
  
  try {
    let promptContext = '';
    switch (reassuranceType) {
      case 'domain_selection':
        promptContext = 'The student is confused about which CS domain to choose.';
        break;
      case 'learning_path':
        promptContext = 'The student is confused about how to learn or what to study.';
        break;
      case 'career':
        promptContext = 'The student is confused about their career path or future.';
        break;
      default:
        promptContext = 'The student is feeling confused or uncertain.';
    }
    
    // Add memory context for personalization
    if (unresolvedConfusion.length > 0) {
      promptContext += ` This is not the first time the student has expressed confusion. They've been confused about: ${unresolvedConfusion.join(', ')}.`;
    }
    
    if (memoryContext.discussedDomains.length > 0) {
      promptContext += ` The student has shown interest in: ${memoryContext.discussedDomains.join(', ')}.`;
    }
    
    if (context) {
      promptContext += ` Additional context: ${context}`;
    }
    
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: REASSURANCE_PROMPT
      },
      {
        role: 'user',
        content: promptContext
      }
    ];
    
    const response = await sendMessageToLongCat(
      messages,
      300, // Short, focused reassurance
      0.8  // Higher temperature for warm, empathetic tone
    );
    
    if (response.choices && response.choices.length > 0) {
      let reassurance = response.choices[0].message.content.trim();
      
      // Add personalization if this is a recurring confusion
      if (unresolvedConfusion.length > 1) {
        reassurance = `I understand this can feel overwhelming. ${reassurance}`;
      }
      
      return {
        success: true,
        type: 'message',
        message: reassurance
      };
    } else {
      throw new Error('No response from AI');
    }
  } catch (error) {
    console.error('Error generating reassurance:', error);
    // Fallback to predefined reassurance
    return {
      success: true,
      type: 'message',
      message: 'It\'s completely normal to feel confused, especially when you\'re just starting out. Everyone feels this way at the beginning. Take your time, and remember that you\'re not alone in this journey. I\'m here to help guide you step by step. 💜'
    };
  }
}

/**
 * Execute SHOW_ROADMAP action
 * Uses Learning Roadmap Generator module
 */
async function executeShowRoadmap(actionDecision: ActionDecision): Promise<ExecutionResult> {
  const domain = actionDecision.payload.domain;
  const roadmapType = actionDecision.payload.roadmapType || 'beginner';
  
  // Get memory context
  const memoryContext = getPersonalizationContext();
  
  // Record completed action
  recordCompletedAction('roadmap_viewed', { domain, type: roadmapType });
  
  // If domain is specified, generate detailed roadmap using domain intelligence
  if (domain && isValidDomain(domain)) {
    try {
      // Record domain discussion
      recordDiscussedDomain(domain as CSDomain, 'high', 'viewing roadmap');
      
      const roadmapInput: LearningRoadmapInput = {
        domain: domain as CSDomain,
        studentLevel: roadmapType === 'beginner' ? 'first-year' : 'beginner',
        goals: actionDecision.payload.metadata?.goals
      };
      
      const roadmap = await generateLearningRoadmap(roadmapInput);
      
      // Format roadmap into a friendly message with personalization
      let message = formatRoadmapMessage(roadmap);
      
      // Add personalization if student has discussed this domain before
      if (memoryContext.discussedDomains.includes(domain)) {
        message = `Since you've shown interest in ${domain} before, here's a roadmap tailored for you:\n\n${message}`;
      }
      
      return {
        success: true,
        type: 'message',
        message: message
      };
    } catch (error) {
      console.error('Error generating roadmap:', error);
      // Fall back to navigation
    }
  }
  
  // Fallback: redirect to roadmaps page
  const route = '/roadmaps';
  
  return {
    success: true,
    type: 'navigation',
    route: route,
    message: domain 
      ? `Showing you a ${roadmapType} roadmap for ${domain}...`
      : actionDecision.messageHint || 'Showing learning roadmaps...'
  };
}

/**
 * Execute START_ASSESSMENT action
 */
function executeStartAssessment(actionDecision: ActionDecision): ExecutionResult {
  const assessmentType = actionDecision.payload.assessmentType || 'aptitude';
  const route = '/assessment/start';
  
  // Record completed action
  if (!wasActionCompleted('aptitude_test_started')) {
    recordCompletedAction('aptitude_test_started', { type: assessmentType });
  }
  
  return {
    success: true,
    type: 'navigation',
    route: route,
    message: actionDecision.messageHint || `Starting your ${assessmentType} assessment...`
  };
}

/**
 * Execute OPEN_CHATBOT action
 */
function executeOpenChatbot(actionDecision: ActionDecision): ExecutionResult {
  const route = '/chatbot';
  
  // Could pass context to chatbot if needed
  const context = actionDecision.payload.metadata?.context;
  
  return {
    success: true,
    type: 'navigation',
    route: route,
    message: actionDecision.messageHint || 'Opening AI assistant...'
  };
}

/**
 * Validate route is safe
 */
export function isRouteSafe(route: string): boolean {
  return route in SAFE_ROUTES;
}

/**
 * Get safe route (returns whitelisted route or undefined)
 */
export function getSafeRoute(route: string): string | undefined {
  return SAFE_ROUTES[route];
}

