# RoleReady API Documentation

## Base URL
```
/api/role-ready/
```

All endpoints require authentication (Bearer token).

---

## Endpoints

### 1. Get Industries
**GET** `/api/role-ready/industries/`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Software",
    "description": "Software Development"
  }
]
```

---

### 2. Get Career Roles
**GET** `/api/role-ready/roles/`

**Query Parameters:**
- `industry_id` (optional): Filter by industry

**Response:**
```json
[
  {
    "id": 5,
    "name": "Senior Backend Engineer",
    "description": "Senior backend developer role",
    "industry": {
      "id": 1,
      "name": "Software"
    },
    "is_active": true
  }
]
```

---

### 3. Get Skills
**GET** `/api/role-ready/skills/`

**Query Parameters:**
- `category_id` (optional): Filter by category

**Response:**
```json
[
  {
    "id": 10,
    "name": "Python",
    "description": "Python programming",
    "category": {
      "id": 1,
      "name": "Core"
    },
    "is_active": true
  }
]
```

---

### 4. Get Skill Categories
**GET** `/api/role-ready/skill-categories/`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Core",
    "description": "Core skills",
    "order": 1
  }
]
```

---

### 5. Get/Update User Skills
**GET** `/api/role-ready/user-skills/`

**Response:**
```json
[
  {
    "id": 1,
    "skill": {
      "id": 10,
      "name": "Python",
      "category": {"id": 1, "name": "Core"}
    },
    "proficiency_level": "intermediate",
    "experience_notes": "2 years of experience",
    "created_at": "2024-01-22T12:00:00Z",
    "updated_at": "2024-01-22T12:00:00Z"
  }
]
```

**POST** `/api/role-ready/user-skills/`

**Request Body:**
```json
{
  "skills": [
    {
      "skill_id": 10,
      "proficiency_level": "intermediate",
      "experience_notes": "2 years of experience"
    },
    {
      "skill_id": 15,
      "proficiency_level": "beginner",
      "experience_notes": ""
    }
  ]
}
```

**Response:** Same as GET (updated list)

---

### 6. Analyze Skill Gap
**POST** `/api/role-ready/analyze/`

**Request Body:**
```json
{
  "role_id": 5,
  "rebuild_roadmap": false
}
```

**Response:**
```json
{
  "gap_analysis": {
    "readiness_score": 40.0,
    "target_role": {
      "id": 5,
      "name": "Senior Backend Engineer",
      "industry": "Software"
    },
    "calculated_at": "2024-01-22T12:00:00Z",
    "gap_summary": {
      "critical": 2,
      "medium": 1,
      "growth": 0,
      "exceeded": 0
    },
    "critical_gaps": [
      {
        "skill": "Docker",
        "category": "Core",
        "gap_score": 30.0,
        "recommendations": "URGENT: Docker is critical..."
      }
    ],
    "total_skills_analyzed": 3
  },
  "roadmap": {
    "roadmap_id": 1,
    "target_role": {
      "id": 5,
      "name": "Senior Backend Engineer",
      "industry": "Software"
    },
    "progress": {
      "total_steps": 6,
      "completed": 0,
      "in_progress": 0,
      "pending": 6,
      "completion_percentage": 0.0
    },
    "time_estimate": {
      "total_hours": 180,
      "completed_hours": 0,
      "remaining_hours": 180
    },
    "skills_roadmap": [
      {
        "skill": "Docker",
        "category": "Core",
        "steps": [
          {
            "order": 1,
            "title": "Learn Docker Fundamentals",
            "status": "pending",
            "estimated_hours": 39
          },
          {
            "order": 2,
            "title": "Build Docker Project",
            "status": "pending",
            "estimated_hours": 59
          },
          {
            "order": 3,
            "title": "Validate Docker Mastery",
            "status": "pending",
            "estimated_hours": 20
          }
        ]
      }
    ]
  },
  "feedback": {
    "overview": "📚 You're 40% ready for the Senior Backend Engineer role...",
    "strengths": "💪 You're starting fresh, which means...",
    "focus_areas": "🎯 Your top priority is Docker...",
    "encouragement": "💡 This is your journey, and every step counts!...",
    "next_steps": "✅ Your first steps: Learn Docker Fundamentals...",
    "full_message": "📚 You're 40% ready...\n\n💪 You're starting fresh...\n\n..."
  },
  "gap_result_id": 1,
  "roadmap_id": 1
}
```

---

### 7. Get Skill Gap Result
**GET** `/api/role-ready/gap-results/<result_id>/`

**Response:**
```json
{
  "id": 1,
  "user": 1,
  "target_role": {
    "id": 5,
    "name": "Senior Backend Engineer"
  },
  "readiness_score": "40.00",
  "calculated_at": "2024-01-22T12:00:00Z",
  "notes": "",
  "breakdowns": [
    {
      "id": 1,
      "skill": {
        "id": 15,
        "name": "Docker"
      },
      "user_proficiency": "beginner",
      "required_weight": "30.00",
      "gap_level": "critical",
      "gap_score": "18.00",
      "recommendations": "URGENT: Docker is critical..."
    }
  ]
}
```

---

### 8. Get User Roadmap
**GET** `/api/role-ready/roadmaps/<role_id>/`

**Response:**
```json
{
  "id": 1,
  "user": 1,
  "target_role": {
    "id": 5,
    "name": "Senior Backend Engineer"
  },
  "is_active": true,
  "created_at": "2024-01-22T12:00:00Z",
  "updated_at": "2024-01-22T12:00:00Z",
  "steps": [
    {
      "id": 1,
      "skill": {
        "id": 15,
        "name": "Docker"
      },
      "step_order": 1,
      "title": "Learn Docker Fundamentals",
      "description": "Master the core concepts...",
      "status": "pending",
      "resources": [
        {
          "type": "documentation",
          "title": "Docker Official Documentation",
          "url": "https://example.com/docs/docker"
        }
      ],
      "estimated_hours": 39,
      "started_at": null,
      "completed_at": null
    }
  ]
}
```

---

### 9. Get All User Roadmaps
**GET** `/api/role-ready/roadmaps/`

**Response:**
```json
[
  {
    "id": 1,
    "target_role": {
      "id": 5,
      "name": "Senior Backend Engineer"
    },
    "is_active": true,
    "created_at": "2024-01-22T12:00:00Z"
  }
]
```

---

### 10. Update Roadmap Step Status
**PATCH** `/api/role-ready/roadmap-steps/update-status/`

**Request Body:**
```json
{
  "step_id": 1,
  "status": "in_progress"  // or "completed", "pending", "skipped"
}
```

**Response:**
```json
{
  "id": 1,
  "skill": {
    "id": 15,
    "name": "Docker"
  },
  "step_order": 1,
  "title": "Learn Docker Fundamentals",
  "status": "in_progress",
  "started_at": "2024-01-22T13:00:00Z",
  "completed_at": null
}
```

---

## Authentication

All endpoints require authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Error message here"
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "An error occurred: <error details>"
}
```

---

## Example Usage Flow

### 1. Get available roles and skills
```bash
GET /api/role-ready/roles/
GET /api/role-ready/skills/
```

### 2. Update user skills
```bash
POST /api/role-ready/user-skills/
{
  "skills": [
    {"skill_id": 10, "proficiency_level": "intermediate"},
    {"skill_id": 15, "proficiency_level": "beginner"}
  ]
}
```

### 3. Run skill gap analysis
```bash
POST /api/role-ready/analyze/
{
  "role_id": 5,
  "rebuild_roadmap": false
}
```

### 4. Get roadmap and track progress
```bash
GET /api/role-ready/roadmaps/5/
PATCH /api/role-ready/roadmap-steps/update-status/
{
  "step_id": 1,
  "status": "completed"
}
```

---

## Feedback Examples

The feedback is generated dynamically based on readiness score and gaps. Examples:

**High Readiness (80%+):**
> "🎉 Excellent news! You're 85% ready for the Senior Backend Engineer role. You're very close to being fully prepared..."

**Medium Readiness (40-60%):**
> "📚 You're 45% ready for the Senior Backend Engineer role. You have a good starting point, and there's a clear path forward..."

**Low Readiness (<40%):**
> "🚀 You're 25% ready for the Senior Backend Engineer role. This is the beginning of an exciting journey!..."
