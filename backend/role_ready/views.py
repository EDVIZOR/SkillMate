"""
API Views for RoleReady
=======================
REST API endpoints for skill gap analysis and roadmap generation.
Business logic is delegated to service classes.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.contrib.auth.models import User

from .models import (
    CareerRole,
    Skill,
    UserSkillProfile,
    SkillGapResult,
    LearningRoadmap,
    RoadmapStep,
)
from .serializers import (
    IndustrySerializer,
    CareerRoleSerializer,
    SkillCategorySerializer,
    SkillSerializer,
    UserSkillProfileSerializer,
    BulkUserSkillProfileSerializer,
    SkillGapResultSerializer,
    LearningRoadmapSerializer,
    RoadmapStepSerializer,
    AnalyzeSkillGapRequestSerializer,
    UpdateRoadmapStepStatusSerializer,
)
from .services import SkillGapAnalyzer, RoadmapGenerator
from .feedback_generator import FeedbackGenerator


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_industries(request):
    """Get all industries."""
    from .models import Industry
    industries = Industry.objects.all()
    serializer = IndustrySerializer(industries, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_career_roles(request):
    """Get all career roles, optionally filtered by industry."""
    industry_id = request.query_params.get('industry_id')
    
    roles = CareerRole.objects.filter(is_active=True).select_related('industry')
    
    if industry_id:
        roles = roles.filter(industry_id=industry_id)
    
    serializer = CareerRoleSerializer(roles, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_skills(request):
    """Get all skills, optionally filtered by category."""
    category_id = request.query_params.get('category_id')
    
    skills = Skill.objects.filter(is_active=True).select_related('category')
    
    if category_id:
        skills = skills.filter(category_id=category_id)
    
    serializer = SkillSerializer(skills, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_skill_categories(request):
    """Get all skill categories."""
    from .models import SkillCategory
    categories = SkillCategory.objects.all().order_by('order')
    serializer = SkillCategorySerializer(categories, many=True)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_skills(request):
    """Get or update user's skill profiles."""
    if request.method == 'GET':
        profiles = UserSkillProfile.objects.filter(
            user=request.user
        ).select_related('skill', 'skill__category')
        serializer = UserSkillProfileSerializer(profiles, many=True)
        return Response(serializer.data)
    
    # POST: Bulk update user skills
    serializer = BulkUserSkillProfileSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    with transaction.atomic():
        # Delete existing profiles
        UserSkillProfile.objects.filter(user=request.user).delete()
        
        # Create new profiles
        profiles_to_create = []
        for skill_data in serializer.validated_data['skills']:
            try:
                skill = Skill.objects.get(id=skill_data['skill_id'])
                profiles_to_create.append(
                    UserSkillProfile(
                        user=request.user,
                        skill=skill,
                        proficiency_level=skill_data['proficiency_level'],
                        experience_notes=skill_data.get('experience_notes', '')
                    )
                )
            except Skill.DoesNotExist:
                return Response(
                    {'error': f"Skill with id {skill_data['skill_id']} not found"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        UserSkillProfile.objects.bulk_create(profiles_to_create)
    
    # Return updated profiles
    profiles = UserSkillProfile.objects.filter(
        user=request.user
    ).select_related('skill', 'skill__category')
    serializer = UserSkillProfileSerializer(profiles, many=True)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_skill_gap(request):
    """
    Analyze skill gap for user targeting a specific role.
    
    Request body:
    {
        "role_id": 5,
        "rebuild_roadmap": false
    }
    """
    serializer = AnalyzeSkillGapRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    role_id = serializer.validated_data['role_id']
    rebuild_roadmap = serializer.validated_data.get('rebuild_roadmap', False)
    
    try:
        # Step 1: Run skill gap analysis
        analyzer = SkillGapAnalyzer(
            user_id=request.user.id,
            target_role_id=role_id
        )
        gap_result = analyzer.analyze()
        
        # Step 2: Generate roadmap
        roadmap_gen = RoadmapGenerator(gap_result_id=gap_result.id)
        roadmap = roadmap_gen.generate(rebuild_existing=rebuild_roadmap)
        
        # Step 3: Get summaries
        gap_summary = analyzer.get_analysis_summary(gap_result)
        roadmap_summary = roadmap_gen.get_roadmap_summary(roadmap)
        
        # Step 4: Generate mentor-style feedback
        feedback_gen = FeedbackGenerator()
        feedback = feedback_gen.generate_feedback(
            gap_result=gap_result,
            roadmap=roadmap
        )
        
        # Step 5: Build response
        response_data = {
            'gap_analysis': gap_summary,
            'roadmap': roadmap_summary,
            'feedback': feedback,
            'gap_result_id': gap_result.id,
            'roadmap_id': roadmap.id,
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except CareerRole.DoesNotExist:
        return Response(
            {'error': 'Career role not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'An error occurred: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_skill_gap_result(request, result_id):
    """Get a specific skill gap analysis result."""
    try:
        gap_result = SkillGapResult.objects.get(
            id=result_id,
            user=request.user
        )
        serializer = SkillGapResultSerializer(gap_result)
        return Response(serializer.data)
    except SkillGapResult.DoesNotExist:
        return Response(
            {'error': 'Skill gap result not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_roadmap(request, role_id):
    """Get user's roadmap for a specific role."""
    try:
        roadmap = LearningRoadmap.objects.get(
            user=request.user,
            target_role_id=role_id,
            is_active=True
        )
        serializer = LearningRoadmapSerializer(roadmap)
        return Response(serializer.data)
    except LearningRoadmap.DoesNotExist:
        return Response(
            {'error': 'Roadmap not found. Please run skill gap analysis first.'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_roadmap_step_status(request):
    """
    Update the status of a roadmap step.
    
    Request body:
    {
        "step_id": 5,
        "status": "in_progress"  // or "completed", "pending", "skipped"
    }
    """
    serializer = UpdateRoadmapStepStatusSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    step_id = serializer.validated_data['step_id']
    new_status = serializer.validated_data['status']
    
    try:
        step = RoadmapStep.objects.select_related('roadmap').get(
            id=step_id,
            roadmap__user=request.user
        )
        
        step.status = new_status
        
        # Update timestamps based on status
        from django.utils import timezone
        if new_status == 'in_progress' and not step.started_at:
            step.started_at = timezone.now()
        elif new_status == 'completed' and not step.completed_at:
            step.completed_at = timezone.now()
        
        step.save()
        
        serializer = RoadmapStepSerializer(step)
        return Response(serializer.data)
    
    except RoadmapStep.DoesNotExist:
        return Response(
            {'error': 'Roadmap step not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_roadmaps(request):
    """Get all roadmaps for the current user."""
    roadmaps = LearningRoadmap.objects.filter(
        user=request.user,
        is_active=True
    ).select_related('target_role', 'target_role__industry').order_by('-created_at')
    
    serializer = LearningRoadmapSerializer(roadmaps, many=True)
    return Response(serializer.data)
