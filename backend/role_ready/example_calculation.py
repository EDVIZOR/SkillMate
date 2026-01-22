"""
Example Calculation Walkthrough
=================================
This file demonstrates how the SkillGapAnalyzer calculates readiness scores.
"""

from decimal import Decimal

# Example: User targeting "Senior Backend Engineer" role

# ============================================================================
# STEP 1: Role Skill Blueprint (from RoleSkillMapping)
# ============================================================================
role_skills = [
    {'skill': 'Python', 'weight': 30.0, 'priority': 'critical', 'category': 'Core'},
    {'skill': 'Docker', 'weight': 20.0, 'priority': 'high', 'category': 'Core'},
    {'skill': 'PostgreSQL', 'weight': 25.0, 'priority': 'high', 'category': 'Core'},
    {'skill': 'Redis', 'weight': 10.0, 'priority': 'medium', 'category': 'Supporting'},
    {'skill': 'Kubernetes', 'weight': 15.0, 'priority': 'medium', 'category': 'Advanced'},
]
# Total weight = 100%

# ============================================================================
# STEP 2: User Skill Profiles (from UserSkillProfile)
# ============================================================================
user_skills = {
    'Python': 'intermediate',      # 70%
    'Docker': 'beginner',          # 40%
    'PostgreSQL': 'advanced',      # 100%
    'Redis': 'beginner',           # 40%
    'Kubernetes': None,            # 0% (not in profile)
}

# Proficiency to percentage mapping:
PROFICIENCY_MAP = {
    'beginner': 40.0,
    'intermediate': 70.0,
    'advanced': 100.0,
    'expert': 100.0,
}

# ============================================================================
# STEP 3: Calculate Weighted Readiness Score
# ============================================================================
"""
Formula: Readiness = Σ (User_Proficiency × Skill_Weight) / Σ (Skill_Weight)

Calculation:
1. Python:     70% × 30% = 21.0
2. Docker:     40% × 20% = 8.0
3. PostgreSQL: 100% × 25% = 25.0
4. Redis:      40% × 10% = 4.0
5. Kubernetes: 0% × 15% = 0.0
--------------------------------
Total weighted score: 58.0
Total weight: 100%

Readiness Score = (58.0 / 100) × 100 = 58.0%
"""

total_weighted = 0.0
total_weight = 0.0

for role_skill in role_skills:
    skill_name = role_skill['skill']
    weight = role_skill['weight']
    user_prof = user_skills.get(skill_name)
    
    if user_prof:
        proficiency_pct = PROFICIENCY_MAP[user_prof]
    else:
        proficiency_pct = 0.0
    
    weighted_score = (proficiency_pct * weight) / 100.0
    total_weighted += weighted_score
    total_weight += weight
    
    print(f"{skill_name:15} | Weight: {weight:5.1f}% | Proficiency: {proficiency_pct:5.1f}% | Contribution: {weighted_score:5.1f}")

readiness_score = (total_weighted / total_weight) * 100.0

print(f"\n{'='*70}")
print(f"Total Weighted Score: {total_weighted:.2f}")
print(f"Total Weight: {total_weight:.2f}")
print(f"READINESS SCORE: {readiness_score:.2f}%")
print(f"{'='*70}\n")

# ============================================================================
# STEP 4: Calculate Individual Skill Gaps
# ============================================================================
"""
Gap Score = Required_Weight - (User_Proficiency × Required_Weight / 100)

Example calculations:
1. Python:     30% - (70% × 30% / 100) = 30% - 21% = 9.0
2. Docker:     20% - (40% × 20% / 100) = 20% - 8% = 12.0
3. PostgreSQL: 25% - (100% × 25% / 100) = 25% - 25% = 0.0
4. Redis:      10% - (40% × 10% / 100) = 10% - 4% = 6.0
5. Kubernetes: 15% - (0% × 15% / 100) = 15% - 0% = 15.0
"""

print("SKILL GAP BREAKDOWN:")
print(f"{'='*70}")
print(f"{'Skill':<15} | {'Weight':<8} | {'Proficiency':<12} | {'Gap Score':<10} | {'Level':<10}")
print(f"{'-'*70}")

for role_skill in role_skills:
    skill_name = role_skill['skill']
    weight = role_skill['weight']
    priority = role_skill['priority']
    category = role_skill['category']
    user_prof = user_skills.get(skill_name, None)
    
    if user_prof:
        proficiency_pct = PROFICIENCY_MAP[user_prof]
    else:
        proficiency_pct = 0.0
        user_prof = 'none'
    
    gap_score = weight - (proficiency_pct * weight / 100.0)
    
    # Classify gap level
    if proficiency_pct < 50.0:
        if category == 'Core' or priority in ['critical', 'high']:
            gap_level = 'CRITICAL'
        else:
            gap_level = 'MEDIUM'
    elif proficiency_pct < 70.0:
        gap_level = 'MEDIUM'
    else:
        gap_level = 'GROWTH'
    
    print(f"{skill_name:<15} | {weight:>6.1f}% | {user_prof:<12} ({proficiency_pct:>5.1f}%) | {gap_score:>8.1f}% | {gap_level:<10}")

print(f"{'='*70}\n")

# ============================================================================
# STEP 5: Summary
# ============================================================================
print("ANALYSIS SUMMARY:")
print(f"  Overall Readiness: {readiness_score:.1f}%")
print(f"  Critical Gaps: Docker (12.0%), Kubernetes (15.0%)")
print(f"  Medium Gaps: Python (9.0%), Redis (6.0%)")
print(f"  Strengths: PostgreSQL (0.0% gap)")
print(f"\nRecommendation: Focus on Docker and Kubernetes first (critical gaps)")
