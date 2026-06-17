"use client"

import type { UserRole } from "./types"

/**
 * Dashboard Configuration Service - Configurable role-based dashboard layouts
 */

export interface DashboardWidget {
  id: string
  title: string
  component: string
  size: "small" | "medium" | "large"
  required?: boolean
}

export interface DashboardLayout {
  role: UserRole
  widgets: DashboardWidget[]
  layout: {
    rows: number
    columns: number
    grid: Array<{ widgetId: string; row: number; col: number; span?: number }>
  }
}

/**
 * Get dashboard configuration for a role
 */
export function getDashboardConfig(role: UserRole): DashboardLayout {
  const configs: Record<UserRole, DashboardLayout> = {
    admin: {
      role: "admin",
      widgets: [
        { id: "total-students", title: "Total Students", component: "StatsCard", size: "small", required: true },
        { id: "at-risk-students", title: "At-Risk Students", component: "StatsCard", size: "small", required: true },
        { id: "active-interventions", title: "Active Interventions", component: "StatsCard", size: "small", required: true },
        { id: "average-attendance", title: "Average Attendance", component: "StatsCard", size: "small", required: true },
        { id: "recent-alerts", title: "Recent Alerts", component: "AlertList", size: "medium", required: true },
        { id: "active-interventions-list", title: "Active Interventions", component: "InterventionList", size: "medium", required: true },
        { id: "quick-actions", title: "Quick Actions", component: "QuickActions", size: "large", required: true },
      ],
      layout: {
        rows: 3,
        columns: 4,
        grid: [
          { widgetId: "total-students", row: 0, col: 0 },
          { widgetId: "at-risk-students", row: 0, col: 1 },
          { widgetId: "active-interventions", row: 0, col: 2 },
          { widgetId: "average-attendance", row: 0, col: 3 },
          { widgetId: "recent-alerts", row: 1, col: 0, span: 2 },
          { widgetId: "active-interventions-list", row: 1, col: 2, span: 2 },
          { widgetId: "quick-actions", row: 2, col: 0, span: 4 },
        ],
      },
    },
    teacher: {
      role: "teacher",
      widgets: [
        { id: "my-students", title: "My Students", component: "StatsCard", size: "small", required: true },
        { id: "at-risk-students", title: "At-Risk Students", component: "StatsCard", size: "small", required: true },
        { id: "average-attendance", title: "Class Attendance", component: "StatsCard", size: "small", required: true },
        { id: "students-needing-attention", title: "Students Needing Attention", component: "StudentList", size: "large", required: true },
        { id: "quick-actions", title: "Quick Actions", component: "QuickActions", size: "medium", required: true },
      ],
      layout: {
        rows: 3,
        columns: 3,
        grid: [
          { widgetId: "my-students", row: 0, col: 0 },
          { widgetId: "at-risk-students", row: 0, col: 1 },
          { widgetId: "average-attendance", row: 0, col: 2 },
          { widgetId: "students-needing-attention", row: 1, col: 0, span: 2 },
          { widgetId: "quick-actions", row: 1, col: 2 },
        ],
      },
    },
    student: {
      role: "student",
      widgets: [
        { id: "current-aps", title: "Current APS", component: "StatsCard", size: "small", required: true },
        { id: "attendance-rate", title: "Attendance Rate", component: "StatsCard", size: "small", required: true },
        { id: "pending-assignments", title: "Pending Assignments", component: "StatsCard", size: "small", required: true },
        { id: "average-grade", title: "Average Grade", component: "StatsCard", size: "small", required: true },
        { id: "recent-activities", title: "Recent Activities", component: "ActivityList", size: "medium", required: true },
        { id: "upcoming-deadlines", title: "Upcoming Deadlines", component: "DeadlineList", size: "medium", required: true },
      ],
      layout: {
        rows: 2,
        columns: 4,
        grid: [
          { widgetId: "current-aps", row: 0, col: 0 },
          { widgetId: "attendance-rate", row: 0, col: 1 },
          { widgetId: "pending-assignments", row: 0, col: 2 },
          { widgetId: "average-grade", row: 0, col: 3 },
          { widgetId: "recent-activities", row: 1, col: 0, span: 2 },
          { widgetId: "upcoming-deadlines", row: 1, col: 2, span: 2 },
        ],
      },
    },
    parent: {
      role: "parent",
      widgets: [
        { id: "child-overview", title: "Child Overview", component: "ChildOverview", size: "large", required: true },
        { id: "academic-performance", title: "Academic Performance", component: "PerformanceChart", size: "medium", required: true },
        { id: "attendance", title: "Attendance", component: "AttendanceChart", size: "medium", required: true },
        { id: "quick-actions", title: "Quick Actions", component: "QuickActions", size: "large", required: true },
      ],
      layout: {
        rows: 3,
        columns: 2,
        grid: [
          { widgetId: "child-overview", row: 0, col: 0, span: 2 },
          { widgetId: "academic-performance", row: 1, col: 0 },
          { widgetId: "attendance", row: 1, col: 1 },
          { widgetId: "quick-actions", row: 2, col: 0, span: 2 },
        ],
      },
    },
    "district-admin": {
      role: "district-admin",
      widgets: [
        { id: "total-students", title: "Total Students", component: "StatsCard", size: "small", required: true },
        { id: "at-risk-students", title: "At-Risk Students", component: "StatsCard", size: "small", required: true },
        { id: "active-interventions", title: "Active Interventions", component: "StatsCard", size: "small", required: true },
        { id: "average-attendance", title: "Average Attendance", component: "StatsCard", size: "small", required: true },
        { id: "district-overview", title: "District Overview", component: "DistrictOverview", size: "large", required: true },
        { id: "quick-actions", title: "Quick Actions", component: "QuickActions", size: "medium", required: true },
      ],
      layout: {
        rows: 3,
        columns: 4,
        grid: [
          { widgetId: "total-students", row: 0, col: 0 },
          { widgetId: "at-risk-students", row: 0, col: 1 },
          { widgetId: "active-interventions", row: 0, col: 2 },
          { widgetId: "average-attendance", row: 0, col: 3 },
          { widgetId: "district-overview", row: 1, col: 0, span: 3 },
          { widgetId: "quick-actions", row: 1, col: 3 },
        ],
      },
    },
    "provincial-admin": {
      role: "provincial-admin",
      widgets: [
          { id: "total-students", title: "Total Students", component: "StatsCard", size: "small", required: true },
        { id: "at-risk-students", title: "At-Risk Students", component: "StatsCard", size: "small", required: true },
        { id: "active-interventions", title: "Active Interventions", component: "StatsCard", size: "small", required: true },
        { id: "average-attendance", title: "Average Attendance", component: "StatsCard", size: "small", required: true },
        { id: "province-overview", title: "Province Overview", component: "ProvinceOverview", size: "large", required: true },
        { id: "quick-actions", title: "Quick Actions", component: "QuickActions", size: "large", required: true },
      ],
      layout: {
        rows: 3,
        columns: 4,
        grid: [
          { widgetId: "total-students", row: 0, col: 0 },
          { widgetId: "at-risk-students", row: 0, col: 1 },
          { widgetId: "active-interventions", row: 0, col: 2 },
          { widgetId: "average-attendance", row: 0, col: 3 },
          { widgetId: "province-overview", row: 1, col: 0, span: 2 },
          { widgetId: "quick-actions", row: 1, col: 2, span: 2 },
        ],
      },
    },
  }

  return configs[role] || configs.student
}

/**
 * Get available widgets for a role
 */
export function getAvailableWidgets(role: UserRole): DashboardWidget[] {
  const config = getDashboardConfig(role)
  return config.widgets
}

/**
 * Get dashboard layout structure for a role
 */
export function getDashboardLayout(role: UserRole): DashboardLayout["layout"] {
  const config = getDashboardConfig(role)
  return config.layout
}

