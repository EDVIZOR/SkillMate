/**
 * AI Memory and Personalization Layer for SkillMate
 * Stores lightweight, session-based context to improve guidance quality
 */

/**
 * Explanation style preference
 */
export type ExplanationStyle = 'very_simple' | 'slightly_detailed' | 'balanced';

/**
 * Confusion signal type
 */
export type ConfusionSignal = 'domain_selection' | 'learning_path' | 'career' | 'concept' | 'general';

/**
 * Completed action type
 */
export type CompletedAction = 
  | 'aptitude_test_started'
  | 'aptitude_test_completed'
  | 'domain_preview_viewed'
  | 'roadmap_viewed'
  | 'explanation_received'
  | 'career_guidance_received';

/**
 * Student memory context
 */
export interface StudentMemory {
  // Explained concepts (to avoid repetition)
  explainedConcepts: Array<{
    concept: string;
    domain?: string;
    timestamp: number;
    explanationStyle?: ExplanationStyle;
  }>;
  
  // Discussed/selected domains
  discussedDomains: Array<{
    domain: string;
    interestLevel?: 'high' | 'medium' | 'low';
    timestamp: number;
    context?: string;
  }>;
  
  // Confusion signals detected
  confusionSignals: Array<{
    type: ConfusionSignal;
    topic?: string;
    timestamp: number;
    resolved?: boolean;
  }>;
  
  // Preferred explanation style
  preferredExplanationStyle: ExplanationStyle;
  
  // Completed actions
  completedActions: Array<{
    action: CompletedAction;
    details?: Record<string, any>;
    timestamp: number;
  }>;
  
  // Interaction history (lightweight)
  recentInteractions: Array<{
    intent?: string;
    topic?: string;
    timestamp: number;
  }>;
  
  // Student level/context
  studentLevel?: 'first-year' | 'second-year' | 'beginner';
  firstInteraction?: number;
}

/**
 * Memory storage key
 */
const MEMORY_STORAGE_KEY = 'skillmate_ai_memory';

/**
 * Maximum items to keep in memory (to prevent bloat)
 */
const MAX_EXPLAINED_CONCEPTS = 20;
const MAX_DISCUSSED_DOMAINS = 10;
const MAX_CONFUSION_SIGNALS = 15;
const MAX_COMPLETED_ACTIONS = 20;
const MAX_RECENT_INTERACTIONS = 30;

/**
 * Get current student memory from storage
 */
export function getStudentMemory(): StudentMemory {
  try {
    const stored = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure firstInteraction is set if not present
      if (!parsed.firstInteraction) {
        parsed.firstInteraction = Date.now();
      }
      return parsed as StudentMemory;
    }
  } catch (error) {
    console.error('Error loading student memory:', error);
  }
  
  // Return default memory
  return {
    explainedConcepts: [],
    discussedDomains: [],
    confusionSignals: [],
    preferredExplanationStyle: 'balanced',
    completedActions: [],
    recentInteractions: [],
    firstInteraction: Date.now()
  };
}

/**
 * Save student memory to storage
 */
export function saveStudentMemory(memory: StudentMemory): void {
  try {
    // Clean up old entries to prevent bloat
    const cleaned = cleanMemory(memory);
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(cleaned));
  } catch (error) {
    console.error('Error saving student memory:', error);
  }
}

/**
 * Clean memory by removing old entries beyond limits
 */
function cleanMemory(memory: StudentMemory): StudentMemory {
  return {
    ...memory,
    explainedConcepts: memory.explainedConcepts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_EXPLAINED_CONCEPTS),
    discussedDomains: memory.discussedDomains
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_DISCUSSED_DOMAINS),
    confusionSignals: memory.confusionSignals
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_CONFUSION_SIGNALS),
    completedActions: memory.completedActions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_COMPLETED_ACTIONS),
    recentInteractions: memory.recentInteractions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_RECENT_INTERACTIONS)
  };
}

/**
 * Record an explained concept
 */
export function recordExplainedConcept(
  concept: string,
  domain?: string,
  explanationStyle?: ExplanationStyle
): void {
  const memory = getStudentMemory();
  memory.explainedConcepts.push({
    concept,
    domain,
    timestamp: Date.now(),
    explanationStyle: explanationStyle || memory.preferredExplanationStyle
  });
  saveStudentMemory(memory);
}

/**
 * Check if a concept was already explained
 */
export function wasConceptExplained(concept: string, domain?: string): boolean {
  const memory = getStudentMemory();
  const lowerConcept = concept.toLowerCase();
  
  return memory.explainedConcepts.some(
    item => item.concept.toLowerCase() === lowerConcept &&
            (!domain || !item.domain || item.domain.toLowerCase() === domain.toLowerCase())
  );
}

/**
 * Record a discussed domain
 */
export function recordDiscussedDomain(
  domain: string,
  interestLevel?: 'high' | 'medium' | 'low',
  context?: string
): void {
  const memory = getStudentMemory();
  
  // Check if domain already exists, update if so
  const existingIndex = memory.discussedDomains.findIndex(
    d => d.domain.toLowerCase() === domain.toLowerCase()
  );
  
  if (existingIndex >= 0) {
    // Update existing
    memory.discussedDomains[existingIndex] = {
      ...memory.discussedDomains[existingIndex],
      interestLevel: interestLevel || memory.discussedDomains[existingIndex].interestLevel,
      context: context || memory.discussedDomains[existingIndex].context,
      timestamp: Date.now()
    };
  } else {
    // Add new
    memory.discussedDomains.push({
      domain,
      interestLevel,
      timestamp: Date.now(),
      context
    });
  }
  
  saveStudentMemory(memory);
}

/**
 * Get most discussed domains
 */
export function getMostDiscussedDomains(limit: number = 3): string[] {
  const memory = getStudentMemory();
  
  // Count domain mentions
  const domainCounts: Record<string, number> = {};
  memory.discussedDomains.forEach(d => {
    domainCounts[d.domain] = (domainCounts[d.domain] || 0) + 1;
  });
  
  // Sort by count and return top domains
  return Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([domain]) => domain);
}

/**
 * Record a confusion signal
 */
export function recordConfusionSignal(
  type: ConfusionSignal,
  topic?: string
): void {
  const memory = getStudentMemory();
  memory.confusionSignals.push({
    type,
    topic,
    timestamp: Date.now(),
    resolved: false
  });
  saveStudentMemory(memory);
}

/**
 * Mark confusion signal as resolved
 */
export function resolveConfusionSignal(type: ConfusionSignal, topic?: string): void {
  const memory = getStudentMemory();
  const signal = memory.confusionSignals.find(
    s => s.type === type && 
         (!topic || s.topic?.toLowerCase() === topic.toLowerCase()) &&
         !s.resolved
  );
  
  if (signal) {
    signal.resolved = true;
    saveStudentMemory(memory);
  }
}

/**
 * Get unresolved confusion signals
 */
export function getUnresolvedConfusionSignals(): Array<{ type: ConfusionSignal; topic?: string }> {
  const memory = getStudentMemory();
  return memory.confusionSignals
    .filter(s => !s.resolved)
    .map(s => ({ type: s.type, topic: s.topic }));
}

/**
 * Update preferred explanation style
 */
export function updateExplanationStyle(style: ExplanationStyle): void {
  const memory = getStudentMemory();
  memory.preferredExplanationStyle = style;
  saveStudentMemory(memory);
}

/**
 * Record a completed action
 */
export function recordCompletedAction(
  action: CompletedAction,
  details?: Record<string, any>
): void {
  const memory = getStudentMemory();
  memory.completedActions.push({
    action,
    details,
    timestamp: Date.now()
  });
  saveStudentMemory(memory);
}

/**
 * Check if an action was completed
 */
export function wasActionCompleted(action: CompletedAction): boolean {
  const memory = getStudentMemory();
  return memory.completedActions.some(a => a.action === action);
}

/**
 * Record a recent interaction
 */
export function recordInteraction(intent?: string, topic?: string): void {
  const memory = getStudentMemory();
  memory.recentInteractions.push({
    intent,
    topic,
    timestamp: Date.now()
  });
  saveStudentMemory(memory);
}

/**
 * Get recent interaction context for personalization
 */
export function getRecentContext(): {
  lastTopic?: string;
  lastIntent?: string;
  recentTopics: string[];
  interactionCount: number;
} {
  const memory = getStudentMemory();
  const recent = memory.recentInteractions.slice(-5);
  
  return {
    lastTopic: recent[recent.length - 1]?.topic,
    lastIntent: recent[recent.length - 1]?.intent,
    recentTopics: recent
      .map(i => i.topic)
      .filter((t): t is string => !!t)
      .slice(-3),
    interactionCount: memory.recentInteractions.length
  };
}

/**
 * Get personalization context for AI prompts
 * This enriches inputs to Intent Understanding and Response Generation
 */
export function getPersonalizationContext(): {
  explainedConcepts: string[];
  discussedDomains: string[];
  confusionAreas: ConfusionSignal[];
  explanationStyle: ExplanationStyle;
  completedActions: CompletedAction[];
  recentContext: {
    lastTopic?: string;
    lastIntent?: string;
    recentTopics: string[];
  };
  isFirstTime?: boolean;
  studentLevel?: string;
} {
  const memory = getStudentMemory();
  const recentContext = getRecentContext();
  
  return {
    explainedConcepts: memory.explainedConcepts.map(c => c.concept),
    discussedDomains: memory.discussedDomains.map(d => d.domain),
    confusionAreas: memory.confusionSignals
      .filter(s => !s.resolved)
      .map(s => s.type),
    explanationStyle: memory.preferredExplanationStyle,
    completedActions: memory.completedActions.map(a => a.action),
    recentContext: {
      lastTopic: recentContext.lastTopic,
      lastIntent: recentContext.lastIntent,
      recentTopics: recentContext.recentTopics
    },
    isFirstTime: recentContext.interactionCount <= 1,
    studentLevel: memory.studentLevel
  };
}

/**
 * Clear all memory (for privacy/testing)
 */
export function clearMemory(): void {
  localStorage.removeItem(MEMORY_STORAGE_KEY);
}

/**
 * Get memory summary for transparency
 */
export function getMemorySummary(): {
  totalInteractions: number;
  explainedConceptsCount: number;
  discussedDomainsCount: number;
  confusionSignalsCount: number;
  completedActionsCount: number;
  firstInteractionDate?: Date;
} {
  const memory = getStudentMemory();
  
  return {
    totalInteractions: memory.recentInteractions.length,
    explainedConceptsCount: memory.explainedConcepts.length,
    discussedDomainsCount: memory.discussedDomains.length,
    confusionSignalsCount: memory.confusionSignals.length,
    completedActionsCount: memory.completedActions.length,
    firstInteractionDate: memory.firstInteraction ? new Date(memory.firstInteraction) : undefined
  };
}

