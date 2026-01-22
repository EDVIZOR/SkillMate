"""
Mentor-Style Feedback Generator
================================
Generates human-readable, encouraging feedback for users.
"""

from typing import Dict
from decimal import Decimal
from .models import SkillGapResult, LearningRoadmap, SkillGapBreakdown


class FeedbackGenerator:
    """
    Generates mentor-style feedback that feels human and encouraging.
    """
    
    def generate_feedback(
        self,
        gap_result: SkillGapResult,
        roadmap: LearningRoadmap
    ) -> Dict[str, str]:
        """
        Generate comprehensive mentor-style feedback.
        
        Args:
            gap_result: SkillGapResult object
            roadmap: LearningRoadmap object
            
        Returns:
            Dict with feedback sections
        """
        readiness_score = float(gap_result.readiness_score)
        role_name = gap_result.target_role.name
        
        # Get gap breakdowns
        breakdowns = SkillGapBreakdown.objects.filter(
            gap_result=gap_result
        ).select_related('skill', 'skill__category').order_by('-gap_score')
        
        critical_gaps = [b for b in breakdowns if b.gap_level == 'critical']
        medium_gaps = [b for b in breakdowns if b.gap_level == 'medium']
        growth_opportunities = [b for b in breakdowns if b.gap_level == 'growth']
        
        # Generate different sections
        overview = self._generate_overview(readiness_score, role_name)
        strengths = self._generate_strengths(breakdowns, readiness_score)
        focus_areas = self._generate_focus_areas(critical_gaps, medium_gaps)
        encouragement = self._generate_encouragement(readiness_score, roadmap)
        next_steps = self._generate_next_steps(roadmap, critical_gaps)
        
        return {
            'overview': overview,
            'strengths': strengths,
            'focus_areas': focus_areas,
            'encouragement': encouragement,
            'next_steps': next_steps,
            'full_message': self._combine_feedback(
                overview, strengths, focus_areas, encouragement, next_steps
            )
        }
    
    def _generate_overview(self, readiness_score: float, role_name: str) -> str:
        """Generate overview feedback."""
        if readiness_score >= 80:
            return (
                f"🎉 Excellent news! You're {readiness_score:.0f}% ready for the {role_name} role. "
                f"You're very close to being fully prepared. With a bit more focus on the remaining areas, "
                f"you'll be ready to excel in this position."
            )
        elif readiness_score >= 60:
            return (
                f"👍 Great progress! You're {readiness_score:.0f}% ready for the {role_name} role. "
                f"You've built a solid foundation, and you're more than halfway there. "
                f"With focused effort on the key areas we've identified, you'll reach your goal."
            )
        elif readiness_score >= 40:
            return (
                f"📚 You're {readiness_score:.0f}% ready for the {role_name} role. "
                f"You have a good starting point, and there's a clear path forward. "
                f"Don't worry—every expert was once a beginner. Let's build on what you know."
            )
        else:
            return (
                f"🚀 You're {readiness_score:.0f}% ready for the {role_name} role. "
                f"This is the beginning of an exciting journey! You have a roadmap ahead, "
                f"and with dedication and the right focus, you'll get there. Let's start building."
            )
    
    def _generate_strengths(
        self,
        breakdowns: list,
        readiness_score: float
    ) -> str:
        """Generate strengths feedback."""
        # Find skills with low or no gaps
        strong_skills = [
            b for b in breakdowns
            if b.gap_level in ['growth', 'exceeded'] or float(b.gap_score) < 5.0
        ]
        
        if not strong_skills:
            return (
                "💪 You're starting fresh, which means you have a clean slate to build on. "
                "Every skill you learn will be a new strength. Focus on the fundamentals first, "
                "and you'll see rapid progress."
            )
        
        if len(strong_skills) == 1:
            skill_name = strong_skills[0].skill.name
            return (
                f"✨ You're already strong in {skill_name}! This is a great foundation. "
                f"Use this strength as a confidence booster as you work on other areas."
            )
        
        skill_names = [b.skill.name for b in strong_skills[:3]]
        if len(skill_names) == 2:
            skills_text = f"{skill_names[0]} and {skill_names[1]}"
        else:
            skills_text = ", ".join(skill_names[:-1]) + f", and {skill_names[-1]}"
        
        return (
            f"🌟 You're already doing well in {skills_text}! These strengths will serve you well. "
            f"Build on this foundation as you develop the other skills needed for your target role."
        )
    
    def _generate_focus_areas(
        self,
        critical_gaps: list,
        medium_gaps: list
    ) -> str:
        """Generate focus areas feedback."""
        if not critical_gaps and not medium_gaps:
            return (
                "🎯 You're in great shape! Focus on deepening your existing skills and "
                "taking on more challenging projects to continue growing."
            )
        
        if critical_gaps:
            top_critical = critical_gaps[0]
            skill_name = top_critical.skill.name
            
            if len(critical_gaps) == 1:
                return (
                    f"🎯 Your top priority is {skill_name}. This is a critical skill for your target role, "
                    f"and focusing here will have the biggest impact on your readiness. "
                    f"Start with the fundamentals, practice consistently, and you'll see progress quickly."
                )
            else:
                other_count = len(critical_gaps) - 1
                return (
                    f"🎯 Your top priorities are {skill_name} and {other_count} other critical skill{'s' if other_count > 1 else ''}. "
                    f"These are essential for your target role. Tackle {skill_name} first, "
                    f"then move to the others. You've got this!"
                )
        
        # Only medium gaps
        top_medium = medium_gaps[0]
        skill_name = top_medium.skill.name
        return (
            f"📈 Focus on improving {skill_name} and similar areas. These aren't critical gaps, "
            f"but strengthening them will boost your overall readiness and confidence."
        )
    
    def _generate_encouragement(
        self,
        readiness_score: float,
        roadmap: LearningRoadmap
    ) -> str:
        """Generate encouragement feedback."""
        from .models import RoadmapStep
        total_steps = RoadmapStep.objects.filter(roadmap=roadmap).count()
        total_hours = sum(
            step.estimated_hours or 0
            for step in RoadmapStep.objects.filter(roadmap=roadmap)
        )
        
        if readiness_score >= 70:
            return (
                f"💡 You're almost there! With {total_steps} focused steps ahead, "
                f"you're looking at approximately {total_hours} hours of learning. "
                f"That's achievable in a few months with consistent effort. Keep going!"
            )
        elif readiness_score >= 50:
            return (
                f"💡 You're making great progress! Your roadmap has {total_steps} steps "
                f"and about {total_hours} hours of learning. Break it down into weekly goals, "
                f"and you'll be surprised how quickly you progress. Consistency is key!"
            )
        else:
            return (
                f"💡 This is your journey, and every step counts! Your roadmap has {total_steps} steps "
                f"and approximately {total_hours} hours of learning. That might seem like a lot, "
                f"but remember: you don't have to do it all at once. Take it one step at a time, "
                f"celebrate small wins, and you'll get there. I believe in you!"
            )
    
    def _generate_next_steps(
        self,
        roadmap: LearningRoadmap,
        critical_gaps: list
    ) -> str:
        """Generate next steps feedback."""
        from .models import RoadmapStep
        first_steps = RoadmapStep.objects.filter(
            roadmap=roadmap
        ).order_by('step_order')[:3]
        
        if not first_steps:
            return "✅ Review your roadmap and start with the first step. You've got this!"
        
        if len(first_steps) == 1:
            step = first_steps[0]
            return (
                f"✅ Start with: {step.title}. This is your first step on the journey. "
                f"Take your time, focus on understanding, and don't rush. "
                f"Every expert was once a beginner."
            )
        
        step_titles = [step.title for step in first_steps]
        return (
            f"✅ Your first steps: {step_titles[0]}, then {step_titles[1]}, followed by {step_titles[2]}. "
            f"These are designed to build on each other. Complete them in order, "
            f"and you'll see your skills grow steadily. Ready to begin?"
        )
    
    def _combine_feedback(
        self,
        overview: str,
        strengths: str,
        focus_areas: str,
        encouragement: str,
        next_steps: str
    ) -> str:
        """Combine all feedback sections into one cohesive message."""
        return f"{overview}\n\n{strengths}\n\n{focus_areas}\n\n{encouragement}\n\n{next_steps}"
