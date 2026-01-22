# RoleReady™ Database Schema - Relationship Diagram

## Entity Relationship Overview

```
┌─────────────┐
│  Industry   │
│─────────────│
│ id          │
│ name        │◄──┐
│ description │   │
└─────────────┘   │
                  │ One-to-Many
┌─────────────┐   │
│ CareerRole  │───┘
│─────────────│
│ id          │
│ name        │
│ description │
│ industry_id │───┐
│ is_active   │   │
└─────────────┘   │
                  │ One-to-Many
┌─────────────────┐│
│RoleSkillMapping ││
│─────────────────││
│ id              ││
│ role_id         │◄─┘
│ skill_id        │───┐
│ weight (0-100)  │   │
│ priority_level  │   │
└─────────────────┘   │
                      │ Many-to-Many
┌─────────────┐       │ (via RoleSkillMapping)
│   Skill     │◄──────┘
│─────────────│
│ id          │
│ name        │
│ description │
│ category_id │───┐
│ is_active   │   │
└─────────────┘   │
                  │ One-to-Many
┌─────────────┐   │
│SkillCategory│◄──┘
│─────────────│
│ id          │
│ name        │
│ order       │
└─────────────┘


┌──────────────────┐
│       User       │ (Django built-in)
│──────────────────│
│ id                │
│ email             │
│ username          │
└──────────────────┘
         │
         │ One-to-Many
         │
┌──────────────────┐
│ UserSkillProfile │
│──────────────────│
│ id                │
│ user_id           │
│ skill_id          │───┐
│ proficiency_level │   │
│ experience_notes  │   │
└──────────────────┘   │
                       │ Many-to-One
┌─────────────┐        │
│   Skill     │◄───────┘
│─────────────│
└─────────────┘


┌──────────────────┐
│       User       │
│──────────────────│
└──────────────────┘
         │
         │ One-to-Many
         │
┌──────────────────┐
│ SkillGapResult   │
│──────────────────│
│ id                │
│ user_id           │
│ target_role_id    │───┐
│ readiness_score   │   │
│ calculated_at     │   │
└──────────────────┘   │
                       │ One-to-Many
┌─────────────┐        │
│ CareerRole  │◄───────┘
│─────────────│
└─────────────┘


┌──────────────────┐
│ SkillGapResult   │
│──────────────────│
└──────────────────┘
         │
         │ One-to-Many
         │
┌──────────────────┐
│SkillGapBreakdown │
│──────────────────│
│ id                │
│ gap_result_id     │
│ skill_id          │───┐
│ user_proficiency  │   │
│ required_weight   │   │
│ gap_level         │   │
│ gap_score         │   │
└──────────────────┘   │
                       │ Many-to-One
┌─────────────┐        │
│   Skill     │◄───────┘
│─────────────│
└─────────────┘


┌──────────────────┐
│       User       │
│──────────────────│
└──────────────────┘
         │
         │ One-to-Many
         │
┌──────────────────┐
│ LearningRoadmap  │
│──────────────────│
│ id                │
│ user_id           │
│ target_role_id    │───┐
│ gap_result_id     │   │ (OneToOne, optional)
│ is_active         │   │
└──────────────────┘   │
         │             │ One-to-Many
         │             │
         │ One-to-Many│
         │             │
┌──────────────────┐   │
│  RoadmapStep     │   │
│──────────────────│   │
│ id                │   │
│ roadmap_id        │   │
│ skill_id          │───┼───┐
│ step_order        │   │   │
│ title             │   │   │
│ status            │   │   │
│ resources (JSON)   │   │   │
└──────────────────┘   │   │
                       │   │ Many-to-One
┌─────────────┐        │   │
│ CareerRole  │◄───────┘   │
│─────────────│            │
└─────────────┘            │
                           │
┌─────────────┐            │
│   Skill     │◄────────────┘
│─────────────│
└─────────────┘
```

## Key Relationships Summary

### Core Setup Models
- **Industry** → **CareerRole** (One-to-Many)
- **SkillCategory** → **Skill** (One-to-Many)
- **CareerRole** ↔ **Skill** (Many-to-Many via **RoleSkillMapping**)

### User Data Models
- **User** → **UserSkillProfile** (One-to-Many)
- **Skill** → **UserSkillProfile** (One-to-Many)
- **User** → **SkillGapResult** (One-to-Many)
- **CareerRole** → **SkillGapResult** (One-to-Many)
- **SkillGapResult** → **SkillGapBreakdown** (One-to-Many)
- **Skill** → **SkillGapBreakdown** (One-to-Many)

### Roadmap Models
- **User** → **LearningRoadmap** (One-to-Many)
- **CareerRole** → **LearningRoadmap** (One-to-Many)
- **SkillGapResult** → **LearningRoadmap** (One-to-One, optional)
- **LearningRoadmap** → **RoadmapStep** (One-to-Many)
- **Skill** → **RoadmapStep** (One-to-Many)

## Data Integrity Rules

1. **Unique Constraints:**
   - `(CareerRole.name, CareerRole.industry)` - No duplicate roles in same industry
   - `(RoleSkillMapping.role, RoleSkillMapping.skill)` - No duplicate mappings
   - `(UserSkillProfile.user, UserSkillProfile.skill)` - One profile per user-skill
   - `(LearningRoadmap.user, LearningRoadmap.target_role)` - One roadmap per user-role
   - `(RoadmapStep.roadmap, RoadmapStep.step_order)` - Ordered steps

2. **Foreign Key Constraints:**
   - All foreign keys use `CASCADE` deletion
   - Ensures data consistency when parent records are deleted

3. **Validation:**
   - Weight fields: 0-100 (decimal)
   - Readiness score: 0-100 (decimal)
   - Step order: Positive integers
