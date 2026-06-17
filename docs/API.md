# API Documentation

## Overview

This document describes the APIs available in the iPASS system for alert management, intervention workflows, MEL metrics, and user context.

---

## Alert Service API

### `getAllAlerts()`
Returns all alerts (both mock and dynamically created).

**Returns**: `Alert[]`

**Example**:
```typescript
const alerts = getAllAlerts()
```

---

### `getAlertsByStudent(studentId: string)`
Get alerts for a specific student.

**Parameters**:
- `studentId`: Learner ID

**Returns**: `Alert[]`

**Example**:
```typescript
const studentAlerts = getAlertsByStudent("123")
```

---

### `getAlertsBySeverity(severity: Alert["severity"])`
Get alerts filtered by severity.

**Parameters**:
- `severity`: Alert severity ("low" | "medium" | "high" | "critical")

**Returns**: `Alert[]`

**Example**:
```typescript
const criticalAlerts = getAlertsBySeverity("critical")
```

---

### `triggerAlert(studentId, type, severity, message)`
Create a new alert programmatically.

**Parameters**:
- `studentId`: Learner ID
- `type`: Alert type ("risk-increase" | "attendance" | "grade-drop" | "behavioral")
- `severity`: Alert severity
- `message`: Alert message

**Returns**: `Alert`

**Example**:
```typescript
const alert = triggerAlert("123", "attendance", "high", "Attendance dropped to 75%")
```

---

### `evaluateRiskAndAlert(studentId: string)`
Evaluate student risk and create alerts if thresholds are crossed.

**Parameters**:
- `studentId`: Learner ID

**Returns**: `Alert | null`

**Example**:
```typescript
const alert = evaluateRiskAndAlert("123")
```

---

### `processRiskChange(studentId, oldRisk, newRisk)`
Process risk level change and create alert if needed.

**Parameters**:
- `studentId`: Learner ID
- `oldRisk`: Previous risk level
- `newRisk`: New risk level

**Returns**: `Alert | null`

---

## Intervention Workflow API

### `autoCreateIntervention(alertId: string, studentId: string)`
Auto-create intervention from an alert.

**Parameters**:
- `alertId`: Alert ID
- `studentId`: Learner ID

**Returns**: `Intervention | null`

**Example**:
```typescript
const intervention = autoCreateIntervention("alert-123", "student-456")
```

---

### `evaluateInterventionNeed(studentId: string, riskFactors?: RiskFactor[])`
Evaluate if a student needs an intervention.

**Parameters**:
- `studentId`: Learner ID
- `riskFactors`: Optional risk factors

**Returns**: `{ needsIntervention: boolean, recommendedType: InterventionType, priority: "high" | "medium" | "low", reason: string }`

**Example**:
```typescript
const evaluation = evaluateInterventionNeed("123")
if (evaluation.needsIntervention) {
  // Create intervention
}
```

---

### `assignIntervention(studentId, type, priority)`
Auto-assign intervention based on rules.

**Parameters**:
- `studentId`: Learner ID
- `type`: Intervention type
- `priority`: Intervention priority

**Returns**: `Intervention | null`

---

### `processAlertForIntervention(alertId: string)`
Process alert and potentially create intervention.

**Parameters**:
- `alertId`: Alert ID

**Returns**: `Intervention | null`

---

## Workflow Orchestrator API

### `executeWorkflowForStudent(studentId: string)`
Execute full workflow for a student: Risk Assessment → Alert Generation → Intervention Creation.

**Parameters**:
- `studentId`: Learner ID

**Returns**: `Promise<WorkflowExecution>`

**Example**:
```typescript
const execution = await executeWorkflowForStudent("123")
console.log(execution.status) // "completed" | "failed" | "partial"
```

---

### `batchExecuteWorkflow(studentIds: string[])`
Execute workflow for multiple students.

**Parameters**:
- `studentIds`: Array of student IDs

**Returns**: `Promise<WorkflowExecution[]>`

---

### `executeWorkflowForAtRiskStudents()`
Execute workflow for all at-risk students.

**Returns**: `Promise<WorkflowExecution[]>`

---

### `getWorkflowHistory(studentId?: string)`
Get workflow execution history.

**Parameters**:
- `studentId`: Optional student ID to filter

**Returns**: `WorkflowExecution[]`

---

## MEL Metrics API

### `calculateMELMetrics(schoolId: string, period?: { start: Date, end: Date })`
Calculate comprehensive MEL metrics for a school.

**Parameters**:
- `schoolId`: School ID
- `period`: Optional time period

**Returns**: `MELMetrics | null`

---

### `getMELTrends(schoolId: string, periods: number)`
Get MEL trends over multiple periods.

**Parameters**:
- `schoolId`: School ID
- `periods`: Number of periods

**Returns**: `MELTrendData[]`

---

### `compareMELMetrics(schoolId1: string, schoolId2: string)`
Compare MEL metrics between two schools.

**Parameters**:
- `schoolId1`: First school ID
- `schoolId2`: Second school ID

**Returns**: `MELComparison | null`

---

### `getMELAlerts(schoolId: string)`
Get alerts for metrics below thresholds.

**Parameters**:
- `schoolId`: School ID

**Returns**: `MELAlert[]`

---

### `getMELSummary(schoolId: string)`
Get summary scores for all MEL categories.

**Parameters**:
- `schoolId`: School ID

**Returns**: `{ monitoringScore, trackingScore, analyticsScore, evaluationScore, overallScore }`

---

## User Context API

### `getUserScope(user?: User)`
Get user's accessible scope based on role.

**Parameters**:
- `user`: Optional user object (uses current user if not provided)

**Returns**: `UserScope`

**Example**:
```typescript
const scope = getUserScope()
console.log(scope.role) // "admin" | "teacher" | etc.
console.log(scope.schoolIds) // Array of accessible school IDs
```

---

### `filterByUserScope<T>(data: T[], user?: User)`
Filter data by user scope.

**Parameters**:
- `data`: Array of data items
- `user`: Optional user object

**Returns**: `T[]` (filtered array)

**Example**:
```typescript
const allStudents = getStudents()
const filteredStudents = filterByUserScope(allStudents)
```

---

### `canAccessResource(resource, user?: User)`
Check if user can access a specific resource.

**Parameters**:
- `resource`: Resource object with provinceId/districtId/schoolId/studentId
- `user`: Optional user object

**Returns**: `boolean`

**Example**:
```typescript
const canAccess = canAccessResource({ schoolId: "school-123" })
```

---

### `getScopeDescription(user?: User)`
Get human-readable scope description.

**Parameters**:
- `user`: Optional user object

**Returns**: `string`

**Example**:
```typescript
const description = getScopeDescription()
// "School: School Name" or "All Provinces" etc.
```

---

### `getUserHierarchy(user?: User)`
Get user's position in governance hierarchy.

**Parameters**:
- `user`: Optional user object

**Returns**: `{ province?, district?, school? }`

---

## Chat Workflows API

### `getInterventionCase(caseId: string)`
Get intervention case by ID.

**Parameters**:
- `caseId`: Case ID

**Returns**: `InterventionCase | undefined`

---

### `updateInterventionCase(caseId: string, updates: Partial<InterventionCase>)`
Update intervention case.

**Parameters**:
- `caseId`: Case ID
- `updates`: Partial case updates

**Returns**: `InterventionCase | null`

---

### `getInterventionCasesByStudent(studentId: string)`
Get intervention cases for a student.

**Parameters**:
- `studentId`: Learner ID

**Returns**: `InterventionCase[]`

---

### `getInterventionCasesByStatus(status: "open" | "closed" | "escalated" | "all")`
Get intervention cases by status.

**Parameters**:
- `status`: Case status

**Returns**: `InterventionCase[]`

---

### `getInterventionCaseAnalytics(studentId?: string)`
Get intervention case analytics.

**Parameters**:
- `studentId`: Optional student ID to filter

**Returns**: `InterventionCaseAnalytics`

**Returns Object**:
```typescript
{
  totalCases: number
  openCases: number
  closedCases: number
  escalatedCases: number
  averageResponseTime: number // hours
  averageResolutionTime: number // hours
  casesByRootCause: Record<string, number>
  casesByRiskLevel: Record<string, number>
  casesBySupportType: Record<string, number>
  resolutionRate: number // percentage
}
```

---

## Data Service API

### `createAlert(alertData)`
Create an alert programmatically (wraps alert service).

**Parameters**:
- `alertData`: Alert data (without id, createdAt, read, actionTaken)

**Returns**: `Alert`

---

### `getAlertsByStudent(studentId: string)`
Get alerts for a student (wraps alert service).

**Parameters**:
- `studentId`: Learner ID

**Returns**: `Alert[]`

---

### `getAlertsBySeverity(severity: Alert["severity"])`
Get alerts by severity (wraps alert service).

**Parameters**:
- `severity`: Alert severity

**Returns**: `Alert[]`

---

## Dashboard Config API

### `getDashboardConfig(role: UserRole)`
Get dashboard configuration for a role.

**Parameters**:
- `role`: User role

**Returns**: `DashboardLayout`

---

### `getAvailableWidgets(role: UserRole)`
Get available widgets for a role.

**Parameters**:
- `role`: User role

**Returns**: `DashboardWidget[]`

---

### `getDashboardLayout(role: UserRole)`
Get dashboard layout structure for a role.

**Parameters**:
- `role`: User role

**Returns**: `DashboardLayout["layout"]`

