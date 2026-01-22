"""
Serializers for RoleReady API
=============================
Handles request/response data validation and transformation.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Industry,
    CareerRole,
    SkillCategory,
    Skill,
    UserSkillProfile,
    SkillGapResult,
    SkillGapBreakdown,
    LearningRoadmap,
    RoadmapStep,
)


class IndustrySerializer(serializers.ModelSerializer):
    """Serializer for Industry model."""
    
    class Meta:
        model = Industry
        fields = ['id', 'name', 'description']


class CareerRoleSerializer(serializers.ModelSerializer):
    """Serializer for CareerRole model."""
    industry = IndustrySerializer(read_only=True)
    industry_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = CareerRole
        fields = ['id', 'name', 'description', 'industry', 'industry_id', 'is_active']


class SkillCategorySerializer(serializers.ModelSerializer):
    """Serializer for SkillCategory model."""
    
    class Meta:
        model = SkillCategory
        fields = ['id', 'name', 'description', 'order']


class SkillSerializer(serializers.ModelSerializer):
    """Serializer for Skill model."""
    category = SkillCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Skill
        fields = ['id', 'name', 'description', 'category', 'category_id', 'is_active']


class UserSkillProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserSkillProfile model."""
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = UserSkillProfile
        fields = [
            'id', 'skill', 'skill_id', 'proficiency_level',
            'experience_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BulkUserSkillProfileSerializer(serializers.Serializer):
    """Serializer for bulk updating user skills."""
    skills = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        ),
        min_length=1
    )
    
    def validate_skills(self, value):
        """Validate skills list structure."""
        for skill_data in value:
            if 'skill_id' not in skill_data:
                raise serializers.ValidationError("Each skill must have 'skill_id'")
            if 'proficiency_level' not in skill_data:
                raise serializers.ValidationError("Each skill must have 'proficiency_level'")
            
            proficiency = skill_data['proficiency_level']
            valid_levels = ['beginner', 'intermediate', 'advanced', 'expert']
            if proficiency not in valid_levels:
                raise serializers.ValidationError(
                    f"proficiency_level must be one of: {', '.join(valid_levels)}"
                )
        
        return value


class SkillGapBreakdownSerializer(serializers.ModelSerializer):
    """Serializer for SkillGapBreakdown model."""
    skill = SkillSerializer(read_only=True)
    
    class Meta:
        model = SkillGapBreakdown
        fields = [
            'id', 'skill', 'user_proficiency', 'required_weight',
            'gap_level', 'gap_score', 'recommendations'
        ]


class SkillGapResultSerializer(serializers.ModelSerializer):
    """Serializer for SkillGapResult model."""
    target_role = CareerRoleSerializer(read_only=True)
    breakdowns = SkillGapBreakdownSerializer(many=True, read_only=True)
    
    class Meta:
        model = SkillGapResult
        fields = [
            'id', 'user', 'target_role', 'readiness_score',
            'calculated_at', 'notes', 'breakdowns'
        ]
        read_only_fields = ['id', 'user', 'calculated_at']


class RoadmapStepSerializer(serializers.ModelSerializer):
    """Serializer for RoadmapStep model."""
    skill = SkillSerializer(read_only=True)
    
    class Meta:
        model = RoadmapStep
        fields = [
            'id', 'skill', 'step_order', 'title', 'description',
            'status', 'resources', 'assignments', 'estimated_hours',
            'started_at', 'completed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'step_order', 'title', 'description',
            'resources', 'estimated_hours', 'created_at', 'updated_at'
        ]


class LearningRoadmapSerializer(serializers.ModelSerializer):
    """Serializer for LearningRoadmap model."""
    target_role = CareerRoleSerializer(read_only=True)
    steps = RoadmapStepSerializer(many=True, read_only=True)
    
    class Meta:
        model = LearningRoadmap
        fields = [
            'id', 'user', 'target_role', 'is_active',
            'created_at', 'updated_at', 'steps'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class AnalyzeSkillGapRequestSerializer(serializers.Serializer):
    """Serializer for skill gap analysis request."""
    role_id = serializers.IntegerField(required=True)
    rebuild_roadmap = serializers.BooleanField(default=False, required=False)


class UpdateRoadmapStepStatusSerializer(serializers.Serializer):
    """Serializer for updating roadmap step status."""
    step_id = serializers.IntegerField(required=True)
    status = serializers.ChoiceField(
        choices=['pending', 'in_progress', 'completed', 'skipped'],
        required=True
    )
