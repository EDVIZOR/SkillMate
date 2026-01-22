import { sendMessageToLongCat, ChatMessage } from './longcatApi';

/**
 * Supported CS domains
 */
export type CSDomain = 
  | 'Software Development'
  | 'AI & Machine Learning'
  | 'Data Science'
  | 'Cybersecurity'
  | 'Cloud & DevOps';

/**
 * Student level/experience
 */
export type StudentLevel = 'beginner' | 'first-year' | 'second-year';

/**
 * Domain Preview Input
 */
export interface DomainPreviewInput {
  domain: CSDomain;
  studentLevel?: StudentLevel;
  context?: string;
}

/**
 * Domain Preview Output
 */
export interface DomainPreviewOutput {
  title: string;
  description: string;
  dayInTheLife: string;
  typicalTasks: string[];
  skillsNeeded: string[];
  whyItMatters: string;
}

/**
 * Career Reasoning Input
 */
export interface CareerReasoningInput {
  domain: CSDomain;
  studentInterests?: string[];
  thinkingStyle?: string;
  context?: string;
}

/**
 * Career Reasoning Output
 */
export interface CareerReasoningOutput {
  domain: CSDomain;
  whyItFits: string;
  keyStrengths: string[];
  learningApproach: string;
  careerPath: string;
  encouragement: string;
}

/**
 * Learning Roadmap Input
 */
export interface LearningRoadmapInput {
  domain: CSDomain;
  studentLevel: StudentLevel;
  currentKnowledge?: string[];
  goals?: string;
}

/**
 * Learning Roadmap Output
 */
export interface LearningRoadmapOutput {
  domain: CSDomain;
  overview: string;
  year1: RoadmapPhase;
  year2: RoadmapPhase;
  year3: RoadmapPhase;
  year4: RoadmapPhase;
  nextSteps: string[];
  encouragement: string;
}

export interface RoadmapPhase {
  title: string;
  duration: string;
  focus: string;
  topics: string[];
  projects: string[];
  resources: string[];
}

/**
 * System prompts for domain intelligence modules
 */

const DOMAIN_PREVIEW_PROMPT = `You are an AI assistant for SkillMate, helping first-year CS engineering students understand what it's like to work in different CS domains.

Generate a realistic, beginner-friendly "day in the life" preview for a CS domain. Your response must:
- Be written in simple, everyday language (NO technical jargon)
- Feel relatable and realistic, like a friend describing their job
- Show what a typical day looks like
- Include typical tasks they'd do
- Mention skills needed (in simple terms)
- Explain why this domain matters (in beginner-friendly way)
- Be encouraging and not intimidating
- Be 2-3 paragraphs for the day description, plus lists

Format your response as JSON with this structure:
{
  "title": "A Day in [Domain]",
  "description": "Brief 2-sentence overview",
  "dayInTheLife": "Detailed paragraph describing a typical day",
  "typicalTasks": ["task 1", "task 2", "task 3", "task 4"],
  "skillsNeeded": ["skill 1", "skill 2", "skill 3"],
  "whyItMatters": "1-2 sentences explaining importance in simple terms"
}

Return ONLY the JSON, no other text.`;

const CAREER_REASONING_PROMPT = `You are an AI career guidance assistant for SkillMate, helping first-year CS students understand why a domain might fit them.

Explain why a CS domain suits a student's interests or thinking style. Your response must:
- Use simple, encouraging language (NO technical jargon)
- Be warm, supportive, and confidence-building
- Explain connections between student traits and domain requirements
- Use relatable examples and analogies
- Be specific but not overwhelming
- Focus on beginner-friendly aspects
- Be 3-4 paragraphs total

Format your response as JSON:
{
  "domain": "[Domain Name]",
  "whyItFits": "2-3 paragraph explanation of why this domain fits",
  "keyStrengths": ["strength 1", "strength 2", "strength 3"],
  "learningApproach": "1-2 sentences about how to approach learning",
  "careerPath": "1-2 sentences about career possibilities",
  "encouragement": "1-2 sentences of supportive encouragement"
}

Return ONLY the JSON, no other text.`;

const LEARNING_ROADMAP_PROMPT = `You are an AI learning path advisor for SkillMate, creating beginner-friendly learning roadmaps for first-year CS students.

Generate a clear, step-by-step, year-wise learning roadmap. Your response must:
- Start from absolute beginner level (no prior coding knowledge assumed)
- Be organized by academic years (Year 1, Year 2, Year 3, Year 4)
- Use simple language (NO technical jargon)
- Be realistic and achievable
- Include practical projects
- Suggest beginner-friendly resources
- Be encouraging and low-pressure
- Show gradual progression

Format your response as JSON:
{
  "domain": "[Domain Name]",
  "overview": "2-3 sentence overview of the learning journey",
  "year1": {
    "title": "Year 1: Foundation",
    "duration": "Months 1-12",
    "focus": "What to focus on",
    "topics": ["topic 1", "topic 2", "topic 3"],
    "projects": ["project 1", "project 2"],
    "resources": ["resource 1", "resource 2"]
  },
  "year2": { ... same structure ... },
  "year3": { ... same structure ... },
  "year4": { ... same structure ... },
  "nextSteps": ["step 1", "step 2", "step 3"],
  "encouragement": "1-2 sentences of encouragement"
}

Return ONLY the JSON, no other text.`;

/**
 * Generate Domain Preview - "Day in the Life" experience
 */
export async function generateDomainPreview(input: DomainPreviewInput): Promise<DomainPreviewOutput> {
  try {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: DOMAIN_PREVIEW_PROMPT
      },
      {
        role: 'user',
        content: `Generate a day in the life preview for: ${input.domain}${input.context ? `. Context: ${input.context}` : ''}`
      }
    ];

    const response = await sendMessageToLongCat(
      messages,
      1500, // More tokens for detailed preview
      0.7   // Moderate temperature for realistic but friendly tone
    );

    if (response.choices && response.choices.length > 0) {
      const content = response.choices[0].message.content.trim();
      const parsed = parseJSONResponse<DomainPreviewOutput>(content);
      
      // Validate and set defaults
      return {
        title: parsed.title || `A Day in ${input.domain}`,
        description: parsed.description || `An overview of what it's like to work in ${input.domain}`,
        dayInTheLife: parsed.dayInTheLife || 'A typical day involves...',
        typicalTasks: parsed.typicalTasks || [],
        skillsNeeded: parsed.skillsNeeded || [],
        whyItMatters: parsed.whyItMatters || 'This domain is important because...'
      };
    } else {
      throw new Error('No response from AI');
    }
  } catch (error) {
    console.error('Error generating domain preview:', error);
    // Return fallback preview
    return getFallbackDomainPreview(input.domain);
  }
}

/**
 * Generate Career & Domain Reasoning
 */
export async function generateCareerReasoning(input: CareerReasoningInput): Promise<CareerReasoningOutput> {
  try {
    const interests = input.studentInterests?.join(', ') || 'general CS interests';
    const thinkingStyle = input.thinkingStyle || 'analytical and creative';
    
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: CAREER_REASONING_PROMPT
      },
      {
        role: 'user',
        content: `Explain why ${input.domain} fits a student with interests in: ${interests}, and thinking style: ${thinkingStyle}${input.context ? `. Context: ${input.context}` : ''}`
      }
    ];

    const response = await sendMessageToLongCat(
      messages,
      1200, // Moderate tokens for reasoning
      0.7   // Moderate temperature
    );

    if (response.choices && response.choices.length > 0) {
      const content = response.choices[0].message.content.trim();
      const parsed = parseJSONResponse<CareerReasoningOutput>(content);
      
      return {
        domain: parsed.domain || input.domain,
        whyItFits: parsed.whyItFits || 'This domain could be a great fit because...',
        keyStrengths: parsed.keyStrengths || [],
        learningApproach: parsed.learningApproach || 'Start with basics and build gradually...',
        careerPath: parsed.careerPath || 'Career opportunities include...',
        encouragement: parsed.encouragement || 'You\'re on the right path!'
      };
    } else {
      throw new Error('No response from AI');
    }
  } catch (error) {
    console.error('Error generating career reasoning:', error);
    return getFallbackCareerReasoning(input.domain);
  }
}

/**
 * Generate Learning Roadmap
 */
export async function generateLearningRoadmap(input: LearningRoadmapInput): Promise<LearningRoadmapOutput> {
  try {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: LEARNING_ROADMAP_PROMPT
      },
      {
        role: 'user',
        content: `Generate a learning roadmap for: ${input.domain}, starting from ${input.studentLevel} level${input.goals ? `. Goals: ${input.goals}` : ''}`
      }
    ];

    const response = await sendMessageToLongCat(
      messages,
      2000, // More tokens for detailed roadmap
      0.6   // Lower temperature for more structured output
    );

    if (response.choices && response.choices.length > 0) {
      const content = response.choices[0].message.content.trim();
      const parsed = parseJSONResponse<LearningRoadmapOutput>(content);
      
      // Validate and set defaults
      return {
        domain: parsed.domain || input.domain,
        overview: parsed.overview || `A learning journey for ${input.domain}`,
        year1: parsed.year1 || getDefaultRoadmapPhase('Year 1: Foundation'),
        year2: parsed.year2 || getDefaultRoadmapPhase('Year 2: Building Skills'),
        year3: parsed.year3 || getDefaultRoadmapPhase('Year 3: Specialization'),
        year4: parsed.year4 || getDefaultRoadmapPhase('Year 4: Advanced & Projects'),
        nextSteps: parsed.nextSteps || ['Start with basics', 'Practice regularly', 'Build projects'],
        encouragement: parsed.encouragement || 'Take it one step at a time. You\'ve got this!'
      };
    } else {
      throw new Error('No response from AI');
    }
  } catch (error) {
    console.error('Error generating learning roadmap:', error);
    return getFallbackLearningRoadmap(input.domain);
  }
}

/**
 * Parse JSON response from AI, handling markdown code blocks
 */
function parseJSONResponse<T>(content: string): T {
  try {
    // Remove markdown code blocks if present
    let jsonString = content.trim();
    jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Try to find JSON object
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }
    
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    throw error;
  }
}

/**
 * Fallback domain previews
 */
function getFallbackDomainPreview(domain: CSDomain): DomainPreviewOutput {
  const fallbacks: Record<CSDomain, DomainPreviewOutput> = {
    'Software Development': {
      title: 'A Day in Software Development',
      description: 'Software developers create applications and programs that people use every day.',
      dayInTheLife: 'A typical day starts with checking what needs to be built or fixed. You might spend the morning writing code to add a new feature to an app, like a button that lets users save their progress. In the afternoon, you could test your code to make sure it works correctly, and then work with your team to plan what to build next. It\'s like being a digital craftsman, building tools that help people.',
      typicalTasks: ['Writing code for features', 'Testing and fixing bugs', 'Planning with team members', 'Learning new tools'],
      skillsNeeded: ['Problem-solving', 'Attention to detail', 'Patience', 'Logical thinking'],
      whyItMatters: 'Software is everywhere - from your phone apps to websites. Developers make technology work for people.'
    },
    'AI & Machine Learning': {
      title: 'A Day in AI & Machine Learning',
      description: 'AI engineers teach computers to learn and make decisions like humans do.',
      dayInTheLife: 'Your day might begin by preparing data - like organizing photos so a computer can learn to recognize cats. Then you\'d train a model, which is like teaching the computer through examples. You\'d check how well it learned and adjust it to make it better. It\'s like being a teacher for computers, helping them understand patterns and make smart decisions.',
      typicalTasks: ['Preparing and organizing data', 'Training AI models', 'Testing AI performance', 'Improving accuracy'],
      skillsNeeded: ['Curiosity', 'Pattern recognition', 'Math basics', 'Creative thinking'],
      whyItMatters: 'AI helps solve complex problems and makes technology smarter, from recommendations to medical diagnosis.'
    },
    'Data Science': {
      title: 'A Day in Data Science',
      description: 'Data scientists find meaningful patterns in information to help make better decisions.',
      dayInTheLife: 'You\'d start by collecting data - maybe sales numbers or survey responses. Then you\'d clean it up and organize it, like sorting through a messy room. Next, you\'d analyze it to find interesting patterns, like "people buy more ice cream in summer." Finally, you\'d create visualizations - charts and graphs - to share your findings with others. It\'s like being a detective, finding hidden stories in numbers.',
      typicalTasks: ['Collecting and cleaning data', 'Analyzing patterns', 'Creating visualizations', 'Presenting findings'],
      skillsNeeded: ['Curiosity about data', 'Logical thinking', 'Communication', 'Attention to detail'],
      whyItMatters: 'Data helps businesses and organizations make better decisions and understand their customers.'
    },
    'Cybersecurity': {
      title: 'A Day in Cybersecurity',
      description: 'Cybersecurity experts protect computer systems and data from threats and attacks.',
      dayInTheLife: 'Your day involves checking systems for any suspicious activity, like a security guard watching for problems. You might test security measures to find weaknesses before bad actors do. When issues are found, you\'d fix them quickly. You also stay updated on new threats and teach others about staying safe online. It\'s like being a digital protector, keeping information safe.',
      typicalTasks: ['Monitoring for threats', 'Testing security', 'Fixing vulnerabilities', 'Educating users'],
      skillsNeeded: ['Attention to detail', 'Problem-solving', 'Ethical thinking', 'Staying updated'],
      whyItMatters: 'Cybersecurity protects our personal information, money, and important systems from digital threats.'
    },
    'Cloud & DevOps': {
      title: 'A Day in Cloud & DevOps',
      description: 'Cloud engineers manage and optimize how applications run on the internet.',
      dayInTheLife: 'You\'d start by checking if applications are running smoothly on cloud servers. You might set up new servers or adjust existing ones to handle more users. You\'d automate tasks to make things run more efficiently, like setting up automatic backups. You also help developers deploy their code quickly and safely. It\'s like being a digital infrastructure manager, making sure everything runs smoothly behind the scenes.',
      typicalTasks: ['Managing cloud servers', 'Automating processes', 'Deploying applications', 'Monitoring performance'],
      skillsNeeded: ['System thinking', 'Organization', 'Problem-solving', 'Efficiency focus'],
      whyItMatters: 'Cloud technology makes applications fast, reliable, and accessible to people everywhere.'
    }
  };
  
  return fallbacks[domain] || fallbacks['Software Development'];
}

/**
 * Fallback career reasoning
 */
function getFallbackCareerReasoning(domain: CSDomain): CareerReasoningOutput {
  return {
    domain: domain,
    whyItFits: `${domain} could be a great fit if you enjoy solving problems and working with technology. This field offers many opportunities to create, learn, and grow.`,
    keyStrengths: ['Problem-solving ability', 'Logical thinking', 'Curiosity to learn'],
    learningApproach: 'Start with the basics and build your skills gradually. Practice regularly and don\'t be afraid to ask questions.',
    careerPath: 'This domain offers various career paths from entry-level positions to specialized roles as you gain experience.',
    encouragement: 'Every expert was once a beginner. Take your time, stay curious, and you\'ll find your way!'
  };
}

/**
 * Fallback learning roadmap
 */
function getFallbackLearningRoadmap(domain: CSDomain): LearningRoadmapOutput {
  return {
    domain: domain,
    overview: `A structured learning path for ${domain}, starting from the basics and building up to advanced topics.`,
    year1: getDefaultRoadmapPhase('Year 1: Foundation'),
    year2: getDefaultRoadmapPhase('Year 2: Building Skills'),
    year3: getDefaultRoadmapPhase('Year 3: Specialization'),
    year4: getDefaultRoadmapPhase('Year 4: Advanced & Projects'),
    nextSteps: ['Start with basics', 'Practice regularly', 'Build small projects', 'Join communities'],
    encouragement: 'Learning takes time. Go at your own pace and celebrate small wins along the way!'
  };
}

/**
 * Get default roadmap phase
 */
function getDefaultRoadmapPhase(title: string): RoadmapPhase {
  return {
    title: title,
    duration: '12 months',
    focus: 'Building foundational knowledge and skills',
    topics: ['Core concepts', 'Basic tools', 'Fundamentals'],
    projects: ['Simple practice projects', 'Beginner exercises'],
    resources: ['Online tutorials', 'Beginner courses', 'Documentation']
  };
}

