# System Architecture Documentation

## Overview

The iPASS (Integrated Predictive Analytics and Learner Support) system is a comprehensive education management platform that combines predictive analytics, student management, early intervention, real-time alerts, progress tracking, and risk assessment.

## Architecture Components

### 1. Integration Layer

The integration layer provides automated workflows connecting risk assessment, alerts, and interventions:

- **Alert Service** (`lib/alert-service.ts`): Handles automated alert generation from risk assessment
- **Intervention Workflow** (`lib/intervention-workflow.ts`): Manages automated intervention creation from alerts
- **Workflow Orchestrator** (`lib/workflow-orchestrator.ts`): Coordinates the complete risk → alert → intervention flow

### 2. AI Support Layer

AI-powered chat support with intervention tracking:

- **Chat Workflows** (`lib/chat-workflows.ts`): Manages AI chat workflows and intervention case tracking
- **Support Chat API** (`app/api/support-chat/route.ts`): Handles chat interactions and logging
- **AI Support Dashboard** (`app/dashboard/ai-support/page.tsx`): Analytics and metrics for AI support

### 3. Governance Layer

Multi-level governance hierarchy support:

- **Governance Service** (`lib/governance.ts`): School/district/province performance analysis
- **User Context Service** (`lib/user-context.ts`): Role-based data filtering and scope management
- **Governance Pages** (`app/dashboard/governance/`): Multi-level governance views

### 4. MEL Metrics Layer

Monitoring, Evaluation, and Learning framework:

- **MEL Service** (`lib/mel-service.ts`): Enhanced MEL metrics calculations and trends
- **MEL Dashboard** (`app/dashboard/mel-metrics/page.tsx`): Comprehensive MEL metrics visualization

### 5. User Experience Layer

Role-specific dashboards and views:

- **Dashboard Components** (`components/dashboards/`): Role-specific dashboard implementations
- **Dashboard Config** (`lib/dashboard-config.ts`): Configurable role-based dashboard layouts
- **Dashboard Router** (`app/dashboard/page.tsx`): Routes to appropriate role-specific dashboard

## Data Flow

### Risk Assessment → Alert → Intervention Flow

```
Learner Data → Risk Assessment (AI) → Alert Generation → Intervention Creation → Tracking
```

1. **Risk Assessment**: `lib/ai.ts` - `predictRisk()` evaluates student risk
2. **Alert Generation**: `lib/alert-service.ts` - `evaluateRiskAndAlert()` creates alerts
3. **Intervention Creation**: `lib/intervention-workflow.ts` - `autoCreateIntervention()` creates interventions
4. **Workflow Orchestration**: `lib/workflow-orchestrator.ts` - Coordinates the entire flow

### AI Chat Support Flow

```
User Message → Workflow Detection → Risk Assessment → Intervention Case Logging → Escalation (if needed)
```

1. **Workflow Detection**: Determines academic vs wellness workflow
2. **Risk Assessment**: Evaluates student risk level
3. **Case Logging**: Creates intervention case record
4. **Escalation**: Escalates to human role players if high risk

## Component Relationships

```
lib/ai.ts
  ├── lib/alert-service.ts
  │     └── lib/intervention-workflow.ts
  │           └── lib/workflow-orchestrator.ts
  │
lib/chat-workflows.ts
  ├── app/api/support-chat/route.ts
  └── app/dashboard/ai-support/page.tsx
  │
lib/governance.ts
  ├── lib/mel-service.ts
  │     └── app/dashboard/mel-metrics/page.tsx
  ├── lib/user-context.ts
  │     └── app/dashboard/governance/page.tsx
  │
lib/dashboard-config.ts
  └── app/dashboard/page.tsx
        └── components/dashboards/
```

## Integration Patterns

### Event-Driven Architecture

The system uses an event-driven approach for automated workflows:
- Risk changes trigger alerts
- Alerts trigger intervention evaluation
- High-risk cases trigger automatic intervention creation

### Role-Based Access Control

- **User Context Service**: Determines user's accessible scope
- **Data Filtering**: Filters data based on role and scope
- **Dashboard Routing**: Routes to appropriate role-specific views

### Service Layer Pattern

- Business logic separated into service modules
- Data access abstracted through data service layer
- UI components consume services, not direct data access

