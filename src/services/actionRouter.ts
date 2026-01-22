import { IntentResponse, IntentType } from './intentUnderstanding';
import { getPersonalizationContext, getMostDiscussedDomains } from './aiMemory';

/**
 * Action types that the system can take based on user intent
 */
export enum ActionType {
  SHOW_EXPLANATION = 'SHOW_EXPLANATION',
  REDIRECT_TO_PAGE = 'REDIRECT_TO_PAGE',
  ASK_FOLLOWUP_QUESTION = 'ASK_FOLLOWUP_QUESTION',
  PROVIDE_REASSURANCE = 'PROVIDE_REASSURANCE',
  SHOW_ROADMAP = 'SHOW_ROADMAP',
  START_ASSESSMENT = 'START_ASSESSMENT',
  OPEN_CHATBOT = 'OPEN_CHATBOT',
  NO_ACTION = 'NO_ACTION'
}

/**
 * Structured action decision returned by the router
 */
export interface ActionDecision {
  action: ActionType;
  payload: ActionPayload;
  messageHint?: string;
  confidence: number;
  requiresConfirmation?: boolean;
}

/**
 * Payload structure for different action types
 */
export interface ActionPayload {
  // For REDIRECT_TO_PAGE
  route?: string;
  
  // For SHOW_EXPLANATION
  topic?: string;
  concept?: string;
  
  // For ASK_FOLLOWUP_QUESTION
  question?: string;
  options?: string[];
  
  // For SHOW_ROADMAP
  domain?: string;
  roadmapType?: 'beginner' | 'intermediate' | 'advanced';
  
  // For START_ASSESSMENT
  assessmentType?: 'aptitude' | 'interest' | 'combined';
  
  // For PROVIDE_REASSURANCE
  reassuranceType?: 'general' | 'domain_selection' | 'learning_path' | 'career';
  
  // Generic metadata
  metadata?: Record<string, any>;
}

/**
 * Route user intent to appropriate system action
 * This is a deterministic, rule-based routing layer
 * 
 * @param intentResponse - Structured intent from intent understanding layer
 * @returns Action decision with payload
 */
export function routeIntentToAction(intentResponse: IntentResponse): ActionDecision {
  // Validate intent response
  if (!intentResponse || intentResponse.confidence < 0.3) {
    return createNoActionDecision('Low confidence in intent classification');
  }

  // Route based on intent type
  switch (intentResponse.intent) {
    case IntentType.START_APTITUDE_TEST:
      return routeStartAptitudeTest(intentResponse);
    
    case IntentType.EXPLAIN_CONCEPT:
      return routeExplainConcept(intentResponse);
    
    case IntentType.GUIDE_DOMAIN:
      return routeGuideDomain(intentResponse);
    
    case IntentType.CONFUSION_HELP:
      return routeConfusionHelp(intentResponse);
    
    case IntentType.SHOW_ROADMAP:
      return routeShowRoadmap(intentResponse);
    
    case IntentType.NAVIGATE:
      return routeNavigate(intentResponse);
    
    case IntentType.GENERAL_QUESTION:
      return routeGeneralQuestion(intentResponse);
    
    case IntentType.UNKNOWN:
    default:
      return routeUnknownIntent(intentResponse);
  }
}

/**
 * Route START_APTITUDE_TEST intent
 */
function routeStartAptitudeTest(intentResponse: IntentResponse): ActionDecision {
  return {
    action: ActionType.START_ASSESSMENT,
    payload: {
      assessmentType: 'aptitude',
      metadata: {
        source: 'command_bar',
        intent: intentResponse.intent
      }
    },
    messageHint: 'Starting your aptitude and interest assessment...',
    confidence: intentResponse.confidence,
    requiresConfirmation: false
  };
}

/**
 * Route EXPLAIN_CONCEPT intent
 */
function routeExplainConcept(intentResponse: IntentResponse): ActionDecision {
  const topic = intentResponse.topic || extractTopicFromContext(intentResponse.context);
  
  if (!topic) {
    // If no topic extracted, ask follow-up question
    return {
      action: ActionType.ASK_FOLLOWUP_QUESTION,
      payload: {
        question: 'What would you like me to explain?',
        options: [
          'AI and Machine Learning',
          'Software Development',
          'Data Science',
          'Cybersecurity',
          'Cloud Computing',
          'Something else'
        ]
      },
      messageHint: 'I\'d be happy to explain! What topic are you curious about?',
      confidence: intentResponse.confidence
    };
  }
  
  return {
    action: ActionType.SHOW_EXPLANATION,
    payload: {
      topic: topic,
      concept: topic,
      metadata: {
        source: 'command_bar',
        intent: intentResponse.intent,
        domain: intentResponse.domain
      }
    },
    messageHint: `Let me explain ${topic} in a beginner-friendly way...`,
    confidence: intentResponse.confidence
  };
}

/**
 * Route GUIDE_DOMAIN intent
 * Uses memory to personalize domain suggestions
 */
function routeGuideDomain(intentResponse: IntentResponse): ActionDecision {
  // Get memory context
  const memoryContext = getPersonalizationContext();
  const mostDiscussed = getMostDiscussedDomains(2);
  
  // If specific domain mentioned, provide guidance for that domain
  if (intentResponse.domain) {
    return {
      action: ActionType.SHOW_EXPLANATION,
      payload: {
        topic: `Domain Guidance: ${intentResponse.domain}`,
        concept: intentResponse.domain,
        metadata: {
          source: 'command_bar',
          intent: intentResponse.intent,
          guidanceType: 'domain_selection',
          context: intentResponse.context
        }
      },
      messageHint: `Let me help you understand ${intentResponse.domain} and whether it's right for you...`,
      confidence: intentResponse.confidence
    };
  }
  
  // Otherwise, ask follow-up question with personalized options based on memory
  let question = 'Which CS domains are you considering?';
  let options = [
    'Software Development',
    'AI & Machine Learning',
    'Data Science',
    'Cybersecurity',
    'Cloud & DevOps',
    'Not sure yet'
  ];
  
  // Personalize based on previously discussed domains
  if (mostDiscussed.length > 0) {
    question = `I've noticed you've shown interest in ${mostDiscussed.join(' and ')}. Which domain would you like to explore more?`;
    // Reorder options to put discussed domains first
    const discussedSet = new Set(mostDiscussed);
    const discussedOptions = mostDiscussed;
    const otherOptions = options.filter(opt => !discussedSet.has(opt) && opt !== 'Not sure yet');
    options = [...discussedOptions, ...otherOptions, 'Not sure yet'];
  }
  
  return {
    action: ActionType.ASK_FOLLOWUP_QUESTION,
    payload: {
      question: question,
      options: options
    },
    messageHint: 'I can help you choose! What areas interest you most?',
    confidence: intentResponse.confidence
  };
}

/**
 * Route CONFUSION_HELP intent
 */
function routeConfusionHelp(intentResponse: IntentResponse): ActionDecision {
  // Determine what type of reassurance is needed based on context
  let reassuranceType: 'general' | 'domain_selection' | 'learning_path' | 'career' = 'general';
  
  if (intentResponse.context) {
    const context = intentResponse.context.toLowerCase();
    if (context.includes('domain') || context.includes('choose') || context.includes('path')) {
      reassuranceType = 'domain_selection';
    } else if (context.includes('learn') || context.includes('study') || context.includes('course')) {
      reassuranceType = 'learning_path';
    } else if (context.includes('career') || context.includes('job') || context.includes('future')) {
      reassuranceType = 'career';
    }
  }
  
  return {
    action: ActionType.PROVIDE_REASSURANCE,
    payload: {
      reassuranceType: reassuranceType,
      metadata: {
        source: 'command_bar',
        intent: intentResponse.intent,
        context: intentResponse.context
      }
    },
    messageHint: 'It\'s completely normal to feel confused. Let me help you find clarity...',
    confidence: intentResponse.confidence
  };
}

/**
 * Route SHOW_ROADMAP intent
 */
function routeShowRoadmap(intentResponse: IntentResponse): ActionDecision {
  const domain = intentResponse.domain || extractDomainFromContext(intentResponse.context);
  
  if (domain) {
    return {
      action: ActionType.SHOW_ROADMAP,
      payload: {
        domain: domain,
        roadmapType: 'beginner',
        metadata: {
          source: 'command_bar',
          intent: intentResponse.intent,
          topic: intentResponse.topic
        }
      },
      messageHint: `Here's a beginner-friendly roadmap for ${domain}...`,
      confidence: intentResponse.confidence
    };
  }
  
  // If no domain specified, ask follow-up
  return {
    action: ActionType.ASK_FOLLOWUP_QUESTION,
    payload: {
      question: 'Which domain would you like a roadmap for?',
      options: [
        'Software Development',
        'AI & Machine Learning',
        'Data Science',
        'Cybersecurity',
        'Cloud & DevOps'
      ]
    },
    messageHint: 'I can show you a learning path! Which domain interests you?',
    confidence: intentResponse.confidence
  };
}

/**
 * Route NAVIGATE intent
 */
function routeNavigate(intentResponse: IntentResponse): ActionDecision {
  const page = intentResponse.parameters?.page;
  
  // Map page names to routes
  const routeMap: Record<string, string> = {
    'dashboard': '/dashboard',
    'profile': '/profile',
    'roadmap': '/roadmaps',
    'roadmaps': '/roadmaps',
    'chatbot': '/chatbot',
    'chat': '/chatbot',
    'ai': '/chatbot'
  };
  
  const route = page ? routeMap[page.toLowerCase()] : undefined;
  
  if (route) {
    return {
      action: ActionType.REDIRECT_TO_PAGE,
      payload: {
        route: route,
        metadata: {
          source: 'command_bar',
          intent: intentResponse.intent
        }
      },
      messageHint: `Taking you to ${page}...`,
      confidence: intentResponse.confidence,
      requiresConfirmation: false
    };
  }
  
  // If route not found, ask for clarification
  return {
    action: ActionType.ASK_FOLLOWUP_QUESTION,
    payload: {
      question: 'Where would you like to go?',
      options: [
        'Dashboard',
        'Profile',
        'Roadmaps',
        'AI Chatbot'
      ]
    },
    messageHint: 'I can help you navigate! Where would you like to go?',
    confidence: intentResponse.confidence
  };
}

/**
 * Route GENERAL_QUESTION intent
 */
function routeGeneralQuestion(intentResponse: IntentResponse): ActionDecision {
  // For general questions, open chatbot for conversational response
  return {
    action: ActionType.OPEN_CHATBOT,
    payload: {
      metadata: {
        source: 'command_bar',
        intent: intentResponse.intent,
        topic: intentResponse.topic,
        context: intentResponse.context
      }
    },
    messageHint: 'Let me help you with that question...',
    confidence: intentResponse.confidence
  };
}

/**
 * Route UNKNOWN intent
 */
function routeUnknownIntent(intentResponse: IntentResponse): ActionDecision {
  return {
    action: ActionType.ASK_FOLLOWUP_QUESTION,
    payload: {
      question: 'I\'m not sure what you need. Can you help me understand?',
      options: [
        'I need help choosing a domain',
        'I want to understand a concept',
        'I want to start an assessment',
        'I want to see a learning roadmap',
        'I\'m feeling confused',
        'Something else'
      ]
    },
    messageHint: 'I want to help! Could you tell me more about what you need?',
    confidence: intentResponse.confidence
  };
}

/**
 * Create a NO_ACTION decision
 */
function createNoActionDecision(reason: string): ActionDecision {
  return {
    action: ActionType.NO_ACTION,
    payload: {
      metadata: {
        reason: reason
      }
    },
    confidence: 0.0,
    messageHint: reason
  };
}

/**
 * Extract topic from context string
 */
function extractTopicFromContext(context?: string): string | undefined {
  if (!context) return undefined;
  
  const topics = ['AI', 'Machine Learning', 'Software Development', 'Data Science', 'Cybersecurity', 'Cloud', 'DevOps'];
  const lowerContext = context.toLowerCase();
  
  for (const topic of topics) {
    if (lowerContext.includes(topic.toLowerCase())) {
      return topic;
    }
  }
  
  return undefined;
}

/**
 * Extract domain from context string
 */
function extractDomainFromContext(context?: string): string | undefined {
  if (!context) return undefined;
  
  const domainMap: Record<string, string> = {
    'software': 'Software Development',
    'software development': 'Software Development',
    'ai': 'AI & Machine Learning',
    'machine learning': 'AI & Machine Learning',
    'ml': 'AI & Machine Learning',
    'data science': 'Data Science',
    'cybersecurity': 'Cybersecurity',
    'security': 'Cybersecurity',
    'cloud': 'Cloud & DevOps',
    'devops': 'Cloud & DevOps'
  };
  
  const lowerContext = context.toLowerCase();
  
  for (const [key, domain] of Object.entries(domainMap)) {
    if (lowerContext.includes(key)) {
      return domain;
    }
  }
  
  return undefined;
}

/**
 * Get human-readable description of action type
 */
export function getActionDescription(action: ActionType): string {
  const descriptions: Record<ActionType, string> = {
    [ActionType.SHOW_EXPLANATION]: 'Show explanation',
    [ActionType.REDIRECT_TO_PAGE]: 'Redirect to page',
    [ActionType.ASK_FOLLOWUP_QUESTION]: 'Ask follow-up question',
    [ActionType.PROVIDE_REASSURANCE]: 'Provide reassurance',
    [ActionType.SHOW_ROADMAP]: 'Show roadmap',
    [ActionType.START_ASSESSMENT]: 'Start assessment',
    [ActionType.OPEN_CHATBOT]: 'Open chatbot',
    [ActionType.NO_ACTION]: 'No action'
  };
  
  return descriptions[action] || 'Unknown action';
}

