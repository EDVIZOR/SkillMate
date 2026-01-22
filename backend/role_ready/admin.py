from django.contrib import admin
from .models import (
    Industry,
    CareerRole,
    SkillCategory,
    Skill,
    RoleSkillMapping,
    UserSkillProfile,
    SkillGapResult,
    SkillGapBreakdown,
    LearningRoadmap,
    RoadmapStep,
)


@admin.register(Industry)
class IndustryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['created_at']


@admin.register(CareerRole)
class CareerRoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'industry', 'is_active', 'created_at']
    list_filter = ['industry', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    raw_id_fields = ['industry']


@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'order', 'description']
    list_editable = ['order']
    ordering = ['order']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    raw_id_fields = ['category']


@admin.register(RoleSkillMapping)
class RoleSkillMappingAdmin(admin.ModelAdmin):
    list_display = ['role', 'skill', 'weight', 'priority_level', 'created_at']
    list_filter = ['priority_level', 'created_at']
    search_fields = ['role__name', 'skill__name']
    raw_id_fields = ['role', 'skill']


@admin.register(UserSkillProfile)
class UserSkillProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'skill', 'proficiency_level', 'updated_at']
    list_filter = ['proficiency_level', 'created_at', 'updated_at']
    search_fields = ['user__email', 'skill__name']
    raw_id_fields = ['user', 'skill']


@admin.register(SkillGapResult)
class SkillGapResultAdmin(admin.ModelAdmin):
    list_display = ['user', 'target_role', 'readiness_score', 'calculated_at']
    list_filter = ['calculated_at', 'target_role']
    search_fields = ['user__email', 'target_role__name']
    raw_id_fields = ['user', 'target_role']
    readonly_fields = ['calculated_at']


class SkillGapBreakdownInline(admin.TabularInline):
    model = SkillGapBreakdown
    extra = 0
    fields = ['skill', 'user_proficiency', 'required_weight', 'gap_level', 'gap_score']
    readonly_fields = ['gap_score']


@admin.register(SkillGapBreakdown)
class SkillGapBreakdownAdmin(admin.ModelAdmin):
    list_display = ['gap_result', 'skill', 'user_proficiency', 'required_weight', 'gap_level', 'gap_score']
    list_filter = ['gap_level', 'gap_result__target_role']
    search_fields = ['gap_result__user__email', 'skill__name']
    raw_id_fields = ['gap_result', 'skill']


class RoadmapStepInline(admin.TabularInline):
    model = RoadmapStep
    extra = 0
    fields = ['step_order', 'skill', 'title', 'status', 'estimated_hours']
    ordering = ['step_order']


@admin.register(LearningRoadmap)
class LearningRoadmapAdmin(admin.ModelAdmin):
    list_display = ['user', 'target_role', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at', 'target_role']
    search_fields = ['user__email', 'target_role__name']
    raw_id_fields = ['user', 'target_role', 'gap_result']
    inlines = [RoadmapStepInline]


@admin.register(RoadmapStep)
class RoadmapStepAdmin(admin.ModelAdmin):
    list_display = ['roadmap', 'step_order', 'skill', 'title', 'status', 'estimated_hours']
    list_filter = ['status', 'roadmap__target_role']
    search_fields = ['title', 'description', 'skill__name']
    raw_id_fields = ['roadmap', 'skill']
    ordering = ['roadmap', 'step_order']
