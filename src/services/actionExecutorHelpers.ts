import { CSDomain } from './domainIntelligence';

/**
 * Helper functions for domain intelligence integration in action executor
 */

/**
 * Detect domain from topic string
 */
export function detectDomainFromTopic(topic: string): CSDomain | null {
  const lowerTopic = topic.toLowerCase();
  
  const domainMap: Record<string, CSDomain> = {
    'software': 'Software Development',
    'software development': 'Software Development',
    'programming': 'Software Development',
    'web development': 'Software Development',
    'app development': 'Software Development',
    'ai': 'AI & Machine Learning',
    'machine learning': 'AI & Machine Learning',
    'artificial intelligence': 'AI & Machine Learning',
    'ml': 'AI & Machine Learning',
    'data science': 'Data Science',
    'data': 'Data Science',
    'analytics': 'Data Science',
    'cybersecurity': 'Cybersecurity',
    'security': 'Cybersecurity',
    'cyber': 'Cybersecurity',
    'cloud': 'Cloud & DevOps',
    'devops': 'Cloud & DevOps',
    'infrastructure': 'Cloud & DevOps'
  };
  
  for (const [key, domain] of Object.entries(domainMap)) {
    if (lowerTopic.includes(key)) {
      return domain;
    }
  }
  
  return null;
}

/**
 * Check if topic is domain-related
 */
export function isDomainTopic(topic: string): boolean {
  return detectDomainFromTopic(topic) !== null;
}

/**
 * Validate if string is a valid domain
 */
export function isValidDomain(domain: string): domain is CSDomain {
  const validDomains: CSDomain[] = [
    'Software Development',
    'AI & Machine Learning',
    'Data Science',
    'Cybersecurity',
    'Cloud & DevOps'
  ];
  return validDomains.includes(domain as CSDomain);
}

/**
 * Format career reasoning into friendly message
 */
export function formatCareerReasoningMessage(reasoning: any): string {
  let message = `**Why ${reasoning.domain} Might Be Right For You**\n\n`;
  message += `${reasoning.whyItFits}\n\n`;
  
  if (reasoning.keyStrengths && reasoning.keyStrengths.length > 0) {
    message += `**Key Strengths:** ${reasoning.keyStrengths.join(', ')}\n\n`;
  }
  
  if (reasoning.learningApproach) {
    message += `${reasoning.learningApproach}\n\n`;
  }
  
  if (reasoning.careerPath) {
    message += `${reasoning.careerPath}\n\n`;
  }
  
  if (reasoning.encouragement) {
    message += `💜 ${reasoning.encouragement}`;
  }
  
  return message;
}

/**
 * Format roadmap into friendly message
 */
export function formatRoadmapMessage(roadmap: any): string {
  let message = `**Learning Roadmap for ${roadmap.domain}**\n\n`;
  message += `${roadmap.overview}\n\n`;
  
  // Add year-by-year breakdown
  if (roadmap.year1) {
    message += `**${roadmap.year1.title}** (${roadmap.year1.duration})\n`;
    message += `Focus: ${roadmap.year1.focus}\n`;
    if (roadmap.year1.topics && roadmap.year1.topics.length > 0) {
      message += `Topics: ${roadmap.year1.topics.slice(0, 3).join(', ')}\n`;
    }
    message += `\n`;
  }
  
  if (roadmap.nextSteps && roadmap.nextSteps.length > 0) {
    message += `**Next Steps:**\n`;
    roadmap.nextSteps.slice(0, 3).forEach((step: string, index: number) => {
      message += `${index + 1}. ${step}\n`;
    });
    message += `\n`;
  }
  
  if (roadmap.encouragement) {
    message += `💜 ${roadmap.encouragement}`;
  }
  
  return message;
}

