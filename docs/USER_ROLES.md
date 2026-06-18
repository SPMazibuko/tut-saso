# User Roles Documentation

## Overview

The SASO system supports multiple user roles with different permissions and access levels. This document describes each role and their capabilities.

## Role Definitions

### 1. Learner

**Access Level**: Self-only

**Dashboard**: `components/student-dashboard.tsx`

**Capabilities**:
- View own academic progress
- View own attendance
- View own assessments and grades
- Access AI chat support
- View assigned courses and assignments
- Track personal goals

**Data Access**:
- Own student record only
- Own assessment data
- Own attendance records
- Own course enrollments

**Restrictions**:
- Cannot view other students' data
- Cannot access administrative functions
- Cannot create interventions

---

### 2. Teacher

**Access Level**: Assigned students only

**Dashboard**: `components/dashboards/teacher-dashboard.tsx`

**Capabilities**:
- View assigned students
- View student risk levels
- Create interventions for assigned students
- Update student grades
- Send messages to students
- View class performance summaries
- Access AI support analytics

**Data Access**:
- Learners assigned to teacher
- Class-level analytics
- Learner assessments for assigned classes

**Restrictions**:
- Cannot view students from other classes
- Cannot access school-wide administrative data
- Cannot access governance views

---

### 3. Admin (School Admin)

**Access Level**: Single school

**Dashboard**: `components/dashboards/admin-dashboard.tsx`

**Capabilities**:
- View all students in school
- Create and manage interventions
- Generate alerts
- View school-wide analytics
- Access governance data for school
- Generate reports
- Manage school settings

**Data Access**:
- All students in assigned school
- School-level analytics
- School performance metrics
- MEL metrics for school

**Restrictions**:
- Cannot view other schools' data
- Cannot access district/province level data (unless granted)

---

### 4. District Admin

**Access Level**: Assigned district(s)

**Dashboard**: `components/dashboards/district-admin-dashboard.tsx`

**Capabilities**:
- View all schools in district
- Compare school performance
- Generate district reports
- Access district-level governance
- View district-wide analytics
- Access MEL metrics for district schools

**Data Access**:
- All schools in assigned district(s)
- District-level aggregations
- School comparison data
- District governance metrics

**Restrictions**:
- Cannot view other districts' data
- Cannot access province-level administrative functions

---

### 5. Provincial Admin

**Access Level**: All provinces

**Dashboard**: `components/dashboards/provincial-admin-dashboard.tsx`

**Capabilities**:
- View all districts and schools
- Compare district performance
- Generate province-wide reports
- Access multi-level governance
- View province-wide analytics
- Access all MEL metrics
- Policy impact analysis

**Data Access**:
- All data in system
- Province-level aggregations
- Multi-level governance data
- Cross-district comparisons

**Restrictions**:
- None (full system access)

---

### 6. Parent

**Access Level**: Own children only

**Dashboard**: `components/dashboards/parent-dashboard.tsx`

**Capabilities**:
- View child's academic progress
- View child's attendance
- View child's assessments
- Message teachers
- View child's risk status
- Schedule meetings
- Access progress reports

**Data Access**:
- Own children's student records
- Children's assessment data
- Children's attendance records

**Restrictions**:
- Cannot view other students' data
- Cannot access administrative functions
- Cannot create interventions

---

## Role Hierarchy

```
Provincial Admin (Highest)
    ↓
District Admin
    ↓
Admin (School)
    ↓
Teacher
    ↓
Learner / Parent (Lowest)
```

## Permission Matrix

| Feature | Learner | Parent | Teacher | Admin | District Admin | Provincial Admin |
|---------|---------|--------|---------|-------|----------------|------------------|
| View Own Data | ✅ | ✅ (child) | ❌ | ❌ | ❌ | ❌ |
| View Assigned Learners | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| View School Data | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| View District Data | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View Province Data | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Create Interventions | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Generate Alerts | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Access Governance | ❌ | ❌ | ❌ | ✅ (school) | ✅ (district) | ✅ (all) |
| Access MEL Metrics | ❌ | ❌ | ❌ | ✅ (school) | ✅ (district) | ✅ (all) |
| Generate Reports | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| AI Chat Support | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Dashboard Access by Role

- **Learner**: `/dashboard` → `StudentDashboard`
- **Parent**: `/dashboard` → `ParentDashboard`
- **Teacher**: `/dashboard` → `TeacherDashboard`
- **Admin**: `/dashboard` → `AdminDashboard`
- **District Admin**: `/dashboard` → `DistrictAdminDashboard`
- **Provincial Admin**: `/dashboard` → `ProvincialAdminDashboard`

## Governance Hierarchy Access

The governance hierarchy (Province → District → School) determines data access:

- **Provincial Admin**: Can access all levels
- **District Admin**: Can access assigned district and schools within
- **Admin**: Can access assigned school only
- **Teacher**: Can access assigned students (scoped to school)
- **Learner/Parent**: Can access own/child's data only

## Implementation

### User Context Service

The `lib/user-context.ts` service provides:

- `getUserScope(user)`: Returns user's accessible scope
- `filterByUserScope(data, user)`: Filters data based on user permissions
- `canAccessResource(resource, user)`: Checks if user can access specific resource
- `getScopeDescription(user)`: Returns human-readable scope description

### Role-Based Filtering

Data filtering is applied at multiple levels:

1. **Data Service Layer**: Filters based on user scope
2. **UI Component Layer**: Hides/shows features based on role
3. **API Layer**: Validates permissions before data access

### Dashboard Configuration

Role-specific dashboard layouts are defined in `lib/dashboard-config.ts`:

- Widgets available per role
- Layout structure per role
- Required vs optional widgets

