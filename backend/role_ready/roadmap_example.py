"""
Roadmap Generation Example
==========================
Demonstrates how the RoadmapGenerator creates learning roadmaps from skill gaps.
"""

from role_ready.services import SkillGapAnalyzer, RoadmapGenerator

# ============================================================================
# STEP 1: Run Skill Gap Analysis
# ============================================================================
print("=" * 70)
print("STEP 1: Running Skill Gap Analysis")
print("=" * 70)

# Initialize analyzer
analyzer = SkillGapAnalyzer(user_id=1, target_role_id=5)

# Run analysis
gap_result = analyzer.analyze()

print(f"\n✅ Gap Analysis Complete!")
print(f"   User: {gap_result.user.email}")
print(f"   Target Role: {gap_result.target_role.name}")
print(f"   Readiness Score: {gap_result.readiness_score}%")
print(f"   Calculated At: {gap_result.calculated_at}")

# Get summary
summary = analyzer.get_analysis_summary(gap_result)
print(f"\n📊 Gap Summary:")
print(f"   Critical Gaps: {summary['gap_summary']['critical']}")
print(f"   Medium Gaps: {summary['gap_summary']['medium']}")
print(f"   Growth Opportunities: {summary['gap_summary']['growth']}")

# ============================================================================
# STEP 2: Generate Learning Roadmap
# ============================================================================
print("\n" + "=" * 70)
print("STEP 2: Generating Learning Roadmap")
print("=" * 70)

# Initialize roadmap generator
roadmap_gen = RoadmapGenerator(gap_result_id=gap_result.id)

# Generate roadmap
roadmap = roadmap_gen.generate(rebuild_existing=False)

print(f"\n✅ Roadmap Generated!")
print(f"   Roadmap ID: {roadmap.id}")
print(f"   User: {roadmap.user.email}")
print(f"   Target Role: {roadmap.target_role.name}")
print(f"   Active: {roadmap.is_active}")

# ============================================================================
# STEP 3: Display Roadmap Steps
# ============================================================================
print("\n" + "=" * 70)
print("STEP 3: Roadmap Steps (Ordered by Priority)")
print("=" * 70)

from role_ready.models import RoadmapStep

steps = RoadmapStep.objects.filter(roadmap=roadmap).select_related(
    'skill', 'skill__category'
).order_by('step_order')

current_skill = None
step_count = 0

for step in steps:
    # Print skill header when skill changes
    if current_skill != step.skill.name:
        if current_skill is not None:
            print()  # Blank line between skills
        current_skill = step.skill.name
        step_count = 0
        print(f"\n📚 SKILL: {step.skill.name}")
        print(f"   Category: {step.skill.category.name}")
        print(f"   {'-' * 60}")
    
    step_count += 1
    step_type = "Learn" if step_count == 1 else ("Build" if step_count == 2 else "Validate")
    
    print(f"\n   Step {step.step_order}: {step.title}")
    print(f"   Type: {step_type}")
    print(f"   Status: {step.status.upper()}")
    print(f"   Estimated Hours: {step.estimated_hours}")
    print(f"   Description: {step.description[:100]}...")
    print(f"   Resources: {len(step.resources)} available")

# ============================================================================
# STEP 4: Get Roadmap Summary
# ============================================================================
print("\n" + "=" * 70)
print("STEP 4: Roadmap Summary")
print("=" * 70)

summary = roadmap_gen.get_roadmap_summary(roadmap)

print(f"\n📈 Progress:")
print(f"   Total Steps: {summary['progress']['total_steps']}")
print(f"   Completed: {summary['progress']['completed']}")
print(f"   In Progress: {summary['progress']['in_progress']}")
print(f"   Pending: {summary['progress']['pending']}")
print(f"   Completion: {summary['progress']['completion_percentage']:.1f}%")

print(f"\n⏱️  Time Estimate:")
print(f"   Total Hours: {summary['time_estimate']['total_hours']}")
print(f"   Completed Hours: {summary['time_estimate']['completed_hours']}")
print(f"   Remaining Hours: {summary['time_estimate']['remaining_hours']}")

print(f"\n🎯 Skills in Roadmap:")
for skill_data in summary['skills_roadmap']:
    print(f"   • {skill_data['skill']} ({skill_data['category']})")
    print(f"     Steps: {len(skill_data['steps'])}")

# ============================================================================
# STEP 5: Example Roadmap Structure
# ============================================================================
print("\n" + "=" * 70)
print("STEP 5: Example Roadmap Structure")
print("=" * 70)

print("""
Example Roadmap for "Senior Backend Engineer" role:

SKILL 1: PostgreSQL (Critical Gap)
├── Step 1: Learn PostgreSQL Fundamentals
│   ├── Status: Pending
│   ├── Hours: 30
│   └── Resources: Documentation, Course, Bootcamp
│
├── Step 2: Build PostgreSQL Project
│   ├── Status: Pending
│   ├── Hours: 45
│   └── Resources: Project Ideas, GitHub Examples
│
└── Step 3: Validate PostgreSQL Mastery
    ├── Status: Pending
    ├── Hours: 15
    └── Resources: Assessment, Portfolio

SKILL 2: Docker (Critical Gap)
├── Step 4: Learn Docker Fundamentals
├── Step 5: Build Docker Project
└── Step 6: Validate Docker Mastery

SKILL 3: Python (Medium Gap)
├── Step 7: Learn Python Advanced Concepts
├── Step 8: Build Python Project
└── Step 9: Validate Python Mastery

... and so on for all skills with gaps
""")

print("=" * 70)
print("✅ Roadmap Generation Complete!")
print("=" * 70)
