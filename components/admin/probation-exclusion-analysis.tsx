"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Learner } from "@/lib/types"
import { getStudents } from "@/lib/data-service"
import {
  AlertTriangle,
  UserX,
  UserCheck,
  Search,
  Download,
  BarChart3,
  Users,
  Eye,
  MoreHorizontal,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { StudentBreakdownDrilldownDialog, type Segment } from "@/components/admin/student-breakdown-drilldown-dialog"

interface ModuleData {
  code: string
  name: string
  department: string
  level: string
  probationCount: number
  exclusionBeforeProcessing: number
  readmitted: number
  excluded: number
  totalStudents: number
  probationRate: number
  exclusionRate: number
  readmissionRate: number
  qualificationCode?: string
  qualificationName?: string
}

// Solusi University Probation & Exclusion Analysis Data
// Organized by Faculty: Education/Humanities/Agriculture/Sciences/Health, Business Administration, Theology/Chaplaincy
const mockModuleData: ModuleData[] = [
  // Faculty of Education, Humanities, Agriculture, Sciences & Health Professions
  // Education Department
  {
    code: "EDU101",
    name: "Introduction to Education",
    department: "Education",
    level: "First Year",
    probationCount: 25,
    exclusionBeforeProcessing: 2,
    readmitted: 5,
    excluded: 3,
    totalStudents: 180,
    probationRate: 13.9,
    exclusionRate: 1.1,
    readmissionRate: 2.8,
  },
  {
    code: "EDU201",
    name: "Educational Psychology",
    department: "Education",
    level: "Second Year",
    probationCount: 18,
    exclusionBeforeProcessing: 1,
    readmitted: 4,
    excluded: 2,
    totalStudents: 150,
    probationRate: 12.0,
    exclusionRate: 0.7,
    readmissionRate: 2.7,
  },
  {
    code: "EDU301",
    name: "Curriculum Development",
    department: "Education",
    level: "Third Year",
    probationCount: 12,
    exclusionBeforeProcessing: 0,
    readmitted: 2,
    excluded: 1,
    totalStudents: 120,
    probationRate: 10.0,
    exclusionRate: 0,
    readmissionRate: 1.7,
  },
  // Humanities Department
  {
    code: "HUM101",
    name: "Introduction to Humanities",
    department: "Humanities",
    level: "First Year",
    probationCount: 20,
    exclusionBeforeProcessing: 1,
    readmitted: 3,
    excluded: 2,
    totalStudents: 160,
    probationRate: 12.5,
    exclusionRate: 0.6,
    readmissionRate: 1.9,
  },
  {
    code: "HUM201",
    name: "Cultural Studies",
    department: "Humanities",
    level: "Second Year",
    probationCount: 15,
    exclusionBeforeProcessing: 0,
    readmitted: 2,
    excluded: 1,
    totalStudents: 140,
    probationRate: 10.7,
    exclusionRate: 0,
    readmissionRate: 1.4,
  },
  // Agriculture Department
  {
    code: "AGR101",
    name: "Introduction to Agriculture",
    department: "Agriculture",
    level: "First Year",
    probationCount: 22,
    exclusionBeforeProcessing: 2,
    readmitted: 4,
    excluded: 2,
    totalStudents: 170,
    probationRate: 12.9,
    exclusionRate: 1.2,
    readmissionRate: 2.4,
  },
  {
    code: "AGR201",
    name: "Crop Production",
    department: "Agriculture",
    level: "Second Year",
    probationCount: 16,
    exclusionBeforeProcessing: 1,
    readmitted: 3,
    excluded: 1,
    totalStudents: 145,
    probationRate: 11.0,
    exclusionRate: 0.7,
    readmissionRate: 2.1,
  },
  // Sciences Department
  {
    code: "SCI101",
    name: "General Science",
    department: "Sciences",
    level: "First Year",
    probationCount: 30,
    exclusionBeforeProcessing: 3,
    readmitted: 6,
    excluded: 4,
    totalStudents: 200,
    probationRate: 15.0,
    exclusionRate: 1.5,
    readmissionRate: 3.0,
  },
  {
    code: "SCI201",
    name: "Environmental Science",
    department: "Sciences",
    level: "Second Year",
    probationCount: 24,
    exclusionBeforeProcessing: 2,
    readmitted: 5,
    excluded: 3,
    totalStudents: 180,
    probationRate: 13.3,
    exclusionRate: 1.1,
    readmissionRate: 2.8,
  },
  {
    code: "SCI301",
    name: "Advanced Environmental Science",
    department: "Sciences",
    level: "Third Year",
    probationCount: 18,
    exclusionBeforeProcessing: 1,
    readmitted: 3,
    excluded: 2,
    totalStudents: 150,
    probationRate: 12.0,
    exclusionRate: 0.7,
    readmissionRate: 2.0,
  },
  // Health Professions Department
  {
    code: "HLT101",
    name: "Introduction to Health Sciences",
    department: "Health Professions",
    level: "First Year",
    probationCount: 15,
    exclusionBeforeProcessing: 1,
    readmitted: 2,
    excluded: 1,
    totalStudents: 140,
    probationRate: 10.7,
    exclusionRate: 0.7,
    readmissionRate: 1.4,
  },
  {
    code: "NURS101",
    name: "Nursing Fundamentals",
    department: "Health Professions",
    level: "First Year",
    probationCount: 12,
    exclusionBeforeProcessing: 0,
    readmitted: 1,
    excluded: 0,
    totalStudents: 130,
    probationRate: 9.2,
    exclusionRate: 0,
    readmissionRate: 0.8,
  },
  {
    code: "HLT201",
    name: "Public Health",
    department: "Health Professions",
    level: "Second Year",
    probationCount: 10,
    exclusionBeforeProcessing: 0,
    readmitted: 1,
    excluded: 0,
    totalStudents: 125,
    probationRate: 8.0,
    exclusionRate: 0,
    readmissionRate: 0.8,
  },
  // Faculty of Business Administration
  // Management Department
  {
    code: "MGT101",
    name: "Principles of Management",
    department: "Management",
    level: "First Year",
    probationCount: 28,
    exclusionBeforeProcessing: 3,
    readmitted: 6,
    excluded: 4,
    totalStudents: 190,
    probationRate: 14.7,
    exclusionRate: 1.6,
    readmissionRate: 3.2,
  },
  {
    code: "MGT201",
    name: "Organizational Behavior",
    department: "Management",
    level: "Second Year",
    probationCount: 22,
    exclusionBeforeProcessing: 2,
    readmitted: 5,
    excluded: 3,
    totalStudents: 175,
    probationRate: 12.6,
    exclusionRate: 1.1,
    readmissionRate: 2.9,
  },
  {
    code: "MGT301",
    name: "Strategic Management",
    department: "Management",
    level: "Third Year",
    probationCount: 16,
    exclusionBeforeProcessing: 1,
    readmitted: 3,
    excluded: 2,
    totalStudents: 155,
    probationRate: 10.3,
    exclusionRate: 0.6,
    readmissionRate: 1.9,
  },
  {
    code: "MBA101",
    name: "MBA Core Management",
    department: "Management",
    level: "Postgraduate",
    probationCount: 8,
    exclusionBeforeProcessing: 0,
    readmitted: 1,
    excluded: 0,
    totalStudents: 80,
    probationRate: 10.0,
    exclusionRate: 0,
    readmissionRate: 1.3,
  },
  // Accounting Department
  {
    code: "ACC101",
    name: "Financial Accounting",
    department: "Accounting",
    level: "First Year",
    probationCount: 26,
    exclusionBeforeProcessing: 2,
    readmitted: 5,
    excluded: 3,
    totalStudents: 185,
    probationRate: 14.1,
    exclusionRate: 1.1,
    readmissionRate: 2.7,
  },
  {
    code: "ACC201",
    name: "Managerial Accounting",
    department: "Accounting",
    level: "Second Year",
    probationCount: 20,
    exclusionBeforeProcessing: 1,
    readmitted: 4,
    excluded: 2,
    totalStudents: 170,
    probationRate: 11.8,
    exclusionRate: 0.6,
    readmissionRate: 2.4,
  },
  {
    code: "ACC301",
    name: "Advanced Accounting",
    department: "Accounting",
    level: "Third Year",
    probationCount: 14,
    exclusionBeforeProcessing: 1,
    readmitted: 2,
    excluded: 1,
    totalStudents: 145,
    probationRate: 9.7,
    exclusionRate: 0.7,
    readmissionRate: 1.4,
  },
  // Marketing Department
  {
    code: "MKT101",
    name: "Principles of Marketing",
    department: "Marketing",
    level: "First Year",
    probationCount: 24,
    exclusionBeforeProcessing: 2,
    readmitted: 4,
    excluded: 3,
    totalStudents: 180,
    probationRate: 13.3,
    exclusionRate: 1.1,
    readmissionRate: 2.2,
  },
  {
    code: "MKT201",
    name: "Consumer Behavior",
    department: "Marketing",
    level: "Second Year",
    probationCount: 18,
    exclusionBeforeProcessing: 1,
    readmitted: 3,
    excluded: 2,
    totalStudents: 160,
    probationRate: 11.3,
    exclusionRate: 0.6,
    readmissionRate: 1.9,
  },
  // Management Information Systems (MIS) Department
  {
    code: "MIS101",
    name: "Information Systems Fundamentals",
    department: "Management Information Systems (MIS)",
    level: "First Year",
    probationCount: 32,
    exclusionBeforeProcessing: 4,
    readmitted: 7,
    excluded: 5,
    totalStudents: 210,
    probationRate: 15.2,
    exclusionRate: 1.9,
    readmissionRate: 3.3,
  },
  {
    code: "MIS201",
    name: "Database Management Systems",
    department: "Management Information Systems (MIS)",
    level: "Second Year",
    probationCount: 28,
    exclusionBeforeProcessing: 3,
    readmitted: 6,
    excluded: 4,
    totalStudents: 195,
    probationRate: 14.4,
    exclusionRate: 1.5,
    readmissionRate: 3.1,
  },
  {
    code: "MIS301",
    name: "Systems Analysis and Design",
    department: "Management Information Systems (MIS)",
    level: "Third Year",
    probationCount: 20,
    exclusionBeforeProcessing: 2,
    readmitted: 4,
    excluded: 3,
    totalStudents: 175,
    probationRate: 11.4,
    exclusionRate: 1.1,
    readmissionRate: 2.3,
  },
  // Faculty of Theology and Chaplaincy
  // Theology Department
  {
    code: "THE101",
    name: "Introduction to Theology",
    department: "Theology",
    level: "First Year",
    probationCount: 10,
    exclusionBeforeProcessing: 0,
    readmitted: 1,
    excluded: 0,
    totalStudents: 120,
    probationRate: 8.3,
    exclusionRate: 0,
    readmissionRate: 0.8,
  },
  {
    code: "THE201",
    name: "Biblical Studies",
    department: "Theology",
    level: "Second Year",
    probationCount: 8,
    exclusionBeforeProcessing: 0,
    readmitted: 1,
    excluded: 0,
    totalStudents: 110,
    probationRate: 7.3,
    exclusionRate: 0,
    readmissionRate: 0.9,
  },
  {
    code: "THE301",
    name: "Systematic Theology",
    department: "Theology",
    level: "Third Year",
    probationCount: 6,
    exclusionBeforeProcessing: 0,
    readmitted: 0,
    excluded: 0,
    totalStudents: 100,
    probationRate: 6.0,
    exclusionRate: 0,
    readmissionRate: 0,
  },
  // Chaplaincy / Religious Studies Department
  {
    code: "CHP101",
    name: "Introduction to Chaplaincy",
    department: "Chaplaincy / Religious Studies",
    level: "First Year",
    probationCount: 8,
    exclusionBeforeProcessing: 0,
    readmitted: 1,
    excluded: 0,
    totalStudents: 90,
    probationRate: 8.9,
    exclusionRate: 0,
    readmissionRate: 1.1,
  },
  {
    code: "CHP201",
    name: "Pastoral Care",
    department: "Chaplaincy / Religious Studies",
    level: "Second Year",
    probationCount: 6,
    exclusionBeforeProcessing: 0,
    readmitted: 0,
    excluded: 0,
    totalStudents: 85,
    probationRate: 7.1,
    exclusionRate: 0,
    readmissionRate: 0,
  },
  // --- Same module in different departments / qualification codes ---
  {
    code: "RES101",
    name: "Research Methods",
    department: "Education",
    level: "First Year",
    qualificationCode: "DPRSF0",
    qualificationName: "Diploma (Education)",
    probationCount: 14,
    exclusionBeforeProcessing: 1,
    readmitted: 3,
    excluded: 2,
    totalStudents: 95,
    probationRate: 14.7,
    exclusionRate: 1.1,
    readmissionRate: 3.2,
  },
  {
    code: "RES101",
    name: "Research Methods",
    department: "Sciences",
    level: "First Year",
    qualificationCode: "DPSCF0",
    qualificationName: "Diploma (Sciences)",
    probationCount: 28,
    exclusionBeforeProcessing: 2,
    readmitted: 5,
    excluded: 3,
    totalStudents: 185,
    probationRate: 15.1,
    exclusionRate: 1.1,
    readmissionRate: 2.7,
  },
  {
    code: "RES101",
    name: "Research Methods",
    department: "Management",
    level: "First Year",
    qualificationCode: "DPBAF0",
    qualificationName: "Diploma (Business Administration)",
    probationCount: 22,
    exclusionBeforeProcessing: 2,
    readmitted: 4,
    excluded: 3,
    totalStudents: 165,
    probationRate: 13.3,
    exclusionRate: 1.2,
    readmissionRate: 2.4,
  },
  {
    code: "STAT101",
    name: "Introductory Statistics",
    department: "Sciences",
    level: "First Year",
    qualificationCode: "DPSCF0",
    qualificationName: "Diploma (Sciences)",
    probationCount: 32,
    exclusionBeforeProcessing: 3,
    readmitted: 6,
    excluded: 4,
    totalStudents: 195,
    probationRate: 16.4,
    exclusionRate: 1.5,
    readmissionRate: 3.1,
  },
  {
    code: "STAT101",
    name: "Introductory Statistics",
    department: "Accounting",
    level: "First Year",
    qualificationCode: "DPACF0",
    qualificationName: "Diploma (Accounting)",
    probationCount: 24,
    exclusionBeforeProcessing: 2,
    readmitted: 5,
    excluded: 3,
    totalStudents: 172,
    probationRate: 14.0,
    exclusionRate: 1.2,
    readmissionRate: 2.9,
  },
  {
    code: "STAT101",
    name: "Introductory Statistics",
    department: "Health Professions",
    level: "First Year",
    qualificationCode: "DPHLF0",
    qualificationName: "Diploma (Health Sciences)",
    probationCount: 18,
    exclusionBeforeProcessing: 1,
    readmitted: 3,
    excluded: 2,
    totalStudents: 135,
    probationRate: 13.3,
    exclusionRate: 0.7,
    readmissionRate: 2.2,
  },
  {
    code: "COM101",
    name: "Communication Skills",
    department: "Humanities",
    level: "First Year",
    qualificationCode: "DPHSF0",
    qualificationName: "Diploma (Humanities)",
    probationCount: 12,
    exclusionBeforeProcessing: 1,
    readmitted: 2,
    excluded: 1,
    totalStudents: 145,
    probationRate: 8.3,
    exclusionRate: 0.7,
    readmissionRate: 1.4,
  },
  {
    code: "COM101",
    name: "Communication Skills",
    department: "Management",
    level: "First Year",
    qualificationCode: "DPBAF0",
    qualificationName: "Diploma (Business Administration)",
    probationCount: 20,
    exclusionBeforeProcessing: 2,
    readmitted: 4,
    excluded: 2,
    totalStudents: 168,
    probationRate: 11.9,
    exclusionRate: 1.2,
    readmissionRate: 2.4,
  },
  {
    code: "ETH201",
    name: "Professional Ethics",
    department: "Theology",
    level: "Second Year",
    qualificationCode: "DPTF0",
    qualificationName: "Diploma (Theology)",
    probationCount: 5,
    exclusionBeforeProcessing: 0,
    readmitted: 1,
    excluded: 0,
    totalStudents: 88,
    probationRate: 5.7,
    exclusionRate: 0,
    readmissionRate: 1.1,
  },
  {
    code: "ETH201",
    name: "Professional Ethics",
    department: "Management",
    level: "Second Year",
    qualificationCode: "DPBAF0",
    qualificationName: "Diploma (Business Administration)",
    probationCount: 16,
    exclusionBeforeProcessing: 1,
    readmitted: 3,
    excluded: 2,
    totalStudents: 158,
    probationRate: 10.1,
    exclusionRate: 0.6,
    readmissionRate: 1.9,
  },
]

type MetricKey =
  | "probationCount"
  | "exclusionBeforeProcessing"
  | "readmitted"
  | "excluded"
  | "totalStudents"

const metricLabels: Record<MetricKey, string> = {
  probationCount: "Probation Count",
  exclusionBeforeProcessing: "Exclusion Count",
  readmitted: "Readmitted Count",
  excluded: "Excluded Count",
  totalStudents: "Total Students",
}

const qualificationByDepartment: Record<string, { code: string; name: string }> = {
  Education: { code: "DPRSF0", name: "Diploma (Education)" },
  Humanities: { code: "DPHSF0", name: "Diploma (Humanities)" },
  Agriculture: { code: "DPAGF0", name: "Diploma (Agriculture)" },
  Sciences: { code: "DPSCF0", name: "Diploma (Sciences)" },
  "Health Professions": { code: "DPHLF0", name: "Diploma (Health Sciences)" },
  Management: { code: "DPBAF0", name: "Diploma (Business Administration)" },
  Accounting: { code: "DPACF0", name: "Diploma (Accounting)" },
  Marketing: { code: "DPMKF0", name: "Diploma (Marketing)" },
  "Management Information Systems (MIS)": {
    code: "DPMIF0",
    name: "Diploma (Management Information Systems)",
  },
  Theology: { code: "DPTF0", name: "Diploma (Theology)" },
  "Chaplaincy / Religious Studies": { code: "DPCF0", name: "Diploma (Chaplaincy)" },
}

type DrilldownMetricKey =
  | "totalStudents"
  | "probationCount"
  | "exclusionBeforeProcessing"
  | "readmitted"
  | "excluded"

const drilldownMetricLabels: Record<DrilldownMetricKey, string> = {
  totalStudents: "Total Students",
  probationCount: "Probation",
  exclusionBeforeProcessing: "Exclusion Before",
  readmitted: "Readmitted",
  excluded: "Excluded",
}

function balanceCounts(module: ModuleData) {
  const totalStudents = Math.max(0, Math.floor(module.totalStudents))
  const excluded = Math.min(Math.max(0, Math.floor(module.excluded)), totalStudents)
  const readmitted = Math.min(Math.max(0, Math.floor(module.readmitted)), totalStudents - excluded)
  const exclusionBeforeProcessing = Math.min(
    Math.max(0, Math.floor(module.exclusionBeforeProcessing)),
    totalStudents - excluded - readmitted
  )
  const probationCount = Math.max(0, totalStudents - excluded - readmitted - exclusionBeforeProcessing)

  return {
    totalStudents,
    probationCount,
    exclusionBeforeProcessing,
    readmitted,
    excluded,
  }
}

function hashString(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function pickDeterministic<T>(items: T[], seed: string, count: number): T[] {
  if (count <= 0 || items.length === 0) return []
  const tagged = items.map((item, idx) => ({
    item,
    sort: hashString(`${seed}|${idx}`),
  }))
  tagged.sort((a, b) => a.sort - b.sort)
  return tagged.slice(0, Math.min(count, tagged.length)).map((t) => t.item)
}

function formatBool(v: boolean | undefined) {
  if (v === true) return "Yes"
  if (v === false) return "No"
  return "—"
}

function renderStudentDetail(learner: Learner) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Student summary</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
          <p className="font-medium text-foreground break-all">{learner.email ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Risk level</p>
          <p className="font-medium text-foreground">{learner.riskLevel ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">On probation</p>
          <p className="font-medium text-foreground">{formatBool(learner.isOnProbation)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Probation reason</p>
          <p className="font-medium text-foreground">{learner.probationReason ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Financially excluded</p>
          <p className="font-medium text-foreground">{formatBool(learner.financiallyExcluded)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dropped out</p>
          <p className="font-medium text-foreground">{formatBool(learner.hasDroppedOut)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Readmitted</p>
          <p className="font-medium text-foreground">{formatBool(learner.isReadmitted)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Credits</p>
          <p className="font-medium text-foreground">
            {learner.registeredCredits != null && learner.requiredCredits != null
              ? `${learner.registeredCredits} / ${learner.requiredCredits}`
              : "—"}
          </p>
        </div>
      </div>
    </div>
  )
}

export function ProbationExclusionAnalysis() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [metric, setMetric] = useState<MetricKey>("probationCount")

  const [drilldownOpen, setDrilldownOpen] = useState(false)
  const [drilldownModule, setDrilldownModule] = useState<ModuleData | null>(null)
  const [drilldownMetric, setDrilldownMetric] = useState<DrilldownMetricKey>("probationCount")

  const allStudents = useMemo(() => getStudents(), [])

  const departments = useMemo(() => Array.from(new Set(mockModuleData.map((m) => m.department))), [])
  const levels = useMemo(() => Array.from(new Set(mockModuleData.map((m) => m.level))), [])

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return mockModuleData
      .filter((m) => {
        const matchesSearch =
          term.length === 0 || m.code.toLowerCase().includes(term) || m.name.toLowerCase().includes(term)
        const matchesDepartment = selectedDepartment === "all" || m.department === selectedDepartment
        const matchesLevel = selectedLevel === "all" || m.level === selectedLevel
        return matchesSearch && matchesDepartment && matchesLevel
      })
      .sort((a, b) => {
        const aBalanced = balanceCounts(a)
        const bBalanced = balanceCounts(b)
        return (bBalanced[metric] as number) - (aBalanced[metric] as number)
      })
  }, [metric, searchTerm, selectedDepartment, selectedLevel])

  const totalStats = useMemo(() => {
    return {
      totalProbation: filteredData.reduce((sum, m) => sum + balanceCounts(m).probationCount, 0),
      totalExclusion: filteredData.reduce((sum, m) => sum + balanceCounts(m).exclusionBeforeProcessing, 0),
      totalReadmitted: filteredData.reduce((sum, m) => sum + balanceCounts(m).readmitted, 0),
      totalStudents: filteredData.reduce((sum, m) => sum + balanceCounts(m).totalStudents, 0),
    }
  }, [filteredData])

  const safePct = (num: number, denom: number) => (denom > 0 ? (num / denom) * 100 : 0)
  const excludedPct = (excluded: number, total: number) => (total > 0 ? (excluded / total) * 100 : 0)
  const getQualification = (module: ModuleData) => {
    const mapped = qualificationByDepartment[module.department]
    return {
      code: module.qualificationCode ?? mapped?.code ?? "—",
      name: module.qualificationName ?? mapped?.name ?? "—",
    }
  }

  const openDrilldown = (module: ModuleData, metricKey: DrilldownMetricKey) => {
    setDrilldownModule(module)
    setDrilldownMetric(metricKey)
    setDrilldownOpen(true)
  }

  const drilldown = useMemo(() => {
    if (!drilldownModule) {
      return {
        title: "Student Drilldown",
        subtitle: "",
        segments: [] as Segment[],
        students: [] as Learner[],
      }
    }

    const module = drilldownModule
    const balanced = balanceCounts(module)
    const baseSeed = `${module.code}|${module.department}|${module.level}`

    // Build ONE cohort and partition it so the numbers always balance:
    // probation + exclusionBefore + readmitted + excluded = totalStudents.
    const cohortAll = pickDeterministic(
      allStudents,
      `${baseSeed}|cohort|all`,
      Math.min(balanced.totalStudents, 500)
    )

    const excludedCount = Math.min(balanced.excluded, cohortAll.length)
    const readmittedCount = Math.min(balanced.readmitted, Math.max(0, cohortAll.length - excludedCount))
    const exclusionBeforeCount = Math.min(
      balanced.exclusionBeforeProcessing,
      Math.max(0, cohortAll.length - excludedCount - readmittedCount)
    )
    const probationCount = Math.max(0, cohortAll.length - excludedCount - readmittedCount - exclusionBeforeCount)

    const cohortExcluded = cohortAll.slice(0, excludedCount)
    const cohortReadmitted = cohortAll.slice(excludedCount, excludedCount + readmittedCount)
    const cohortExclusionBefore = cohortAll.slice(
      excludedCount + readmittedCount,
      excludedCount + readmittedCount + exclusionBeforeCount
    )
    const cohortProbation = cohortAll.slice(
      excludedCount + readmittedCount + exclusionBeforeCount,
      excludedCount + readmittedCount + exclusionBeforeCount + probationCount
    )

    // We pass a single combined list and use segment filters by ID membership.
    const byId = (list: Learner[]) => new Set(list.map((s) => s.id))
    const allSet = byId(cohortAll)
    const probationSet = byId(cohortProbation)
    const exclBeforeSet = byId(cohortExclusionBefore)
    const readmittedSet = byId(cohortReadmitted)
    const excludedSet = byId(cohortExcluded)

    const combined = Array.from(
      new Map<number, Learner>(
        [...cohortAll, ...cohortProbation, ...cohortExclusionBefore, ...cohortReadmitted, ...cohortExcluded].map((s) => [
          s.id,
          s,
        ])
      ).values()
    )

    const segments: Segment[] = [
      {
        id: "totalStudents",
        label: drilldownMetricLabels.totalStudents,
        count: balanced.totalStudents,
        filter: (s) => allSet.has(s.id),
      },
      {
        id: "probationCount",
        label: drilldownMetricLabels.probationCount,
        count: balanced.probationCount,
        filter: (s) => probationSet.has(s.id),
      },
      {
        id: "exclusionBeforeProcessing",
        label: drilldownMetricLabels.exclusionBeforeProcessing,
        count: balanced.exclusionBeforeProcessing,
        filter: (s) => exclBeforeSet.has(s.id),
      },
      {
        id: "readmitted",
        label: drilldownMetricLabels.readmitted,
        count: balanced.readmitted,
        filter: (s) => readmittedSet.has(s.id),
      },
      {
        id: "excluded",
        label: drilldownMetricLabels.excluded,
        count: balanced.excluded,
        filter: (s) => excludedSet.has(s.id),
      },
    ]

    const qual = getQualification(module)

    return {
      title: `${module.code} • ${module.name}`,
      subtitle: `${module.department} • ${module.level} • ${qual.code} • ${qual.name}`,
      segments,
      students: combined,
    }
  }, [allStudents, drilldownModule])

  return (
    <div className="space-y-6">
      {/* Header with Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-orange-500/15 via-orange-500/5 to-transparent shadow-[0_18px_45px_rgba(15,23,42,0.12)] dark:from-orange-500/20 dark:via-orange-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Probation</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{totalStats.totalProbation}</p>
                <p className="text-xs text-orange-500 dark:text-orange-400">
                  {safePct(totalStats.totalProbation, totalStats.totalStudents).toFixed(1)}% of total students
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-red-500/15 via-red-500/5 to-transparent shadow-[0_18px_45px_rgba(15,23,42,0.12)] dark:from-red-500/20 dark:via-red-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Exclusion</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{totalStats.totalExclusion}</p>
                <p className="text-xs text-red-500 dark:text-red-400">
                  {safePct(totalStats.totalExclusion, totalStats.totalStudents).toFixed(1)}% of total students
                </p>
              </div>
              <UserX className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-green-500/15 via-green-500/5 to-transparent shadow-[0_18px_45px_rgba(15,23,42,0.12)] dark:from-green-500/20 dark:via-green-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Readmitted</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{totalStats.totalReadmitted}</p>
                <p className="text-xs text-green-500 dark:text-green-400">
                  {safePct(totalStats.totalReadmitted, totalStats.totalStudents).toFixed(1)}% of total students
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-transparent shadow-[0_18px_45px_rgba(15,23,42,0.12)] dark:from-blue-500/20 dark:via-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Students</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalStats.totalStudents}</p>
                <p className="text-xs text-blue-500 dark:text-blue-400">
                  Across {filteredData.length} modules
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Select value={metric} onValueChange={(v) => setMetric(v as MetricKey)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Metric" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(metricLabels) as MetricKey[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {metricLabels[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon-sm" aria-label="Download">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Chart">
            <BarChart3 className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm" aria-label="More actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Chart
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Data Table */}
      <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
          <CardTitle className="text-lg font-semibold text-foreground">Probation & Exclusion Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-420px)] overflow-auto">
            <table className="min-w-[1500px] w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur">
                <tr className="border-b border-border/60">
                  <th className="min-w-[220px] p-4 text-left text-sm font-semibold text-foreground border-b border-border/60">
                    Module
                  </th>
                  <th className="min-w-[200px] p-4 text-left text-sm font-semibold text-foreground border-b border-border/60">
                    Department
                  </th>
                  <th className="min-w-[170px] p-4 text-left text-sm font-semibold text-foreground border-b border-border/60">
                    Qualification Code
                  </th>
                  <th className="min-w-[320px] p-4 text-left text-sm font-semibold text-foreground border-b border-border/60">
                    Qualification Name
                  </th>
                  <th className="min-w-[150px] p-4 text-left text-sm font-semibold text-foreground border-b border-border/60">
                    Level
                  </th>
                  <th className="min-w-[140px] p-4 text-center text-sm font-semibold text-foreground border-b border-border/60">
                    Total Students
                  </th>
                  <th className="min-w-[170px] p-4 text-center text-sm font-semibold text-foreground border-b border-border/60">
                    Probation
                  </th>
                  <th className="min-w-[190px] p-4 text-center text-sm font-semibold text-foreground border-b border-border/60">
                    Exclusion Before
                  </th>
                  <th className="min-w-[170px] p-4 text-center text-sm font-semibold text-foreground border-b border-border/60">
                    Readmitted
                  </th>
                  <th className="min-w-[160px] p-4 text-center text-sm font-semibold text-foreground border-b border-border/60">
                    Excluded
                  </th>
                  <th className="min-w-[140px] p-4 text-center text-sm font-semibold text-foreground border-b border-border/60">
                    Rates
                  </th>
                  <th className="min-w-[120px] p-4 text-center text-sm font-semibold text-foreground border-b border-border/60">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((module) => {
                  const qual = getQualification(module)
                  const balanced = balanceCounts(module)
                  const probationRate = safePct(balanced.probationCount, balanced.totalStudents)
                  const exclusionRate = safePct(balanced.exclusionBeforeProcessing, balanced.totalStudents)
                  const readmissionRate = safePct(balanced.readmitted, balanced.totalStudents)
                  const excludedRate = excludedPct(balanced.excluded, balanced.totalStudents)

                  const rowKey = `${module.code}-${module.department}-${module.level}-${getQualification(module).code}`
                  return (
                    <tr key={rowKey} className="border-b border-border/60 hover:bg-muted/30">
                      <td className="p-4 align-top border-b border-border/60">
                        <div className="font-semibold text-foreground">{module.code}</div>
                        <div className="text-sm text-muted-foreground">{module.name}</div>
                      </td>
                      <td className="p-4 align-top border-b border-border/60">
                        <Badge
                          variant="secondary"
                          className="bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                        >
                          {module.department}
                        </Badge>
                      </td>
                      <td className="p-4 align-top border-b border-border/60">
                        <span className="font-semibold text-foreground">{qual.code}</span>
                      </td>
                      <td className="p-4 align-top border-b border-border/60">
                        <span className="text-sm text-foreground">{qual.name}</span>
                      </td>
                      <td className="p-4 align-top border-b border-border/60">
                        <Badge
                          variant="outline"
                          className="border-purple-500/30 text-purple-700 dark:border-purple-500/40 dark:text-purple-200"
                        >
                          {module.level}
                        </Badge>
                      </td>
                      <td className="p-4 text-center align-top border-b border-border/60">
                        <button
                          type="button"
                          onClick={() => openDrilldown(module, "totalStudents")}
                          className="font-semibold text-foreground underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                          aria-label={`View ${balanced.totalStudents} students for ${module.code}`}
                        >
                          {balanced.totalStudents}
                        </button>
                      </td>
                      <td className="p-4 text-center align-top border-b border-border/60">
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openDrilldown(module, "probationCount")}
                              className="font-semibold text-orange-600 dark:text-orange-400 underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                              aria-label={`View ${balanced.probationCount} probation students for ${module.code}`}
                            >
                              {balanced.probationCount}
                            </button>
                            <span className="text-xs text-muted-foreground">{probationRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-center">
                            <Progress value={probationRate} className="h-2 w-20" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center align-top border-b border-border/60">
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openDrilldown(module, "exclusionBeforeProcessing")}
                              className="font-semibold text-red-600 dark:text-red-400 underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                              aria-label={`View ${balanced.exclusionBeforeProcessing} exclusion-before students for ${module.code}`}
                            >
                              {balanced.exclusionBeforeProcessing}
                            </button>
                            <span className="text-xs text-muted-foreground">{exclusionRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-center">
                            <Progress value={exclusionRate} className="h-2 w-20" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center align-top border-b border-border/60">
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openDrilldown(module, "readmitted")}
                              className="font-semibold text-green-600 dark:text-green-400 underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                              aria-label={`View ${balanced.readmitted} readmitted students for ${module.code}`}
                            >
                              {balanced.readmitted}
                            </button>
                            <span className="text-xs text-muted-foreground">{readmissionRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-center">
                            <Progress value={readmissionRate} className="h-2 w-20" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center align-top border-b border-border/60">
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openDrilldown(module, "excluded")}
                              className="font-semibold text-red-600 dark:text-red-400 underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                              aria-label={`View ${balanced.excluded} excluded students for ${module.code}`}
                            >
                              {balanced.excluded}
                            </button>
                            <span className="text-xs text-muted-foreground">{excludedRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-center">
                            <Progress value={excludedRate} className="h-2 w-20" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center align-top border-b border-border/60">
                        <div className="space-y-1 text-xs">
                          <div className="text-orange-600 dark:text-orange-400">P: {probationRate.toFixed(1)}%</div>
                          <div className="text-red-600 dark:text-red-400">E: {exclusionRate.toFixed(1)}%</div>
                          <div className="text-green-600 dark:text-green-400">R: {readmissionRate.toFixed(1)}%</div>
                        </div>
                      </td>
                      <td className="p-4 text-center align-top border-b border-border/60">
                        <Button variant="ghost" size="icon-sm" aria-label="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}

                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={12} className="p-10 text-center text-muted-foreground">
                      No modules found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <StudentBreakdownDrilldownDialog
        open={drilldownOpen}
        onOpenChange={setDrilldownOpen}
        title={drilldown.title}
        subtitle={drilldown.subtitle}
        segments={drilldown.segments}
        students={drilldown.students}
        renderStudentDetail={renderStudentDetail}
        initialSegmentId={drilldownMetric}
        initialView="students"
      />
    </div>
  )
}
