"""
Skill Gap Analysis Service
==========================
Pure business logic for calculating skill gaps and readiness scores.
No views or HTTP logic - just reusable calculation services.
"""

from django.db import transaction
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Tuple, Optional
from .models import (
    CareerRole,
    Skill,
    RoleSkillMapping,
    UserSkillProfile,
    SkillGapResult,
    SkillGapBreakdown,
    LearningRoadmap,
    RoadmapStep,
)


class SkillGapAnalyzer:
    """
    Core service for analyzing skill gaps between a user and a target career role.
    
    This service:
    1. Fetches role skill requirements (skills + weights)
    2. Fetches user skill proficiencies
    3. Converts proficiency levels to percentages
    4. Calculates weighted readiness score
    5. Classifies skill gaps
    6. Persists results to database
    """
    
    # Proficiency level to percentage mapping
    PROFICIENCY_PERCENTAGES = {
        'beginner': Decimal('40.00'),
        'intermediate': Decimal('70.00'),
        'advanced': Decimal('100.00'),
        'expert': Decimal('100.00'),  # Expert is also 100%
    }
    
    # Gap level thresholds
    CRITICAL_THRESHOLD = Decimal('50.00')
    MEDIUM_THRESHOLD = Decimal('70.00')
    
    def __init__(self, user_id: int, target_role_id: int):
        """
        Initialize the analyzer with user and target role.
        
        Args:
            user_id: Django User ID
            target_role_id: CareerRole ID
        """
        self.user = User.objects.get(id=user_id)
        self.target_role = CareerRole.objects.get(id=target_role_id)
        self.user_profiles: Dict[int, UserSkillProfile] = {}
        self.role_mappings: List[RoleSkillMapping] = []
        
    def analyze(self) -> SkillGapResult:
        """
        Main entry point: Perform complete skill gap analysis.
        
        Returns:
            SkillGapResult: The saved analysis result
        """
        # Step 1: Fetch role skill blueprint
        self._fetch_role_skill_blueprint()
        
        # Step 2: Fetch user skills
        self._fetch_user_skills()
        
        # Step 3: Calculate readiness score
        readiness_score = self._calculate_readiness_score()
        
        # Step 4: Classify and calculate gaps
        gap_breakdowns = self._calculate_skill_gaps()
        
        # Step 5: Persist results
        return self._persist_results(readiness_score, gap_breakdowns)
    
    def _fetch_role_skill_blueprint(self) -> None:
        """Fetch all skill requirements for the target role."""
        self.role_mappings = RoleSkillMapping.objects.filter(
            role=self.target_role
        ).select_related('skill', 'role').order_by('-priority_level', '-weight')
        
        if not self.role_mappings.exists():
            raise ValueError(
                f"No skill mappings found for role: {self.target_role.name}. "
                "Please configure role skill requirements first."
            )
    
    def _fetch_user_skills(self) -> None:
        """Fetch all user skill profiles and index by skill_id."""
        profiles = UserSkillProfile.objects.filter(
            user=self.user
        ).select_related('skill')
        
        # Create a dictionary for O(1) lookup
        self.user_profiles = {profile.skill_id: profile for profile in profiles}
    
    def _get_user_proficiency_percentage(self, skill_id: int) -> Decimal:
        """
        Get user's proficiency percentage for a skill.
        
        Args:
            skill_id: Skill ID
            
        Returns:
            Decimal: Proficiency percentage (0-100)
        """
        profile = self.user_profiles.get(skill_id)
        
        if not profile:
            # User doesn't have this skill - return 0%
            return Decimal('0.00')
        
        return self.PROFICIENCY_PERCENTAGES.get(
            profile.proficiency_level,
            Decimal('0.00')
        )
    
    def _calculate_readiness_score(self) -> Decimal:
        """
        Calculate overall readiness score using weighted formula.
        
        Formula:
        Readiness = Σ (User_Proficiency × Skill_Weight) / Σ (Skill_Weight)
        
        Returns:
            Decimal: Readiness score (0-100)
        """
        total_weighted_score = Decimal('0.00')
        total_weight = Decimal('0.00')
        
        for mapping in self.role_mappings:
            skill_id = mapping.skill_id
            weight = Decimal(str(mapping.weight))
            user_proficiency = self._get_user_proficiency_percentage(skill_id)
            
            # Weighted contribution
            weighted_score = user_proficiency * weight / Decimal('100.00')
            total_weighted_score += weighted_score
            total_weight += weight
        
        if total_weight == 0:
            return Decimal('0.00')
        
        # Calculate final readiness score
        readiness_score = (total_weighted_score / total_weight) * Decimal('100.00')
        
        # Round to 2 decimal places
        return readiness_score.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def _calculate_skill_gaps(self) -> List[Dict]:
        """
        Calculate gap breakdown for each skill.
        
        Returns:
            List[Dict]: List of gap breakdown dictionaries ready for DB insertion
        """
        gap_breakdowns = []
        
        for mapping in self.role_mappings:
            skill = mapping.skill
            skill_id = skill.id
            required_weight = Decimal(str(mapping.weight))
            user_proficiency = self._get_user_proficiency_percentage(skill_id)
            
            # Calculate gap score (difference between required and actual)
            gap_score = required_weight - (user_proficiency * required_weight / Decimal('100.00'))
            
            # Get user proficiency level string
            profile = self.user_profiles.get(skill_id)
            user_proficiency_level = profile.proficiency_level if profile else 'beginner'
            
            # Classify gap level
            gap_level = self._classify_gap_level(
                skill=skill,
                user_proficiency=user_proficiency,
                required_weight=required_weight,
                priority=mapping.priority_level
            )
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                skill=skill,
                gap_level=gap_level,
                user_proficiency=user_proficiency,
                required_weight=required_weight
            )
            
            gap_breakdowns.append({
                'skill': skill,
                'user_proficiency': user_proficiency_level,
                'required_weight': required_weight,
                'gap_level': gap_level,
                'gap_score': gap_score.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                'recommendations': recommendations,
            })
        
        # Sort by gap score (highest gaps first)
        gap_breakdowns.sort(key=lambda x: x['gap_score'], reverse=True)
        
        return gap_breakdowns
    
    def _classify_gap_level(
        self,
        skill: Skill,
        user_proficiency: Decimal,
        required_weight: Decimal,
        priority: str
    ) -> str:
        """
        Classify the gap level for a skill.
        
        Classification rules:
        - Critical: Core skills with proficiency < 50% OR high priority skills < 50%
        - Medium: Supporting skills 50-70% OR medium priority skills
        - Growth: Advanced skills OR proficiency >= 70%
        - Exceeded: User proficiency exceeds requirements significantly
        
        Args:
            skill: Skill object
            user_proficiency: User's proficiency percentage
            required_weight: Required weight for this role
            priority: Priority level from mapping
            
        Returns:
            str: Gap level ('critical', 'medium', 'growth', 'exceeded')
        """
        # Check if user exceeds requirements
        if user_proficiency >= Decimal('90.00') and required_weight <= Decimal('50.00'):
            return 'exceeded'
        
        # Critical gaps
        if user_proficiency < self.CRITICAL_THRESHOLD:
            # Core skills or high/critical priority
            if (skill.category.name.lower() == 'core' or 
                priority in ['critical', 'high']):
                return 'critical'
            return 'medium'
        
        # Medium gaps
        if user_proficiency < self.MEDIUM_THRESHOLD:
            return 'medium'
        
        # Growth opportunities
        return 'growth'
    
    def _generate_recommendations(
        self,
        skill: Skill,
        gap_level: str,
        user_proficiency: Decimal,
        required_weight: Decimal
    ) -> str:
        """
        Generate recommendations for a skill gap.
        
        Args:
            skill: Skill object
            gap_level: Classified gap level
            user_proficiency: User's proficiency percentage
            required_weight: Required weight for this role
            
        Returns:
            str: Recommendation text
        """
        if gap_level == 'exceeded':
            return f"Excellent! You have strong proficiency in {skill.name}. Consider mentoring others or taking on advanced projects."
        
        if gap_level == 'critical':
            return (
                f"URGENT: {skill.name} is critical for this role. "
                f"Focus on foundational learning: start with basics, practice daily, "
                f"and consider structured courses or bootcamps."
            )
        
        if gap_level == 'medium':
            return (
                f"IMPROVE: {skill.name} needs attention. "
                f"Build on your existing knowledge with intermediate projects, "
                f"contribute to open source, or take advanced courses."
            )
        
        # growth
        return (
            f"GROWTH: {skill.name} is a growth opportunity. "
            f"Continue building expertise through advanced projects, "
            f"specialized training, or certifications."
        )
    
    @transaction.atomic
    def _persist_results(
        self,
        readiness_score: Decimal,
        gap_breakdowns: List[Dict]
    ) -> SkillGapResult:
        """
        Save analysis results to database.
        
        Args:
            readiness_score: Calculated readiness score
            gap_breakdowns: List of gap breakdown dictionaries
            
        Returns:
            SkillGapResult: The saved result object
        """
        # Create main gap result
        gap_result = SkillGapResult.objects.create(
            user=self.user,
            target_role=self.target_role,
            readiness_score=readiness_score,
            calculated_at=timezone.now()
        )
        
        # Create breakdown entries
        breakdown_objects = []
        for breakdown in gap_breakdowns:
            breakdown_objects.append(
                SkillGapBreakdown(
                    gap_result=gap_result,
                    skill=breakdown['skill'],
                    user_proficiency=breakdown['user_proficiency'],
                    required_weight=breakdown['required_weight'],
                    gap_level=breakdown['gap_level'],
                    gap_score=breakdown['gap_score'],
                    recommendations=breakdown['recommendations'],
                )
            )
        
        # Bulk create for efficiency
        SkillGapBreakdown.objects.bulk_create(breakdown_objects)
        
        return gap_result
    
    def get_analysis_summary(self, gap_result: SkillGapResult) -> Dict:
        """
        Get a summary of the analysis for API responses.
        
        Args:
            gap_result: The SkillGapResult object
            
        Returns:
            Dict: Summary dictionary
        """
        breakdowns = SkillGapBreakdown.objects.filter(
            gap_result=gap_result
        ).select_related('skill', 'skill__category').order_by('-gap_score')
        
        critical_gaps = [b for b in breakdowns if b.gap_level == 'critical']
        medium_gaps = [b for b in breakdowns if b.gap_level == 'medium']
        growth_opportunities = [b for b in breakdowns if b.gap_level == 'growth']
        exceeded_skills = [b for b in breakdowns if b.gap_level == 'exceeded']
        
        return {
            'readiness_score': float(gap_result.readiness_score),
            'target_role': {
                'id': gap_result.target_role.id,
                'name': gap_result.target_role.name,
                'industry': gap_result.target_role.industry.name,
            },
            'calculated_at': gap_result.calculated_at.isoformat(),
            'gap_summary': {
                'critical': len(critical_gaps),
                'medium': len(medium_gaps),
                'growth': len(growth_opportunities),
                'exceeded': len(exceeded_skills),
            },
            'critical_gaps': [
                {
                    'skill': b.skill.name,
                    'category': b.skill.category.name,
                    'gap_score': float(b.gap_score),
                    'recommendations': b.recommendations,
                }
                for b in critical_gaps[:5]  # Top 5 critical gaps
            ],
            'total_skills_analyzed': breakdowns.count(),
        }


class RoadmapGenerator:
    """
    Learning Roadmap Generation Service
    ===================================
    Converts skill gaps into actionable learning roadmaps.
    
    This service:
    1. Reads skill gap breakdown from database
    2. Orders skills by priority (Critical → Medium → Growth) and weight
    3. Generates roadmap steps (Learn → Build → Validate) for each skill
    4. Stores roadmap and steps in database
    5. Supports rebuilding when user updates skills
    """
    
    # Gap level priority order (higher number = higher priority)
    GAP_LEVEL_PRIORITY = {
        'critical': 3,
        'medium': 2,
        'growth': 1,
        'exceeded': 0,  # Exceeded skills can be skipped or placed last
    }
    
    # Step types for each skill
    STEP_TYPES = [
        {
            'type': 'learn',
            'title_template': 'Learn {skill_name} Fundamentals',
            'description_template': (
                'Master the core concepts and theory of {skill_name}. '
                'Focus on understanding fundamental principles, best practices, '
                'and industry standards. This foundation is crucial for practical application.'
            ),
            'estimated_hours_base': 20,
        },
        {
            'type': 'build',
            'title_template': 'Build {skill_name} Project',
            'description_template': (
                'Apply your knowledge by building a real-world project using {skill_name}. '
                'Create something practical that demonstrates your understanding and '
                'can be added to your portfolio.'
            ),
            'estimated_hours_base': 30,
        },
        {
            'type': 'validate',
            'title_template': 'Validate {skill_name} Mastery',
            'description_template': (
                'Validate your {skill_name} skills through deployment, assessment, '
                'or peer review. Ensure you can apply this skill in a professional context '
                'and meet the requirements for your target role.'
            ),
            'estimated_hours_base': 10,
        },
    ]
    
    def __init__(self, gap_result_id: int):
        """
        Initialize the roadmap generator with a skill gap result.
        
        Args:
            gap_result_id: SkillGapResult ID from gap analysis
        """
        self.gap_result = SkillGapResult.objects.select_related(
            'user', 'target_role'
        ).get(id=gap_result_id)
        self.user = self.gap_result.user
        self.target_role = self.gap_result.target_role
        
    def generate(self, rebuild_existing: bool = False) -> LearningRoadmap:
        """
        Generate or rebuild a learning roadmap.
        
        Args:
            rebuild_existing: If True, deactivate old roadmap and create new one
            
        Returns:
            LearningRoadmap: The generated roadmap
        """
        # Step 1: Fetch skill gap breakdowns
        gap_breakdowns = self._fetch_gap_breakdowns()
        
        # Step 2: Order skills by priority and weight
        ordered_skills = self._order_skills_by_priority(gap_breakdowns)
        
        # Step 3: Generate roadmap steps
        roadmap_steps = self._generate_steps(ordered_skills)
        
        # Step 4: Persist roadmap and steps
        return self._persist_roadmap(roadmap_steps, rebuild_existing)
    
    def _fetch_gap_breakdowns(self) -> List[SkillGapBreakdown]:
        """Fetch all skill gap breakdowns for this analysis."""
        breakdowns = SkillGapBreakdown.objects.filter(
            gap_result=self.gap_result
        ).select_related(
            'skill',
            'skill__category',
            'gap_result'
        ).exclude(
            gap_level='exceeded'  # Skip skills user already exceeds
        )
        
        if not breakdowns.exists():
            raise ValueError(
                "No skill gaps found. User may already be ready for this role, "
                "or gap analysis needs to be run first."
            )
        
        return list(breakdowns)
    
    def _order_skills_by_priority(
        self,
        gap_breakdowns: List[SkillGapBreakdown]
    ) -> List[SkillGapBreakdown]:
        """
        Order skills by priority: Critical → Medium → Growth, then by weight.
        
        Args:
            gap_breakdowns: List of skill gap breakdowns
            
        Returns:
            List[SkillGapBreakdown]: Ordered list of breakdowns
        """
        def sort_key(breakdown: SkillGapBreakdown) -> Tuple[int, float]:
            """
            Sort key: (gap_priority, -weight)
            Higher gap priority first, then higher weight first.
            """
            gap_priority = self.GAP_LEVEL_PRIORITY.get(
                breakdown.gap_level,
                0
            )
            weight = float(breakdown.required_weight)
            
            return (gap_priority, -weight)  # Negative for descending weight
        
        return sorted(gap_breakdowns, key=sort_key, reverse=True)
    
    def _generate_steps(
        self,
        ordered_breakdowns: List[SkillGapBreakdown]
    ) -> List[Dict]:
        """
        Generate roadmap steps for each skill.
        
        Args:
            ordered_breakdowns: Ordered list of skill gap breakdowns
            
        Returns:
            List[Dict]: List of step dictionaries ready for DB insertion
        """
        steps = []
        step_order = 1
        
        for breakdown in ordered_breakdowns:
            skill = breakdown.skill
            gap_level = breakdown.gap_level
            user_proficiency = breakdown.user_proficiency
            
            # Adjust estimated hours based on gap level
            hours_multiplier = self._get_hours_multiplier(gap_level, user_proficiency)
            
            # Generate 3 steps per skill: Learn, Build, Validate
            for step_type_info in self.STEP_TYPES:
                step = {
                    'skill': skill,
                    'step_order': step_order,
                    'title': step_type_info['title_template'].format(
                        skill_name=skill.name
                    ),
                    'description': self._generate_step_description(
                        step_type_info['description_template'],
                        skill,
                        breakdown,
                        step_type_info['type']
                    ),
                    'status': 'pending',
                    'estimated_hours': int(
                        step_type_info['estimated_hours_base'] * hours_multiplier
                    ),
                    'resources': self._generate_resources(
                        skill,
                        step_type_info['type'],
                        gap_level
                    ),
                    'assignments': self._generate_assignments(
                        skill,
                        step_type_info['type'],
                        gap_level,
                        breakdown
                    ),
                }
                steps.append(step)
                step_order += 1
        
        return steps
    
    def _get_hours_multiplier(self, gap_level: str, user_proficiency: str) -> float:
        """
        Calculate hours multiplier based on gap level and user proficiency.
        
        Args:
            gap_level: Gap level (critical, medium, growth)
            user_proficiency: User's current proficiency level
            
        Returns:
            float: Multiplier for estimated hours
        """
        # Base multipliers
        multipliers = {
            'critical': 1.5,  # Critical gaps need more time
            'medium': 1.2,    # Medium gaps need moderate time
            'growth': 1.0,    # Growth opportunities standard time
        }
        
        base_multiplier = multipliers.get(gap_level, 1.0)
        
        # Adjust based on proficiency
        if user_proficiency == 'beginner':
            return base_multiplier * 1.3  # Beginners need more time
        elif user_proficiency == 'intermediate':
            return base_multiplier * 1.0  # Standard time
        else:
            return base_multiplier * 0.8  # Advanced users need less time
    
    def _generate_step_description(
        self,
        template: str,
        skill: Skill,
        breakdown: SkillGapBreakdown,
        step_type: str
    ) -> str:
        """
        Generate detailed step description.
        
        Args:
            template: Description template
            skill: Skill object
            breakdown: Skill gap breakdown
            step_type: Type of step (learn, build, validate)
            
        Returns:
            str: Detailed description
        """
        description = template.format(skill_name=skill.name)
        
        # Add role-specific context
        description += f"\n\nTarget Role: {self.target_role.name}"
        description += f"\nSkill Category: {skill.category.name}"
        description += f"\nGap Level: {breakdown.gap_level.title()}"
        
        # Add step-specific guidance
        if step_type == 'learn':
            description += (
                f"\n\nFocus Areas: Start with {skill.category.name.lower()} fundamentals. "
                f"Review the recommendations: {breakdown.recommendations}"
            )
        elif step_type == 'build':
            description += (
                f"\n\nProject Ideas: Build a practical application that demonstrates "
                f"{skill.name} proficiency. Consider projects relevant to {self.target_role.name}."
            )
        elif step_type == 'validate':
            description += (
                f"\n\nValidation: Deploy your project, get code reviews, or complete "
                f"assessments. Ensure you meet the {breakdown.required_weight}% weight "
                f"requirement for this role."
            )
        
        return description
    
    def _generate_resources(
        self,
        skill: Skill,
        step_type: str,
        gap_level: str
    ) -> List[Dict]:
        """
        Generate learning resources for a step.
        
        Args:
            skill: Skill object
            step_type: Type of step (learn, build, validate)
            gap_level: Gap level
            
        Returns:
            List[Dict]: List of resource dictionaries
        """
        resources = []
        
        # Base resources (these would be enhanced with AI or external APIs)
        if step_type == 'learn':
            resources.extend([
                {
                    'type': 'documentation',
                    'title': f'{skill.name} Official Documentation',
                    'url': f'https://example.com/docs/{skill.name.lower()}',
                    'description': 'Official documentation and guides'
                },
                {
                    'type': 'course',
                    'title': f'Learn {skill.name} - Beginner Course',
                    'url': f'https://example.com/courses/{skill.name.lower()}',
                    'description': 'Structured learning course'
                },
            ])
            
            if gap_level == 'critical':
                resources.append({
                    'type': 'bootcamp',
                    'title': f'{skill.name} Intensive Bootcamp',
                    'url': f'https://example.com/bootcamp/{skill.name.lower()}',
                    'description': 'Intensive training program for critical skills'
                })
        
        elif step_type == 'build':
            resources.extend([
                {
                    'type': 'project_idea',
                    'title': f'{skill.name} Project Ideas',
                    'url': f'https://example.com/projects/{skill.name.lower()}',
                    'description': 'Project ideas and templates'
                },
                {
                    'type': 'github',
                    'title': f'{skill.name} Example Projects',
                    'url': f'https://github.com/topics/{skill.name.lower()}',
                    'description': 'Open source examples and projects'
                },
            ])
        
        elif step_type == 'validate':
            resources.extend([
                {
                    'type': 'assessment',
                    'title': f'{skill.name} Skill Assessment',
                    'url': f'https://example.com/assess/{skill.name.lower()}',
                    'description': 'Validate your skills with assessments'
                },
                {
                    'type': 'portfolio',
                    'title': 'Portfolio Showcase',
                    'url': 'https://example.com/portfolio',
                    'description': 'Showcase your projects'
                },
            ])
        
        return resources
    
    def _generate_assignments(
        self,
        skill: Skill,
        step_type: str,
        gap_level: str,
        breakdown: SkillGapBreakdown
    ) -> List[Dict]:
        """
        Generate assignments/tasks for a roadmap step.
        
        Args:
            skill: Skill object
            step_type: Type of step (learn, build, validate)
            gap_level: Gap level
            breakdown: Skill gap breakdown
            
        Returns:
            List[Dict]: List of assignment dictionaries with title, description, and deliverables
        """
        assignments = []
        
        if step_type == 'learn':
            assignments.extend([
                {
                    'title': f'Study {skill.name} Fundamentals',
                    'description': f'Read documentation and complete tutorials on {skill.name} core concepts. Focus on understanding the fundamental principles and best practices.',
                    'deliverables': [
                        'Complete at least 3 tutorial exercises',
                        'Write a summary document of key concepts',
                        'Create a cheat sheet or reference guide'
                    ]
                },
                {
                    'title': f'Watch {skill.name} Video Series',
                    'description': f'Watch comprehensive video tutorials covering {skill.name} from beginner to intermediate level. Take notes on important concepts.',
                    'deliverables': [
                        'Watch minimum 5 hours of video content',
                        'Complete all practice exercises in videos',
                        'Document key takeaways and insights'
                    ]
                },
                {
                    'title': f'Practice {skill.name} Concepts',
                    'description': f'Apply what you learned by practicing {skill.name} through hands-on exercises and small coding challenges.',
                    'deliverables': [
                        'Complete 10 practice exercises',
                        'Solve 3 coding challenges',
                        'Submit solutions for review'
                    ]
                }
            ])
            
            if gap_level == 'critical':
                assignments.append({
                    'title': f'Deep Dive: {skill.name} Advanced Topics',
                    'description': f'Since this is a critical skill gap, spend additional time on advanced {skill.name} topics relevant to {self.target_role.name}.',
                    'deliverables': [
                        'Research advanced use cases',
                        'Study real-world implementations',
                        'Document advanced patterns and techniques'
                    ]
                })
        
        elif step_type == 'build':
            assignments.extend([
                {
                    'title': f'Design {skill.name} Project',
                    'description': f'Design a practical project that demonstrates your {skill.name} skills. The project should be relevant to {self.target_role.name} role requirements.',
                    'deliverables': [
                        'Project proposal document',
                        'Architecture diagram or wireframe',
                        'Technology stack selection with justification'
                    ]
                },
                {
                    'title': f'Build {skill.name} Project',
                    'description': f'Implement the designed project using {skill.name}. Focus on writing clean, maintainable code following best practices.',
                    'deliverables': [
                        'Working project codebase',
                        'GitHub repository with proper README',
                        'Code follows best practices and conventions'
                    ]
                },
                {
                    'title': f'Test and Document {skill.name} Project',
                    'description': f'Write comprehensive tests for your project and create detailed documentation. Ensure the project is production-ready.',
                    'deliverables': [
                        'Unit tests with >80% coverage',
                        'Integration tests for key features',
                        'Complete project documentation (README, API docs, etc.)'
                    ]
                }
            ])
            
            if gap_level == 'critical':
                assignments.append({
                    'title': f'Enhance Project with Advanced {skill.name} Features',
                    'description': f'Add advanced {skill.name} features to showcase deeper understanding and meet critical skill requirements.',
                    'deliverables': [
                        'Implement at least 3 advanced features',
                        'Performance optimization',
                        'Security best practices implementation'
                    ]
                })
        
        elif step_type == 'validate':
            assignments.extend([
                {
                    'title': f'Deploy {skill.name} Project',
                    'description': f'Deploy your {skill.name} project to a production environment (cloud platform, hosting service, etc.). Ensure it\'s accessible and functional.',
                    'deliverables': [
                        'Live deployed project URL',
                        'Deployment documentation',
                        'Environment configuration guide'
                    ]
                },
                {
                    'title': f'Get Code Review for {skill.name} Project',
                    'description': f'Share your {skill.name} project with peers, mentors, or on code review platforms. Incorporate feedback to improve code quality.',
                    'deliverables': [
                        'Code review from at least 2 reviewers',
                        'List of feedback received',
                        'Refactored code based on feedback'
                    ]
                },
                {
                    'title': f'Complete {skill.name} Skill Assessment',
                    'description': f'Take a skill assessment or certification exam for {skill.name}. This validates your proficiency level for {self.target_role.name}.',
                    'deliverables': [
                        'Completed assessment/certification',
                        'Score report or certificate',
                        'Self-reflection on strengths and areas for improvement'
                    ]
                }
            ])
        
        return assignments
    
    @transaction.atomic
    def _persist_roadmap(
        self,
        roadmap_steps: List[Dict],
        rebuild_existing: bool
    ) -> LearningRoadmap:
        """
        Save roadmap and steps to database.
        
        Args:
            roadmap_steps: List of step dictionaries
            rebuild_existing: If True, deactivate old roadmap
            
        Returns:
            LearningRoadmap: The saved roadmap
        """
        # Get or create roadmap
        roadmap, created = LearningRoadmap.objects.get_or_create(
            user=self.user,
            target_role=self.target_role,
            defaults={
                'gap_result': self.gap_result,
                'is_active': True,
            }
        )
        
        if not created:
            # Update existing roadmap
            roadmap.gap_result = self.gap_result
            roadmap.is_active = True
            roadmap.save()
            
            # Delete old steps (this is the "rebuild" - new steps will be created)
            RoadmapStep.objects.filter(roadmap=roadmap).delete()
        
        # If rebuilding and roadmap was inactive, reactivate it
        if rebuild_existing and not roadmap.is_active:
            roadmap.is_active = True
            roadmap.save()
        
        # Create new steps
        step_objects = [
            RoadmapStep(
                roadmap=roadmap,
                skill=step['skill'],
                step_order=step['step_order'],
                title=step['title'],
                description=step['description'],
                status=step['status'],
                estimated_hours=step['estimated_hours'],
                resources=step['resources'],
            )
            for step in roadmap_steps
        ]
        
        RoadmapStep.objects.bulk_create(step_objects)
        
        return roadmap
    
    def get_roadmap_summary(self, roadmap: LearningRoadmap) -> Dict:
        """
        Get a summary of the roadmap for API responses.
        
        Args:
            roadmap: The LearningRoadmap object
            
        Returns:
            Dict: Summary dictionary
        """
        steps = RoadmapStep.objects.filter(
            roadmap=roadmap
        ).select_related('skill', 'skill__category').order_by('step_order')
        
        total_steps = steps.count()
        completed_steps = steps.filter(status='completed').count()
        in_progress_steps = steps.filter(status='in_progress').count()
        pending_steps = steps.filter(status='pending').count()
        
        total_hours = sum(step.estimated_hours or 0 for step in steps)
        completed_hours = sum(
            step.estimated_hours or 0
            for step in steps.filter(status='completed')
        )
        
        # Group steps by skill
        skills_roadmap = {}
        for step in steps:
            skill_name = step.skill.name
            if skill_name not in skills_roadmap:
                skills_roadmap[skill_name] = {
                    'skill': skill_name,
                    'category': step.skill.category.name,
                    'steps': [],
                }
            skills_roadmap[skill_name]['steps'].append({
                'order': step.step_order,
                'title': step.title,
                'status': step.status,
                'estimated_hours': step.estimated_hours,
            })
        
        return {
            'roadmap_id': roadmap.id,
            'target_role': {
                'id': roadmap.target_role.id,
                'name': roadmap.target_role.name,
                'industry': roadmap.target_role.industry.name,
            },
            'progress': {
                'total_steps': total_steps,
                'completed': completed_steps,
                'in_progress': in_progress_steps,
                'pending': pending_steps,
                'completion_percentage': (
                    (completed_steps / total_steps * 100) if total_steps > 0 else 0
                ),
            },
            'time_estimate': {
                'total_hours': total_hours,
                'completed_hours': completed_hours,
                'remaining_hours': total_hours - completed_hours,
            },
            'skills_roadmap': list(skills_roadmap.values()),
            'created_at': roadmap.created_at.isoformat(),
            'updated_at': roadmap.updated_at.isoformat(),
        }
