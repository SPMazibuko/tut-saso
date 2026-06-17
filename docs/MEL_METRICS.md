# MEL Metrics Documentation

## Overview

MEL (Monitoring, Evaluation, and Learning) Metrics provide a comprehensive framework for tracking system effectiveness, intervention outcomes, and continuous improvement.

## MEL Framework Structure

### 1. Monitoring KPIs

Tracks system performance and operational metrics.

#### Alert-to-Intervention Latency
- **Definition**: Time from alert creation to intervention start
- **Target**: ≤ 3 days
- **Measurement**: Median days

#### Intervention Closure Time
- **Definition**: Time from intervention start to closure
- **Target**: ≤ 30 days
- **Measurement**: Median days

#### Workflow Fidelity
- **Definition**: Percentage of workflows completed as designed
- **Target**: ≥ 80%
- **Measurement**: Percentage

#### Role Player Responsiveness
- **Definition**: SLA compliance percentage for role player responses
- **Target**: ≥ 85%
- **Measurement**: Percentage

#### Coverage Metrics
- **At Risk with Active Plan**: Percentage of at-risk students with active intervention plans
- **Classes with Curriculum Coverage**: Percentage of classes meeting curriculum coverage requirements

#### Data Quality
- **SBA On-Time Uploads**: Percentage of SBA assessments uploaded on time
- **Attendance Completeness**: Percentage of attendance records completed
- **Exception Rate**: Rate of data exceptions requiring manual intervention

#### POPIA Compliance
- **Consent Capture Rate**: Percentage of required consents captured
- **Data Access Trails**: Number of data access audit trails
- **Exception Handling Logs**: Number of exception handling logs

---

### 2. Tracking KPIs

Tracks student progression and outcomes over time.

#### Cohort Progression
- **Grade 8 → 9**: Retention rate from Grade 8 to Grade 9
- **Grade 9 → 10**: Retention rate from Grade 9 to Grade 10
- **Grade 10 → 11**: Retention rate from Grade 10 to Grade 11
- **Grade 11 → 12**: Retention rate from Grade 11 to Grade 12

#### Feeder Mapping
- **TVET Transitions**: Number of students transitioning to TVET
- **University Transitions**: Number of students transitioning to university
- **First Year Readiness Index (FYRI)**: Percentage of students ready for first year of post-secondary

#### Equity Tracking
- **Gender Gaps**: Performance gaps by gender, by subject
- **Grade Gaps**: Performance gaps by course level
- **Subject Gaps**: Performance gaps by subject

#### Subject Journeys
- **Concept Mastery**: Percentage of concepts mastered per subject
- **Repeated Risk Count**: Number of times student has been at risk in subject

---

### 3. Analytics KPIs

Tracks predictive model performance and analytical insights.

#### Predictive Precision
- **Definition**: Percentage of high-risk predictions that were accurate
- **Target**: ≥ 70%
- **Measurement**: Model precision metric

#### Predictive Recall
- **Definition**: Percentage of actual high-risk students correctly identified
- **Target**: ≥ 75%
- **Measurement**: Model recall metric

#### Counterfactual Forecast
- **With Intervention**: Projected outcomes with intervention
- **Without Intervention**: Projected outcomes without intervention
- **Purpose**: Quantify intervention impact

#### Intervention Uplift
- **Definition**: Difference-in-Differences style uplift measurement
- **Target**: ≥ 5 percentage points
- **Measurement**: Percentage point difference

#### Teacher Impact Signals
- **Term-over-Term Change**: Change in student performance by teacher
- **Purpose**: Identify effective teaching practices

#### Threshold Optimization
- **False Positive Rate**: Percentage of low-risk students flagged as high-risk
- **False Negative Rate**: Percentage of high-risk students not flagged

---

### 4. Evaluation KPIs

Tracks outcome changes and intervention effectiveness.

#### Outcome KPIs
- **Attendance Change**: Change in attendance rates (percentage points)
- **SBA Change**: Change in SBA performance (percentage points)
- **Promotion Rate Change**: Change in promotion rates (percentage points)
- **Repeat Rate Change**: Change in repeat rates (percentage points, negative is good)
- **Dropout Rate Change**: Change in dropout rates (percentage points, negative is good)
- **Time to Support Change**: Change in time to provide support (days, negative is good)

#### Attribution
- **Intervention Uplift by Type**: Uplift measurement for each intervention type
- **SHAP Explanations**: Feature contributions to predictions
- **Purpose**: Understand what drives outcomes

#### Reporting Cadence
- **Last Monthly Review**: Date of last monthly review
- **Last Quarterly Report**: Date of last quarterly report
- **Pilot Evaluation Due**: Date of next pilot evaluation

---

## MEL Metrics Service

### Service Location
`lib/mel-service.ts`

### Key Functions

#### `calculateMELMetrics(schoolId, period?)`
Calculates comprehensive MEL metrics for a school over a specified period.

#### `getMELTrends(schoolId, periods)`
Gets historical MEL metrics trends over multiple periods.

#### `compareMELMetrics(schoolId1, schoolId2)`
Compares MEL metrics between two schools.

#### `getMELAlerts(schoolId)`
Gets alerts for metrics that are below thresholds.

#### `getMELSummary(schoolId)`
Gets summary scores for all MEL categories and overall score.

---

## MEL Dashboard

### Location
`app/dashboard/mel-metrics/page.tsx`

### Features
- Overall summary scores
- Category-wise breakdowns
- Threshold alerts
- Trend visualizations
- Comparison views
- Detailed metric displays

### Access
- **School Admin**: Own school
- **District Admin**: All schools in district
- **Provincial Admin**: All schools

---

## Threshold Definitions

### Monitoring Thresholds
- Workflow Fidelity: < 80%
- Role Player Responsiveness: < 85%
- At Risk with Active Plan: < 70%
- Attendance Completeness: < 90%
- SBA On-Time Uploads: < 85%

### Analytics Thresholds
- Predictive Precision: < 0.70 (70%)
- Predictive Recall: < 0.75 (75%)
- Intervention Uplift: < 5 percentage points

### Alert Severity
- **High**: Metric is significantly below threshold
- **Medium**: Metric is slightly below threshold

---

## Calculation Methods

### Monitoring Score
Weighted average of:
- Workflow Fidelity (30%)
- Role Player Responsiveness (30%)
- At Risk with Active Plan (20%)
- Attendance Completeness (10%)
- SBA On-Time Uploads (10%)

### Tracking Score
Average of cohort progression rates:
- Grade 8→9, 9→10, 10→11, 11→12 (equal weights)

### Analytics Score
Average of:
- Predictive Precision (50%)
- Predictive Recall (50%)

### Evaluation Score
Weighted average of outcome KPIs:
- Attendance Change (20%)
- SBA Change (20%)
- Promotion Rate Change (30%)
- Repeat Rate Change (15%)
- Dropout Rate Change (15%)

### Overall Score
Weighted average of:
- Monitoring Score (30%)
- Tracking Score (25%)
- Analytics Score (25%)
- Evaluation Score (20%)

---

## Reporting Guidelines

### Monthly Reports
- Focus on monitoring and tracking KPIs
- Highlight threshold violations
- Report on intervention effectiveness

### Quarterly Reports
- Comprehensive MEL analysis
- Trend analysis over quarters
- Comparison with previous periods

### Annual Reports
- Full evaluation cycle
- Intervention impact assessment
- Policy and practice recommendations

