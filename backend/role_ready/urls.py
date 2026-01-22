"""
URL Configuration for RoleReady API
===================================
"""

from django.urls import path
from . import views

app_name = 'role_ready'

urlpatterns = [
    # Industry and Role endpoints
    path('industries/', views.list_industries, name='list_industries'),
    path('roles/', views.list_career_roles, name='list_career_roles'),
    
    # Skill endpoints
    path('skills/', views.list_skills, name='list_skills'),
    path('skill-categories/', views.list_skill_categories, name='list_skill_categories'),
    
    # User skill profiles
    path('user-skills/', views.user_skills, name='user_skills'),
    
    # Skill gap analysis
    path('analyze/', views.analyze_skill_gap, name='analyze_skill_gap'),
    path('gap-results/<int:result_id>/', views.get_skill_gap_result, name='get_skill_gap_result'),
    
    # Roadmap endpoints
    path('roadmaps/', views.get_user_roadmaps, name='get_user_roadmaps'),
    path('roadmaps/<int:role_id>/', views.get_user_roadmap, name='get_user_roadmap'),
    path('roadmap-steps/update-status/', views.update_roadmap_step_status, name='update_roadmap_step_status'),
]
