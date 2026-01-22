from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Industry(models.Model):
    """Industry categories for career roles"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Industries"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class CareerRole(models.Model):
    """Career roles that users can target"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    industry = models.ForeignKey(
        Industry,
        on_delete=models.CASCADE,
        related_name='career_roles'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        unique_together = [['name', 'industry']]
    
    def __str__(self):
        return f"{self.name} ({self.industry.name})"


class SkillCategory(models.Model):
    """Categories for skills (Core / Supporting / Advanced)"""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0, help_text="Display order")
    
    class Meta:
        verbose_name_plural = "Skill Categories"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class Skill(models.Model):
    """Individual skills that can be mapped to roles"""
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        SkillCategory,
        on_delete=models.CASCADE,
        related_name='skills'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category__order', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.category.name})"


class RoleSkillMapping(models.Model):
    """Many-to-many relationship between Roles and Skills with weight and priority"""
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    role = models.ForeignKey(
        CareerRole,
        on_delete=models.CASCADE,
        related_name='skill_mappings'
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name='role_mappings'
    )
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Weight percentage (0-100) indicating importance for this role"
    )
    priority_level = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = [['role', 'skill']]
        ordering = ['-priority_level', '-weight']
    
    def __str__(self):
        return f"{self.role.name} - {self.skill.name} ({self.weight}%)"


class UserSkillProfile(models.Model):
    """User's proficiency level for specific skills"""
    PROFICIENCY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='skill_profiles'
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name='user_profiles'
    )
    proficiency_level = models.CharField(
        max_length=20,
        choices=PROFICIENCY_CHOICES,
        default='beginner'
    )
    experience_notes = models.TextField(
        blank=True,
        help_text="Optional notes about experience with this skill"
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = [['user', 'skill']]
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.skill.name} ({self.proficiency_level})"


class SkillGapResult(models.Model):
    """Overall skill gap analysis result for a user targeting a specific role"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='skill_gap_results'
    )
    target_role = models.ForeignKey(
        CareerRole,
        on_delete=models.CASCADE,
        related_name='gap_results'
    )
    readiness_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Overall readiness score (0-100)"
    )
    calculated_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, help_text="Optional analysis notes")
    
    class Meta:
        ordering = ['-calculated_at']
        unique_together = [['user', 'target_role', 'calculated_at']]
    
    def __str__(self):
        return f"{self.user.email} - {self.target_role.name} ({self.readiness_score}%)"


class SkillGapBreakdown(models.Model):
    """Detailed breakdown of skill gaps for each skill in a gap analysis"""
    GAP_LEVEL_CHOICES = [
        ('critical', 'Critical'),
        ('medium', 'Medium'),
        ('growth', 'Growth'),
        ('exceeded', 'Exceeded'),
    ]
    
    gap_result = models.ForeignKey(
        SkillGapResult,
        on_delete=models.CASCADE,
        related_name='breakdowns'
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name='gap_breakdowns'
    )
    user_proficiency = models.CharField(
        max_length=20,
        choices=UserSkillProfile.PROFICIENCY_CHOICES,
        help_text="User's current proficiency level"
    )
    required_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Required weight for this role"
    )
    gap_level = models.CharField(
        max_length=20,
        choices=GAP_LEVEL_CHOICES,
        help_text="Severity of the skill gap"
    )
    gap_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Calculated gap score for this skill"
    )
    recommendations = models.TextField(blank=True, help_text="Specific recommendations for this skill")
    
    class Meta:
        ordering = ['-gap_score']
        unique_together = [['gap_result', 'skill']]
    
    def __str__(self):
        return f"{self.gap_result.user.email} - {self.skill.name} ({self.gap_level})"


class LearningRoadmap(models.Model):
    """Learning roadmap for a user targeting a specific role"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='learning_roadmaps'
    )
    target_role = models.ForeignKey(
        CareerRole,
        on_delete=models.CASCADE,
        related_name='roadmaps'
    )
    gap_result = models.OneToOneField(
        SkillGapResult,
        on_delete=models.CASCADE,
        related_name='roadmap',
        null=True,
        blank=True,
        help_text="Associated skill gap result"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = [['user', 'target_role']]
    
    def __str__(self):
        return f"{self.user.email} - {self.target_role.name} Roadmap"


class RoadmapStep(models.Model):
    """Individual steps in a learning roadmap"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
    ]
    
    roadmap = models.ForeignKey(
        LearningRoadmap,
        on_delete=models.CASCADE,
        related_name='steps'
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name='roadmap_steps'
    )
    step_order = models.IntegerField(
        help_text="Order of this step in the roadmap (1, 2, 3, ...)"
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    resources = models.JSONField(
        default=list,
        blank=True,
        help_text="List of learning resources (URLs, books, courses, etc.)"
    )
    estimated_hours = models.IntegerField(
        null=True,
        blank=True,
        help_text="Estimated hours to complete this step"
    )
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['roadmap', 'step_order']
        unique_together = [['roadmap', 'step_order']]
    
    def __str__(self):
        return f"{self.roadmap} - Step {self.step_order}: {self.title}"
