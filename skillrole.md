# **GroupForge AI – Final System Specification**

*(Student Lifecycle, Team Formation, Validation, Error Handling, Edge Cases)*

---

## **1. Data Model Overview**

### **Collections Used**

* `users` (students + faculty)
* `teams`

---

## **2. User (Student) Schema – Authoritative**

### **Initial Account Creation**

```json
{
  "_id": "ObjectId",
  "email": "email@domain.com",
  "password": "hashed_password",
  "displayName": "Name",
  "role": "student",

  "profileCompleted": false,
  "createdAt": "ISODate",
  "updatedAt": "ISODate",

  "institutionId": "",

  "skills": {},
  "assessmentHistory": [],

  "githubConnected": false,
  "resumeUploaded": false,

  "bio": "",
  "department": "",
  "enrollmentNumber": "",
  "githubUsername": "",
  "major": "",
  "selectedSkills": [],
  "timezone": "Asia/Calcutta",
  "tools": [],

  "attendedTest": false,
  "inTeam": false,
  "teamId": null
}
```

---

## **3. Profile Completion State**

### **After Profile Completion**

```json
{
  "profileCompleted": true,

  "institutionId": "SMVEC",
  "department": "CSE",
  "enrollmentNumber": "21CSE001",
  "major": "B.Tech",

  "selectedSkills": ["python", "ml", "frontend", "sql"],

  "skills": {
    "python": 0,
    "ml": 0,
    "frontend": 0,
    "sql": 0
  },

  "githubConnected": true,
  "resumeUploaded": true,
  "bio": "Something",
  "tools": ["VS Code", "Git"],

  "attendedTest": false,
  "inTeam": false,
  "teamId": null
}
```

### **Validation Rules**

* `selectedSkills` must be from allowed skill list
* `skills` keys must match `selectedSkills`
* Profile can only be completed once and the skills can updated again . That is core details can't be updated but other details can be updated.


### **Errors**

| Condition               | Result |
| ----------------------- | ------ |
| Missing required fields | 400    |
| Invalid skill           | 422    |
| Already completed       | 409    |

---

## **4. Assessment State**

### **After Assessment Completion**

```json
{
  "skills": {
    "python": 72,
    "ml": 65,
    "frontend": 58,
    "sql": 60
  },

  "latestAssessment": {
  "score": 63,
  "takenAt": "2026-01-09T04:30:00Z"
}
,

  "attendedTest": true,
  "inTeam": false,
  "teamId": null
}
```

### **Validation Rules**

* Profile must be completed first
* Scores must be 0–100
* latestAssessment exists only if attendedTest === true
* If latestAssessment exists → assessment is considered valid
* Retake overwrites the object (no append)


### **Errors**

| Condition          | Result |
| ------------------ | ------ |
| Profile incomplete | 403    |
| Invalid marks      | 422    |
| Retake not allowed | 429    |

---

## **5. Team Linking Strategy (CRITICAL DESIGN DECISION)**

### **Approach Used: `teamId` Reference**

* **Student documents never embed team data**
* **Teams own membership**
* Student only stores:

```json
{
  "inTeam": true,
  "teamId": "team_01"
}
```

---

## **6. Team Schema (Source of Truth)**

```json
{
  "_id": "team_01",
  "members": [
    {
      "studentId": "695f8ec9c083dfd7ea3249f2",
      "role": "developer",
      "joinedAt": "2026-01-09T10:00:00Z"
    },
    {
      "studentId": "695f8ec9c083dfd7ea3249f3",
      "role": "researcher",
      "joinedAt": "2026-01-09T10:00:00Z"
    }
  ],

  "teamSkillVector": {
    "python": 68,
    "ml": 61,
    "frontend": 56,
    "sql": 59
  },

  "status": "active",
  "createdBy": "faculty_01",
  "createdAt": "2026-01-09T09:55:00Z"
}
```

---

## **7. Team Formation Flow (Faculty Controlled)**

### **Eligibility Criteria**

```text
profileCompleted == true
attendedTest == true
inTeam == false
```

### **Formation Steps**

1. Faculty triggers team creation
2. Eligible students fetched
3. Skill-based algorithm runs after AI teams are formed . This is done for finalisation to avoid halucinations
4. Faculty approves the teams he can also swap members and modify the list
5. Team document created
6. Student documents updated atomically

### **Student Update**

```json
{
  "inTeam": true,
  "teamId": "team_01"
}
```

### **Transaction Rule**

* If **any student update fails**, team creation is rolled back

---

## **8. Error Handling During Team Formation**

| Scenario                | Action          |
| ----------------------- | --------------- |
| Student already in team | Exclude or fail |
| Insufficient students   | 422             |
| Partial DB failure      | Rollback        |
| Unauthorized trigger    | 403             |

---

## **9. Edge Case Handling**

### **A. Student Leaves Team**

**Student**

```json
"inTeam": false,
"teamId": null
```

**Team**

* Remove member
* Recalculate `teamSkillVector`
* If size < minimum → `status = needs_rebalance`

---

### **B. Profile Edit After Team Assignment**

**Rule**

* All profile and skill fields are modifyable
* If skills are modified then the skill assesment must be retaken accordingly

---

### **C. Student Account Deletion**

**Actions**

* Remove from team
* Recalculate team vector
* Mark team for rebalance if required

---

## **10. System Invariants (MUST NEVER BREAK)**

* Student can belong to **only one team**
* Team membership exists **only in team collection**
* Faculty controls team creation
* Student cannot self-assign or modify team
* Assessment + profile are mandatory for eligibility
* All team writes are transactional

---

## **11. Final Summary**

This system:

* Avoids duplicated data
* Prevents proxy participation
* Allows controlled reshuffling
* Scales cleanly
* Is implementation-safe in Flask + MongoDB

This is not a prototype spec.
This is a **production-grade contract**.
