# RoleReady™ Database Schema Documentation

## Overview
This Django app implements the **Personalized Skill Gap Analyzer (RoleReady™)** feature. All data is stored in normalized relational models for efficient querying and future AI integration.

## Database Models & Relationships

### 1. Industry
**Purpose:** Categorize career roles by industry (Software, Cybersecurity, AI, etc.)

**Fields:**
- `name`: Industry name (unique)
- `description`: Optional description
- `created_at`: Timestamp

**Relationships:**
- One-to-Many → `CareerRole` (one industry has many roles)

---

### 2. CareerRole
**Purpose:** Store career roles that users can target (e.g., "Senior Software Engineer", "Data Scientist")

**Fields:**
- `name`: Role name
- `description`: Detailed description
- `industry`: ForeignKey to `Industry`
- `is_active`: Boolean flag
- `created_at`, `updated_at`: Timestamps

**Relationships:**
- Many-to-One → `Industry`
- One-to-Many → `RoleSkillMapping` (role has many skill mappings)
- One-to-Many → `SkillGapResult` (role has many gap analyses)
- One-to-Many → `LearningRoadmap` (role has many roadmaps)

**Unique Constraint:** `(name, industry)` - prevents duplicate roles in same industry

---

### 3. SkillCategory
**Purpose:** Categorize skills (Core / Supporting / Advanced)

**Fields:**
- `name`: Category name (unique)
- `description`: Optional description
- `order`: Display order

**Relationships:**
- One-to-Many → `Skill` (one category has many skills)

---

### 4. Skill
**Purpose:** Individual skills (e.g., "Python", "Docker", "Machine Learning")

**Fields:**
- `name`: Skill name (unique)
- `description`: Optional description
- `category`: ForeignKey to `SkillCategory`
- `is_active`: Boolean flag
- `created_at`, `updated_at`: Timestamps

**Relationships:**
- Many-to-One → `SkillCategory`
- One-to-Many → `RoleSkillMapping` (skill mapped to many roles)
- One-to-Many → `UserSkillProfile` (skill has many user profiles)
- One-to-Many → `SkillGapBreakdown` (skill appears in many gap analyses)
- One-to-Many → `RoadmapStep` (skill appears in roadmap steps)

---

### 5. RoleSkillMapping
**Purpose:** Many-to-many relationship between Roles and Skills with metadata

**Fields:**
- `role`: ForeignKey to `CareerRole`
- `skill`: ForeignKey to `Skill`
- `weight`: Decimal (0-100) - importance percentage for this role
- `priority_level`: Choice (critical/high/medium/low)
- `created_at`, `updated_at`: Timestamps

**Relationships:**
- Many-to-One → `CareerRole`
- Many-to-One → `Skill`

**Unique Constraint:** `(role, skill)` - prevents duplicate mappings

**Note:** This is the junction table that defines which skills are needed for each role and how important they are.

---

### 6. UserSkillProfile
**Purpose:** Store user's proficiency level for each skill

**Fields:**
- `user`: ForeignKey to `User` (Django's built-in User model)
- `skill`: ForeignKey to `Skill`
- `proficiency_level`: Choice (beginner/intermediate/advanced/expert)
- `experience_notes`: Optional text notes
- `verified_at`: Optional verification timestamp
- `created_at`, `updated_at`: Timestamps

**Relationships:**
- Many-to-One → `User`
- Many-to-One → `Skill`

**Unique Constraint:** `(user, skill)` - one profile per user-skill combination

---

### 7. SkillGapResult
**Purpose:** Store overall skill gap analysis result for a user targeting a role

**Fields:**
- `user`: ForeignKey to `User`
- `target_role`: ForeignKey to `CareerRole`
- `readiness_score`: Decimal (0-100) - overall readiness percentage
- `calculated_at`: Timestamp (auto-set on creation)
- `notes`: Optional analysis notes

**Relationships:**
- Many-to-One → `User`
- Many-to-One → `CareerRole`
- One-to-One → `LearningRoadmap` (optional)
- One-to-Many → `SkillGapBreakdown` (result has many skill breakdowns)

**Unique Constraint:** `(user, target_role, calculated_at)` - allows multiple analyses over time

---

### 8. SkillGapBreakdown
**Purpose:** Detailed breakdown of skill gaps for each skill in an analysis

**Fields:**
- `gap_result`: ForeignKey to `SkillGapResult`
- `skill`: ForeignKey to `Skill`
- `user_proficiency`: User's current proficiency level
- `required_weight`: Required weight for this role (from RoleSkillMapping)
- `gap_level`: Choice (critical/medium/growth/exceeded)
- `gap_score`: Calculated gap score for this skill
- `recommendations`: Optional text recommendations

**Relationships:**
- Many-to-One → `SkillGapResult`
- Many-to-One → `Skill`

**Unique Constraint:** `(gap_result, skill)` - one breakdown per skill per analysis

---

### 9. LearningRoadmap
**Purpose:** Learning roadmap for a user targeting a specific role

**Fields:**
- `user`: ForeignKey to `User`
- `target_role`: ForeignKey to `CareerRole`
- `gap_result`: OneToOne to `SkillGapResult` (optional - links to analysis)
- `is_active`: Boolean flag
- `created_at`, `updated_at`: Timestamps

**Relationships:**
- Many-to-One → `User`
- Many-to-One → `CareerRole`
- One-to-One → `SkillGapResult` (optional)
- One-to-Many → `RoadmapStep` (roadmap has many steps)

**Unique Constraint:** `(user, target_role)` - one active roadmap per user-role

---

### 10. RoadmapStep
**Purpose:** Individual ordered steps in a learning roadmap

**Fields:**
- `roadmap`: ForeignKey to `LearningRoadmap`
- `skill`: ForeignKey to `Skill` (skill to learn in this step)
- `step_order`: Integer (1, 2, 3, ...)
- `title`: Step title
- `description`: Detailed description
- `status`: Choice (pending/in_progress/completed/skipped)
- `resources`: JSONField - list of learning resources (URLs, books, courses)
- `estimated_hours`: Optional integer
- `started_at`, `completed_at`: Optional timestamps
- `created_at`, `updated_at`: Timestamps

**Relationships:**
- Many-to-One → `LearningRoadmap`
- Many-to-One → `Skill`

**Unique Constraint:** `(roadmap, step_order)` - ensures ordered steps

---

## Data Flow Example

1. **Setup Phase:**
   - Create `Industry` (e.g., "Software")
   - Create `CareerRole` (e.g., "Senior Backend Engineer")
   - Create `SkillCategory` (e.g., "Core", "Supporting", "Advanced")
   - Create `Skill` entries (e.g., "Python", "Docker", "PostgreSQL")
   - Create `RoleSkillMapping` entries linking role to skills with weights

2. **User Profiling:**
   - User fills out skill assessment
   - Create `UserSkillProfile` entries for each skill

3. **Gap Analysis:**
   - System calculates gap by comparing user profiles to role requirements
   - Create `SkillGapResult` with overall readiness score
   - Create `SkillGapBreakdown` entries for each skill gap

4. **Roadmap Generation:**
   - System generates learning roadmap based on gap analysis
   - Create `LearningRoadmap` linked to gap result
   - Create `RoadmapStep` entries in order

## Key Design Decisions

1. **Normalized Structure:** All data is normalized to prevent redundancy
2. **Timestamps:** All models have `created_at`/`updated_at` for audit trails
3. **Soft Deletes:** `is_active` flags allow soft deletion
4. **Flexible Weighting:** Decimal weights allow precise calculations
5. **JSON Resources:** Roadmap steps use JSONField for flexible resource storage
6. **OneToOne for Roadmap-Gap:** Links roadmap to specific gap analysis
7. **Unique Constraints:** Prevent duplicate data at database level
8. **Ordering:** Models have default ordering for consistent queries

## Future AI Integration

- All data is stored, not calculated in memory
- Historical gap analyses preserved via timestamps
- Skill proficiency tracking over time
- Roadmap completion tracking
- Resource recommendations can be enhanced with AI
- Gap scores can be recalculated with improved algorithms
