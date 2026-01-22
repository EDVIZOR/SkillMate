# SkillGapAnalyzer Service - Usage Guide

## Overview

The `SkillGapAnalyzer` is a pure service class that calculates skill gaps between a user and a target career role. It follows the service layer pattern - no HTTP logic, just reusable business logic.

## Quick Start

```python
from role_ready.services import SkillGapAnalyzer

# Initialize analyzer
analyzer = SkillGapAnalyzer(user_id=1, target_role_id=5)

# Run analysis
result = analyzer.analyze()

# Get summary
summary = analyzer.get_analysis_summary(result)
```

## Detailed Flow

### 1. Initialization

```python
analyzer = SkillGapAnalyzer(user_id=1, target_role_id=5)
```

**What happens:**
- Fetches User and CareerRole from database
- Initializes empty data structures

### 2. Analysis Execution

```python
result = analyzer.analyze()
```

**Internal steps:**

1. **Fetch Role Skill Blueprint**
   - Gets all `RoleSkillMapping` entries for the target role
   - Includes skills, weights, and priority levels

2. **Fetch User Skills**
   - Gets all `UserSkillProfile` entries for the user
   - Indexes by skill_id for O(1) lookup

3. **Calculate Readiness Score**
   - Formula: `Σ (User_Proficiency × Skill_Weight) / Σ (Skill_Weight) × 100`
   - Proficiency mapping:
     - Beginner = 40%
     - Intermediate = 70%
     - Advanced = 100%
     - Expert = 100%

4. **Calculate Skill Gaps**
   - For each required skill:
     - Calculate gap score
     - Classify gap level (critical/medium/growth/exceeded)
     - Generate recommendations

5. **Persist Results**
   - Creates `SkillGapResult` record
   - Creates `SkillGapBreakdown` records (bulk insert)

### 3. Get Summary

```python
summary = analyzer.get_analysis_summary(result)
```

Returns a dictionary with:
- `readiness_score`: Overall score (0-100)
- `target_role`: Role information
- `gap_summary`: Counts by gap level
- `critical_gaps`: Top 5 critical gaps with recommendations

## Example Calculation

### Input Data

**Role Requirements:**
- Python: 40% weight, Critical priority
- Docker: 30% weight, High priority
- PostgreSQL: 30% weight, High priority

**User Skills:**
- Python: Intermediate (70%)
- Docker: Beginner (40%)
- PostgreSQL: Not in profile (0%)

### Calculation

```
Python:      70% × 40% = 28.0
Docker:      40% × 30% = 12.0
PostgreSQL:   0% × 30% =  0.0
--------------------------------
Total:                   40.0

Readiness Score = (40.0 / 100.0) × 100 = 40.0%
```

### Gap Breakdown

| Skill | Weight | Proficiency | Gap Score | Level |
|-------|--------|-------------|-----------|-------|
| PostgreSQL | 30% | 0% | 30.0% | Critical |
| Docker | 30% | 40% | 18.0% | Critical |
| Python | 40% | 70% | 12.0% | Medium |

## Gap Classification Rules

### Critical
- Core skills with proficiency < 50%
- High/Critical priority skills with proficiency < 50%

### Medium
- Supporting skills with proficiency 50-70%
- Medium priority skills
- Core skills with proficiency 50-70% (but not high priority)

### Growth
- Skills with proficiency >= 70%
- Advanced category skills
- Low priority skills

### Exceeded
- User proficiency >= 90% AND required weight <= 50%

## Error Handling

```python
try:
    analyzer = SkillGapAnalyzer(user_id=1, target_role_id=5)
    result = analyzer.analyze()
except ValueError as e:
    # Role has no skill mappings
    print(f"Error: {e}")
except User.DoesNotExist:
    # User not found
    print("User does not exist")
except CareerRole.DoesNotExist:
    # Role not found
    print("Role does not exist")
```

## Database Transactions

The `analyze()` method uses `@transaction.atomic` to ensure:
- All-or-nothing: Either all data is saved or nothing is saved
- Data consistency: No partial results in database

## Performance Considerations

1. **Select Related**: Uses `select_related()` to reduce database queries
2. **Bulk Create**: Gap breakdowns are inserted in bulk
3. **Indexed Lookups**: User profiles indexed by skill_id for O(1) access

## Integration with Views

```python
# In your view or API endpoint
from role_ready.services import SkillGapAnalyzer
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def analyze_skill_gap(request):
    user_id = request.user.id
    target_role_id = request.data.get('role_id')
    
    # Use service - no business logic in view
    analyzer = SkillGapAnalyzer(user_id, target_role_id)
    result = analyzer.analyze()
    
    # Get summary for response
    summary = analyzer.get_analysis_summary(result)
    
    return Response(summary)
```

## Testing

Run tests with:

```bash
python manage.py test role_ready.tests.SkillGapAnalyzerTestCase
```

Tests cover:
- Readiness score calculation
- Gap breakdown creation
- Proficiency mapping
- Gap classification
- Error handling

## Best Practices

1. **Always use transactions**: Service handles this automatically
2. **Handle errors**: Check for missing data before analysis
3. **Cache results**: Consider caching if analyzing same user-role frequently
4. **Validate inputs**: Ensure user_id and role_id exist before calling
5. **Use summary for APIs**: Don't return full ORM objects, use summary dict
