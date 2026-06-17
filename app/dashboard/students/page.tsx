"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Search,
  Download,
  MessageSquare,
  AlertTriangle,
  MoreHorizontal,
  Copy,
  FileText,
  Printer,
  Users,
  UserCheck,
  UserX,
  RotateCcw,
  GraduationCap,
} from "lucide-react"
import SendMessageDialog from "@/components/admin/send-message-dialog"
import SendRiskNoteDialog from "@/components/admin/send-risk-note-dialog"
import { getStudents, getSubjects, getSchools, getSchoolsByDistrict, getSchool } from "@/lib/data-service"
import { SOUTH_AFRICAN_PROVINCES } from "@/lib/sa-provinces-data"
import { getStudentHierarchy } from "@/lib/hierarchy-analysis"
import type { Learner, SubjectCode, AcademicStatus, AssessmentScore, AttendanceSummary, RiskLevel } from "@/lib/types"

// Get data from data service
const mockSubjects = getSubjects()
const allStudents = getStudents()
const allSchools = getSchools()

// Mock data for Learner List
const mockGroups = [
  {
    id: "N1",
    name: "N1",
    description: "First year students",
  },
  {
    id: "N2",
    name: "N2",
    description: "Second year students",
  },
  {
    id: "N3",
    name: "N3",
    description: "Third year students",
  },
]

const mockModules = [
  {
    id: "1",
    code: "ENG101",
    name: "Engineering Fundamentals",
    campus: "Brits Campus",
    department: "Engineering Studies",
    riskLevel: "low" as const,
    stats: {
      probation: 2,
      readmitted: 1,
      repeaters: { first: 0, second: 2, third: 1, fourth: 0 },
      firstTime: 1,
      total: 1,
    },
  },
  {
    id: "2",
    code: "ENG201",
    name: "Advanced Engineering Mathematics",
    campus: "Brits Campus",
    department: "Engineering Studies",
    riskLevel: "medium" as const,
    stats: {
      probation: 1,
      readmitted: 0,
      repeaters: { first: 2, second: 1, third: 0, fourth: 0 },
      firstTime: 0,
      total: 3,
    },
  },
  {
    id: "3",
    code: "CS301",
    name: "Advanced Programming",
    campus: "Brits Campus",
    department: "Engineering Studies",
    riskLevel: "low" as const,
    stats: {
      probation: 0,
      readmitted: 1,
      repeaters: { first: 1, second: 0, third: 1, fourth: 0 },
      firstTime: 2,
      total: 3,
    },
  },
]

interface StudentModule {
  id: string
  code: string
  name: string
  isSupported: boolean
  isDepartmental: boolean
}

interface MockStudent extends Learner {
  moduleCode: string
  previousModules: string[]
  group: string
}

// Generate additional students to reach 130 total
const generateAdditionalStudents = (): MockStudent[] => {
  const firstNames = [
    "James", "Mary", "William", "Patricia", "Richard", "Jennifer", "Joseph", "Linda",
    "Thomas", "Elizabeth", "Charles", "Barbara", "Christopher", "Susan", "Daniel", "Jessica",
    "Matthew", "Sarah", "Anthony", "Karen", "Mark", "Nancy", "Donald", "Lisa",
    "Steven", "Betty", "Andrew", "Margaret", "Paul", "Sandra", "Joshua", "Ashley",
    "Kenneth", "Kimberly", "Kevin", "Emily", "Brian", "Donna", "George", "Michelle",
    "Timothy", "Carol", "Ronald", "Amanda", "Jason", "Dorothy", "Edward", "Melissa",
    "Jeffrey", "Deborah", "Ryan", "Stephanie", "Jacob", "Rebecca", "Gary", "Sharon",
    "Nicholas", "Laura", "Eric", "Cynthia", "Jonathan", "Kathleen", "Stephen", "Amy",
    "Larry", "Angela", "Justin", "Shirley", "Scott", "Anna", "Brandon", "Brenda",
    "Benjamin", "Pamela", "Samuel", "Emma", "Frank", "Nicole", "Gregory", "Helen",
    "Raymond", "Samantha", "Alexander", "Katherine", "Patrick", "Christine", "Jack", "Debra",
    "Dennis", "Rachel", "Jerry", "Carolyn", "Tyler", "Janet", "Aaron", "Maria",
    "Jose", "Catherine", "Henry", "Frances", "Adam", "Ann", "Douglas", "Joyce",
    "Nathan", "Diane", "Zachary", "Alice", "Kyle", "Julie", "Noah", "Heather",
    "Ethan", "Teresa", "Jeremy", "Doris", "Walter", "Gloria", "Christian", "Evelyn",
    "Keith", "Jean", "Roger", "Cheryl", "Terry", "Martha", "Austin", "Andrea",
    "Sean", "Frances", "Gerald", "Marie", "Carl", "Janet", "Harold", "Catherine"
  ]

  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor",
    "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Sanchez",
    "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
    "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams",
    "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
    "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards",
    "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers",
    "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey", "Reed", "Kelly",
    "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson", "Watson", "Brooks",
    "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes",
    "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long", "Ross",
    "Foster", "Jimenez", "Powell", "Jenkins", "Perry", "Russell", "Sullivan", "Bell",
    "Coleman", "Butler", "Henderson", "Barnes", "Gonzales", "Fisher", "Vasquez", "Simmons"
  ]

  const modules = ["ENG101", "ENG201", "BUS101", "CS301"]
  const groups = ["N1", "N2", "N3"]
  const academicStatuses: ("First-time" | "Repeating Subject" | "Academic Warning")[] = [
    "First-time", "Repeating Subject", "Repeating Subject", "Repeating Subject", "Academic Warning"
  ]
  const riskLevels: ("Good" | "Satisfactory" | "At Risk")[] = ["Good", "Satisfactory", "At Risk"]

  const students: MockStudent[] = []
  let studentId = 12 // Start from 12 (we have 1-11)
  let studentNumber = 12

  // Generate 119 more students (to reach 130 total: 11 existing + 119 new)
  for (let i = 0; i < 119; i++) {
    const firstName = firstNames[i % firstNames.length]
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length]
    const moduleCode = modules[i % modules.length]
    const group = groups[i % groups.length]
    const academicStatus = academicStatuses[i % academicStatuses.length]

    // Determine previous modules - ensure Registered Modules is between 3-7
    // Registered Modules = previousModules.length + 1, so previousModules should be 2-6
    const registeredModulesCount = 3 + (i % 5) // 3, 4, 5, 6, or 7
    const previousModulesCount = registeredModulesCount - 1 // 2, 3, 4, 5, or 6
    let previousModules: string[] = []

    // Generate previous modules to reach the desired count
    for (let j = 0; j < previousModulesCount; j++) {
      previousModules.push(modules[(i + j) % modules.length])
    }

    // If First-time, still need to have previousModules to show 3-7 registered modules
    // But for First-time students, we'll set it to show 3-5 modules
    if (academicStatus === "First-time") {
      const firstTimeModulesCount = 2 + (i % 3) // 2, 3, or 4 (so total is 3, 4, or 5)
      previousModules = []
      for (let j = 0; j < firstTimeModulesCount; j++) {
        previousModules.push(modules[(i + j) % modules.length])
      }
    }

    // Generate varied assessment scores
    const baseScore = 50 + (i % 45) // Scores between 50-95
    const as = baseScore + (i % 10) - 5
    const ct = baseScore + (i % 8) - 4
    const wr = baseScore + (i % 12) - 6
    const pp = baseScore + (i % 7) - 3

    // Determine risk level based on scores
    const avgScore = (as + ct + wr) / 3
    let riskLevel: "Good" | "Satisfactory" | "At Risk"
    if (avgScore >= 70) {
      riskLevel = "Good"
    } else if (avgScore >= 50) {
      riskLevel = "Satisfactory"
    } else {
      riskLevel = "At Risk"
    }

    // Generate attendance
    const attendancePercentage = 60 + (i % 40) // 60-100%
    const totalClasses = 32
    const attended = Math.round((attendancePercentage / 100) * totalClasses)

    students.push({
      id: studentId,
      studentNumber: `ST2024${String(studentNumber).padStart(3, "0")}`,
      name: firstName,
      surname: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.edu`,
      academicStatus,
      subjectCode: moduleCode,
      moduleCode,
      assessments: {
        AS: Math.max(0, Math.min(100, as)),
        CT: Math.max(0, Math.min(100, ct)),
        WR: Math.max(0, Math.min(100, wr)),
        PP: Math.max(0, Math.min(100, pp)),
      },
      attendance: {
        attended,
        total: totalClasses,
        percentage: attendancePercentage,
      },
      riskLevel,
      enrollmentYear: 2024,
      semester: 1,
      teacherId: (i % 3) + 1,
      previousSubjects: previousModules,
      previousModules,
      group,
    })

    studentId++
    studentNumber++
  }

  return students
}

const mockStudents: MockStudent[] = [
  {
    id: 1,
    studentNumber: "ST2024001",
    name: "John",
    surname: "Smith",
    email: "john.smith@student.edu",
    academicStatus: "First-time",
    subjectCode: "ENG101",
    moduleCode: "ENG101",
    assessments: { AS: 75, CT: 80, WR: 85, PP: 73 },
    attendance: { attended: 28, total: 32, percentage: 87.5 },
    riskLevel: "Good",
    enrollmentYear: 2024,
    semester: 1,
    teacherId: 1,
    previousSubjects: ["ENG201", "BUS101"],
    previousModules: ["ENG201", "BUS101"],
    group: "N1",
  },
  {
    id: 2,
    studentNumber: "ST2024002",
    name: "Sarah",
    surname: "Johnson",
    email: "sarah.johnson@student.edu",
    academicStatus: "Repeating Subject",
    subjectCode: "ENG101",
    moduleCode: "ENG101",
    assessments: { AS: 45, CT: 50, WR: 55, PP: 43 },
    attendance: { attended: 22, total: 32, percentage: 68.75 },
    riskLevel: "At Risk",
    enrollmentYear: 2024,
    semester: 1,
    teacherId: 1,
    previousSubjects: ["ENG101", "ENG201", "BUS101"],
    previousModules: ["ENG101", "ENG201", "BUS101"],
    group: "N1",
  },
  {
    id: 3,
    studentNumber: "ST2024003",
    name: "Michael",
    surname: "Brown",
    email: "michael.brown@student.edu",
    academicStatus: "Repeating Subject",
    subjectCode: "ENG201",
    moduleCode: "ENG201",
    assessments: { AS: 60, CT: 65, WR: 70, PP: 63 },
    attendance: { attended: 25, total: 32, percentage: 78.125 },
    riskLevel: "Satisfactory",
    enrollmentYear: 2024,
    semester: 1,
    teacherId: 2,
    previousSubjects: ["ENG101", "BUS101", "CS301", "ENG201"],
    previousModules: ["ENG101", "BUS101", "CS301", "ENG201"],
    group: "N2",
  },
  {
    id: 4,
    studentNumber: "ST2024004",
    name: "Emma",
    surname: "Davis",
    email: "emma.davis@student.edu",
    academicStatus: "Repeating Subject",
    subjectCode: "ENG101",
    moduleCode: "ENG101",
    assessments: { AS: 70, CT: 75, WR: 80, PP: 74 },
    attendance: { attended: 30, total: 32, percentage: 93.75 },
    riskLevel: "Good",
    enrollmentYear: 2024,
    semester: 1,
    teacherId: 2,
    previousSubjects: ["ENG101", "ENG201"],
    previousModules: ["ENG101", "ENG201"],
    group: "N2",
  },
  {
    id: 5,
    studentNumber: "ST2024005",
    name: "David",
    surname: "Wilson",
    email: "david.wilson@student.edu",
    academicStatus: "First-time",
    subjectCode: "BUS101",
    moduleCode: "BUS101",
    assessments: { AS: 85, CT: 88, WR: 90, PP: 83 },
    attendance: { attended: 31, total: 32, percentage: 96.875 },
    riskLevel: "Good",
    enrollmentYear: 2024,
    semester: 1,
    teacherId: 3,
    previousSubjects: ["ENG101", "ENG201"],
    previousModules: ["ENG101", "ENG201"],
    group: "N3",
  },
  {
    id: 6,
    studentNumber: "ST2024006",
    name: "Emily",
    surname: "Taylor",
    email: "emily.taylor@student.edu",
    academicStatus: "First-time",
    subjectCode: "BUS101",
    moduleCode: "BUS101",
    assessments: { AS: 78, CT: 82, WR: 85, PP: 76 },
    attendance: { attended: 29, total: 32, percentage: 90.625 },
    riskLevel: "Good",
    enrollmentYear: 2024,
    semester: 1,
    teacherId: 3,
    previousSubjects: ["ENG101", "CS301"],
    previousModules: ["ENG101", "CS301"],
    group: "N3",
  },
  {
    id: 7,
    studentNumber: "ST2024007",
    name: "Alex",
    surname: "Martinez",
    email: "alex.martinez@student.edu",
    academicStatus: "Repeating Subject",
    subjectCode: "ENG201",
    moduleCode: "ENG201",
    assessments: { AS: 55, CT: 60, WR: 65, PP: 58 },
    attendance: { attended: 20, total: 32, percentage: 62.5 },
    riskLevel: "At Risk",
    enrollmentYear: 2024,
    semester: 1,
    teacherId: 2,
    previousSubjects: ["ENG101", "BUS101", "CS301"],
    previousModules: ["ENG101", "BUS101", "CS301"],
    group: "N2",
  },
  {
    id: 8,
    studentNumber: "ST2024008",
    name: "Lisa",
    surname: "Anderson",
    email: "lisa.anderson@student.edu",
    academicStatus: "Repeating Subject",
    subjectCode: "BUS101",
    moduleCode: "BUS101",
    assessments: { AS: 65, CT: 70, WR: 75, PP: 68 },
    attendance: { attended: 24, total: 32, percentage: 75 },
    riskLevel: "Satisfactory",
    enrollmentYear: 2024,
    semester: 1,
    teacherId: 3,
    previousSubjects: ["ENG101", "ENG201", "CS301", "BUS101", "ENG101"],
    previousModules: ["ENG101", "ENG201", "CS301", "BUS101", "ENG101"],
    group: "N3",
  },
  {
    id: 9,
    studentNumber: "ST2024009",
    name: "Robert",
    surname: "Garcia",
    email: "robert.garcia@student.edu",
    academicStatus: "Academic Warning",
    subjectCode: "ENG201",
    moduleCode: "ENG201",
    assessments: { AS: 40, CT: 45, WR: 50, PP: 43 },
    attendance: { attended: 18, total: 32, percentage: 56.25 },
    riskLevel: "At Risk",
    enrollmentYear: 2024,
    semester: 1,
    teacherId: 2,
    previousSubjects: ["ENG101", "BUS101"],
    previousModules: ["ENG101", "BUS101"],
    group: "N2",
  },
  {
    id: 10,
    studentNumber: "ST2024010",
    name: "Jennifer",
    surname: "Lee",
    email: "jennifer.lee@student.edu",
    academicStatus: "Repeating Subject",
    subjectCode: "CS301",
    moduleCode: "CS301",
    assessments: { AS: 60, CT: 65, WR: 70, PP: 63 },
    attendance: { attended: 26, total: 32, percentage: 81.25 },
    riskLevel: "Satisfactory",
    enrollmentYear: 2024,
    semester: 1,
    teacherId: 3,
    previousSubjects: ["ENG101", "ENG201", "BUS101", "CS301", "ENG101", "ENG201"],
    previousModules: ["ENG101", "ENG201", "BUS101", "CS301", "ENG101", "ENG201"],
    group: "N3",
  },
  {
    id: 11,
    studentNumber: "ST2024011",
    name: "Kevin",
    surname: "Chen",
    email: "kevin.chen@student.edu",
    academicStatus: "Repeating Subject",
    subjectCode: "ENG101",
    moduleCode: "ENG101",
    assessments: { AS: 42, CT: 48, WR: 52, PP: 45 },
    attendance: { attended: 19, total: 32, percentage: 59.375 },
    riskLevel: "At Risk",
    enrollmentYear: 2024,
    semester: 1,
    teacherId: 1,
    previousSubjects: ["ENG101", "ENG201", "BUS101"],
    previousModules: ["ENG101", "ENG201", "BUS101"],
    group: "N1",
  },
  ...generateAdditionalStudents(),
]

export default function ClassListPage() {
  const [selectedProvince, setSelectedProvince] = useState<string>("all")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [selectedSchool, setSelectedSchool] = useState<string>("all")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [showSendMessage, setShowSendMessage] = useState(false)
  const [showSendRiskNote, setShowSendRiskNote] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Learner List specific state
  const [studentListSearchTerm, setStudentListSearchTerm] = useState("")
  const [studentListStatusFilter, setStudentListStatusFilter] = useState<string>("all")
  const [selectedStudentListModule, setSelectedStudentListModule] = useState<string>("all")
  const [selectedStudentListGroup, setSelectedStudentListGroup] = useState<string>("all")
  const [selectedStudentListStudents, setSelectedStudentListStudents] = useState<number[]>([])
  const [showStudentListSendMessage, setShowStudentListSendMessage] = useState(false)
  const [showStudentListSendRiskNote, setShowStudentListSendRiskNote] = useState(false)
  const [studentListCurrentPage, setStudentListCurrentPage] = useState(1)
  const [studentListItemsPerPage, setStudentListItemsPerPage] = useState(10)

  const currentSubject = selectedSubject === "all" ? null : mockSubjects.find((s) => s.code === selectedSubject)
  const currentSchool = selectedSchool === "all" ? null : getSchool(selectedSchool)

  // Cascading filter logic: get available districts and schools based on selections
  const availableDistricts = useMemo(() => {
    if (selectedProvince === "all") return []
    const province = SOUTH_AFRICAN_PROVINCES.find((p) => p.id === selectedProvince)
    return province?.districts || []
  }, [selectedProvince])

  const availableSchools = useMemo(() => {
    if (selectedDistrict === "all") {
      if (selectedProvince === "all") return allSchools
      return allSchools.filter((school) => school.provinceId === selectedProvince)
    }
    return getSchoolsByDistrict(selectedDistrict)
  }, [selectedDistrict, selectedProvince])

  // Reset dependent filters when parent changes
  useEffect(() => {
    if (selectedProvince === "all") {
      setSelectedDistrict("all")
      setSelectedSchool("all")
    } else {
      // Check if current district belongs to selected province
      const province = SOUTH_AFRICAN_PROVINCES.find((p) => p.id === selectedProvince)
      if (selectedDistrict !== "all" && !province?.districts.find((d) => d.id === selectedDistrict)) {
        setSelectedDistrict("all")
        setSelectedSchool("all")
      }
    }
  }, [selectedProvince])

  useEffect(() => {
    if (selectedDistrict === "all") {
      setSelectedSchool("all")
    } else {
      // Check if current school belongs to selected district
      const schoolsInDistrict = getSchoolsByDistrict(selectedDistrict)
      if (selectedSchool !== "all" && !schoolsInDistrict.find((s) => s.id === selectedSchool)) {
        setSelectedSchool("all")
      }
    }
  }, [selectedDistrict])

  // Create the two specific students for Students List
  const learnersListStudents = useMemo(() => {
    // Find St John's College school ID
    const stJohnsCollege = allSchools.find((school) => school.name === "St John's College")
    const schoolId = stJohnsCollege?.id || "st-johns-college"
    const districtId = stJohnsCollege?.districtId || "dist-gp-1"
    const provinceId = stJohnsCollege?.provinceId || "prov-gp"

    // Student 1: Sifiso Mazibuko - Academic Warning, Sci-Bono completed, 4 supported subjects
    const student1: Learner = {
      id: 1001,
      studentNumber: "ST20241001",
      name: "Sifiso",
      surname: "Mazibuko",
      email: "sifiso.mazibuko@student.edu",
      academicStatus: "Academic Warning",
      subjectCode: "MATH",
      assessments: { AS: 65, CT: 70, WR: 68, PP: 67 },
      attendance: { attended: 28, total: 32, percentage: 87.5 },
      riskLevel: "Satisfactory",
      enrollmentYear: 2024,
      semester: 1,
      teacherId: 1,
      previousSubjects: ["ENG", "PHY", "LIF", "GEO", "HIS", "ECO"],
      provinceId,
      districtId,
      schoolId,
      sciBono: {
        isParticipant: true,
        enrollmentDate: new Date("2024-01-15"),
        completionDate: new Date("2024-12-15"),
        status: "completed",
        scores: {
          robotics: {
            overallScore: 85,
            circuitBuilder: 80,
            robotDesign: 90,
            physicsSimulation: 85,
            activitiesCompleted: 12,
          },
          math: {
            overallScore: 88,
            challengesCompleted: 15,
            puzzlesSolved: 20,
            adaptiveLevel: 8,
            badgesEarned: 5,
          },
          aiTutor: {
            sessionsCompleted: 30,
            averageRating: 4.5,
            topicsCovered: ["Algebra", "Geometry", "Calculus"],
            helpRequests: 5,
          },
        },
        attendance: 90,
        badgesEarned: ["Math Master", "Robotics Expert"],
      },
    }

    // Student 2: Hannah Martinez - Subject Failed (avg < 50%), Sci-Bono inactive, 1 supported subject
    const student2: Learner = {
      id: 1002,
      studentNumber: "ST20241002",
      name: "Hannah",
      surname: "Martinez",
      email: "hannah.martinez@student.edu",
      academicStatus: "First-time",
      subjectCode: "MATH",
      assessments: { AS: 45, CT: 48, WR: 42, PP: 45 }, // Average < 50%
      attendance: { attended: 22, total: 32, percentage: 68.75 },
      riskLevel: "At Risk",
      enrollmentYear: 2024,
      semester: 1,
      teacherId: 1,
      previousSubjects: ["ENG", "PHY", "LIF", "GEO", "HIS", "ECO"],
      provinceId,
      districtId,
      schoolId,
      sciBono: {
        isParticipant: true,
        enrollmentDate: new Date("2024-01-15"),
        status: "inactive",
        scores: {
          robotics: {
            overallScore: 40,
            circuitBuilder: 35,
            robotDesign: 45,
            physicsSimulation: 40,
            activitiesCompleted: 3,
          },
          math: {
            overallScore: 42,
            challengesCompleted: 5,
            puzzlesSolved: 8,
            adaptiveLevel: 2,
            badgesEarned: 0,
          },
          aiTutor: {
            sessionsCompleted: 5,
            averageRating: 2.5,
            topicsCovered: ["Basic Math"],
            helpRequests: 15,
          },
        },
        attendance: 45,
        badgesEarned: [],
      },
    }

    return [student1, student2]
  }, [allSchools])

  // Calculate stats based on filtered students
  const calculateStats = () => {
    let studentsInGroup = allStudents

    // Apply school hierarchy filters first
    if (selectedSchool !== "all") {
      studentsInGroup = studentsInGroup.filter((student) => student.schoolId === selectedSchool)
    } else if (selectedDistrict !== "all") {
      // If district is selected but school is "all", filter by district
      studentsInGroup = studentsInGroup.filter((student) => student.districtId === selectedDistrict)
    } else if (selectedProvince !== "all") {
      // If province is selected but district is "all", filter by province
      studentsInGroup = studentsInGroup.filter((student) => student.provinceId === selectedProvince)
    }

    // Apply subject filter
    if (selectedSubject !== "all") {
      studentsInGroup = studentsInGroup.filter((student) => student.subjectCode === selectedSubject)
    }

    // New learners (First-time students)
    const newLearners = studentsInGroup.filter((s) => s.academicStatus === "First-time").length

    // Repeaters (students with "Repeating Subject" status)
    const repeaters = studentsInGroup.filter((s) => s.academicStatus === "Repeating Subject").length

    // Total learners = New + Repeaters
    const totalLearners = newLearners + repeaters

    // Subject Failed: Students with average assessment score below 50%
    const subjectFailed = studentsInGroup.filter((s) => {
      const avgScore = (s.assessments.AS + s.assessments.CT + s.assessments.WR) / 3
      return avgScore < 50
    }).length

    // Academic Recommends/Comments: Students who need academic recommendations
    // This includes students who are "At Risk" or "Satisfactory" (may need intervention/recommendations)
    // or students with low scores or high risk factors
    const academicRecommends = studentsInGroup.filter((s) => {
      const avgScore = (s.assessments.AS + s.assessments.CT + s.assessments.WR) / 3
      return (
        s.riskLevel === "At Risk" ||
        s.riskLevel === "Satisfactory" ||
        avgScore < 60 ||
        s.academicStatus === "Academic Warning" ||
        s.academicStatus === "Repeating Grade"
      )
    }).length

    return {
      academicRecommends,
      subjectFailed,
      repeaters,
      newLearners,
      totalLearners,
    }
  }

  const currentStats = calculateStats()

  // Calculate school-level stats (similar to calculateStats but specifically for school context)
  const calculateSchoolStats = () => {
    if (selectedSchool === "all") return null

    const studentsInSchool = allStudents.filter((student) => {
      // Apply all filters except school (we want school-specific stats)
      const matchesSubject = selectedSubject === "all" || student.subjectCode === selectedSubject
      const matchesSchool = student.schoolId === selectedSchool

      return matchesSubject && matchesSchool
    })

    const newLearners = studentsInSchool.filter((s) => s.academicStatus === "First-time").length
    const repeaters = studentsInSchool.filter((s) => s.academicStatus === "Repeating Subject").length
    const totalLearners = newLearners + repeaters

    const subjectFailed = studentsInSchool.filter((s) => {
      const avgScore = (s.assessments.AS + s.assessments.CT + s.assessments.WR) / 3
      return avgScore < 50
    }).length

    const academicRecommends = studentsInSchool.filter((s) => {
      const avgScore = (s.assessments.AS + s.assessments.CT + s.assessments.WR) / 3
      return (
        s.riskLevel === "At Risk" ||
        s.riskLevel === "Satisfactory" ||
        avgScore < 60 ||
        s.academicStatus === "Academic Warning" ||
        s.academicStatus === "Repeating Grade"
      )
    }).length

    return {
      academicRecommends,
      subjectFailed,
      repeaters,
      newLearners,
      totalLearners,
    }
  }

  const schoolStats = calculateSchoolStats()

  // Calculate stats for Students List section - must match the table filters/badges
  const calculateLearnersListStats = useMemo(() => {
    // Apply the SAME filters as `filteredStudentList` (search/module/group/status)
    const studentsInList = mockStudents.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(studentListSearchTerm.toLowerCase()) ||
        student.surname.toLowerCase().includes(studentListSearchTerm.toLowerCase()) ||
        student.studentNumber.toLowerCase().includes(studentListSearchTerm.toLowerCase())

      const matchesStatus = studentListStatusFilter === "all" || student.academicStatus === studentListStatusFilter
      const matchesModule = selectedStudentListModule === "all" || student.moduleCode === selectedStudentListModule
      const matchesGroup = selectedStudentListGroup === "all" || student.group === selectedStudentListGroup

      return matchesSearch && matchesStatus && matchesModule && matchesGroup
    })

    // These must align with the table badge mapping in `getStudentListStatusBadge`
    const firstTime = studentsInList.filter((s) => s.academicStatus === "First-time").length
    const probation = studentsInList.filter((s) => s.academicStatus === "Academic Warning").length
    const readmitted = studentsInList.filter((s) => s.academicStatus === "Repeating Grade").length
    const repeaters = studentsInList.filter((s) => s.academicStatus === "Repeating Subject").length
    const total = studentsInList.length

    return {
      probation,
      readmitted,
      repeaters: {
        // Breakdown is currently not displayed; keep structure for compatibility
        first: repeaters,
        second: 0,
        third: 0,
        fourth: 0,
      },
      firstTime,
      total,
    }
  }, [studentListSearchTerm, studentListStatusFilter, selectedStudentListModule, selectedStudentListGroup])

  const learnersListStats = calculateLearnersListStats

  // Filter students based on selected filters - only show the two specific students
  // Note: Students List is not affected by province, district, school, or subject filters
  const filteredStudents = useMemo(() => {
    return learnersListStudents.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())

      let matchesStatus = true
      if (statusFilter === "all") {
        matchesStatus = true
      } else if (statusFilter === "Subject Failed") {
        // Check if average assessment score < 50%
        const avgScore = (student.assessments.AS + student.assessments.CT + student.assessments.WR) / 3
        matchesStatus = avgScore < 50
      } else {
        matchesStatus = student.academicStatus === statusFilter
      }

      // Learners List ignores subject and location filters - only uses search and status
      return matchesSearch && matchesStatus
    })
  }, [learnersListStudents, searchTerm, statusFilter])

  // Filter students for Learner List (separate from Learners List) - uses mock data
  const filteredStudentList = useMemo(() => {
    return mockStudents.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(studentListSearchTerm.toLowerCase()) ||
        student.surname.toLowerCase().includes(studentListSearchTerm.toLowerCase()) ||
        student.studentNumber.toLowerCase().includes(studentListSearchTerm.toLowerCase())

      const matchesStatus = studentListStatusFilter === "all" || student.academicStatus === studentListStatusFilter
      const matchesModule = selectedStudentListModule === "all" || student.moduleCode === selectedStudentListModule
      const matchesGroup = selectedStudentListGroup === "all" || student.group === selectedStudentListGroup

      return matchesSearch && matchesStatus && matchesModule && matchesGroup
    })
  }, [studentListSearchTerm, studentListStatusFilter, selectedStudentListModule, selectedStudentListGroup])

  // Reset to page 1 when filters change (only search and status affect Learners List)
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  // Reset student list page when filters change
  useEffect(() => {
    setStudentListCurrentPage(1)
  }, [studentListSearchTerm, studentListStatusFilter, selectedStudentListModule, selectedStudentListGroup])

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

  // Calculate pagination for Learner List
  const studentListTotalPages = Math.ceil(filteredStudentList.length / studentListItemsPerPage)
  const studentListStartIndex = (studentListCurrentPage - 1) * studentListItemsPerPage
  const studentListEndIndex = studentListStartIndex + studentListItemsPerPage
  const paginatedStudentList = filteredStudentList.slice(studentListStartIndex, studentListEndIndex)

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push("ellipsis-start")
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end")
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  // Generate page numbers for Learner List pagination
  const getStudentListPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (studentListTotalPages <= maxVisible) {
      for (let i = 1; i <= studentListTotalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (studentListCurrentPage > 3) {
        pages.push("ellipsis-start")
      }

      const start = Math.max(2, studentListCurrentPage - 1)
      const end = Math.min(studentListTotalPages - 1, studentListCurrentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (studentListCurrentPage < studentListTotalPages - 2) {
        pages.push("ellipsis-end")
      }

      pages.push(studentListTotalPages)
    }

    return pages
  }

  const handleSelectStudent = (studentId: number, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId])
    } else {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map((s) => s.id))
    } else {
      setSelectedStudents([])
    }
  }

  const handleSelectStudentListStudent = (studentId: number, checked: boolean) => {
    if (checked) {
      setSelectedStudentListStudents([...selectedStudentListStudents, studentId])
    } else {
      setSelectedStudentListStudents(selectedStudentListStudents.filter((id) => id !== studentId))
    }
  }

  const handleSelectAllStudentList = (checked: boolean) => {
    if (checked) {
      setSelectedStudentListStudents(filteredStudentList.map((s) => s.id))
    } else {
      setSelectedStudentListStudents([])
    }
  }

  const getStatusBadge = (student: Learner) => {
    // Check if student has "Subject Failed" status (average assessment < 50%)
    const avgScore = (student.assessments.AS + student.assessments.CT + student.assessments.WR) / 3
    if (avgScore < 50) {
      return <Badge variant="destructive">Subject Failed</Badge>
    }

    switch (student.academicStatus) {
      case "Academic Warning":
        return <Badge variant="destructive">Academic recommends/comments</Badge>
      case "Repeating Grade":
        return <Badge variant="secondary">Repeating Grade</Badge>
      case "Repeating Subject":
        return <Badge variant="outline">Repeating Subject</Badge>
      case "First-time":
        return <Badge variant="default">New Registrant</Badge>
      default:
        return <Badge variant="outline">{student.academicStatus}</Badge>
    }
  }

  const getStudentListStatusBadge = (status: AcademicStatus) => {
    switch (status) {
      case "Academic Warning":
        return <Badge variant="destructive">Probation</Badge>
      case "Repeating Grade":
        return <Badge variant="secondary">Re-admitted</Badge>
      case "Repeating Subject":
        return <Badge variant="outline">Repeater(x1)</Badge>
      case "First-time":
        return <Badge variant="default">New Registrant</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleStatClick = (statType: string) => {
    switch (statType) {
      case "academicRecommends":
        // Filter to show students who need recommendations
        setStatusFilter("all")
        // Could add additional filtering logic here if needed
        break
      case "subjectFailed":
        // Filter to show students who failed
        setStatusFilter("Subject Failed")
        break
      case "repeaters":
        setStatusFilter("Repeating Subject")
        break
      case "newLearners":
        setStatusFilter("First-time")
        break
      case "probation":
        setStatusFilter("Academic Warning")
        break
      case "readmitted":
        setStatusFilter("Repeating Grade")
        break
      case "repeater":
        setStatusFilter("Repeating Subject")
        break
      case "firstTime":
        setStatusFilter("First-time")
        break
      default:
        setStatusFilter("all")
    }
  }

  // Handler for Learner List stats (used by the stats grid above Learners List)
  const handleStudentListStatClick = (statType: string) => {
    switch (statType) {
      case "probation":
        setStudentListStatusFilter("Academic Warning")
        break
      case "readmitted":
        setStudentListStatusFilter("Repeating Grade")
        break
      case "repeater":
        setStudentListStatusFilter("Repeating Subject")
        break
      case "firstTime":
        setStudentListStatusFilter("First-time")
        break
      default:
        setStudentListStatusFilter("all")
    }
  }



  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-background">
      <AppHeader title="Students List" subtitle="Manage your students and track their progress" />

      {/* //   <Card className="border bg-card rounded-2xl overflow-hidden">
//   <CardHeader className="bg-muted/50 border-b">
//     <div className="flex items-center justify-between">
//       <div>
  
//         <CardTitle className="text-xl font-semibold mt-4">
//           Subject Summary - {currentSubject ? currentSubject.code : "All Subjects"}
//         </CardTitle>
//         <CardDescription>Statistics for {currentSubject ? currentSubject.name : "all subjects"}</CardDescription>
//       </div>
//       <div className="flex flex-wrap gap-4">
//         <Select value={selectedProvince} onValueChange={setSelectedProvince}>
//           <SelectTrigger className="w-[220px] h-12">
//             <SelectValue placeholder="Select province" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Provinces</SelectItem>
//             {SOUTH_AFRICAN_PROVINCES.map((province) => (
//               <SelectItem key={province.id} value={province.id}>
//                 {province.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         <Select
//           value={selectedDistrict}
//           onValueChange={setSelectedDistrict}
//           disabled={selectedProvince === "all"}
//         >
//           <SelectTrigger className="w-[220px] h-12">
//             <SelectValue placeholder={selectedProvince === "all" ? "Select province first" : "Select district"} />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Districts</SelectItem>
//             {availableDistricts.map((district) => (
//               <SelectItem key={district.id} value={district.id}>
//                 {district.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         <Select
//           value={selectedSchool}
//           onValueChange={setSelectedSchool}
//           disabled={selectedDistrict === "all" && selectedProvince === "all"}
//         >
//           <SelectTrigger className="w-[280px] h-12">
//             <SelectValue
//               placeholder={
//                 selectedDistrict === "all" && selectedProvince === "all"
//                   ? "Select district first"
//                   : "Select school"
//               }
//             />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Schools</SelectItem>
//             {availableSchools.map((school) => (
//               <SelectItem key={school.id} value={school.id}>
//                 {school.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         <Select value={selectedSubject} onValueChange={setSelectedSubject}>
//           <SelectTrigger className="w-[280px] h-12">
//             <SelectValue placeholder="Select subject" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Subjects</SelectItem>
//             {mockSubjects.map((subject) => (
//               <SelectItem key={subject.id} value={subject.code}>
//                 {subject.code} - {subject.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//     </div>
//   </CardHeader>
// </Card> */}

      {/* // <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      //   <Card className="cursor-pointer transition-colors hover:bg-muted" onClick={() => handleStatClick("academicRecommends")}>
      //     <CardContent className="p-4">
      //       <div className="flex items-center justify-between mb-2">
      //         <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
      //           <FileText className="h-5 w-5" />
      //         </div>
      //         <div className="text-right">
      //           <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Academic Recommends</div>
      //           <div className="text-2xl font-bold">{currentStats.academicRecommends}</div>
      //         </div>
      //       </div>
      //       <div className="text-xs text-muted-foreground">Needs recommendations</div>
      //     </CardContent>
      //   </Card>

      //   <Card className="cursor-pointer transition-colors hover:bg-muted" onClick={() => handleStatClick("subjectFailed")}>
      //     <CardContent className="p-4">
      //       <div className="flex items-center justify-between mb-2">
      //         <div className="p-2 rounded-full bg-destructive/10 text-destructive">
      //           <UserX className="h-5 w-5" />
      //         </div>
      //         <div className="text-right">
      //           <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subject Failed</div>
      //           <div className="text-2xl font-bold">{currentStats.subjectFailed}</div>
      //         </div>
      //       </div>
      //       <div className="text-xs text-muted-foreground">Below 50% average</div>
      //     </CardContent>
      //   </Card>

      //   <Card className="cursor-pointer transition-colors hover:bg-muted" onClick={() => handleStatClick("repeaters")}>
      //     <CardContent className="p-4">
      //       <div className="flex items-center justify-between mb-2">
      //         <div className="p-2 rounded-full bg-secondary/10 text-secondary-foreground">
      //           <RotateCcw className="h-5 w-5" />
      //         </div>
      //         <div className="text-right">
      //           <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Repeaters</div>
      //           <div className="text-2xl font-bold">{currentStats.repeaters}</div>
      //         </div>
      //       </div>
      //       <div className="text-xs text-muted-foreground">Repeating subject</div>
      //     </CardContent>
      //   </Card>

      //   <Card className="cursor-pointer transition-colors hover:bg-muted" onClick={() => handleStatClick("newLearners")}>
      //     <CardContent className="p-4">
      //       <div className="flex items-center justify-between mb-2">
      //         <div className="p-2 rounded-full bg-primary/10 text-primary">
      //           <Users className="h-5 w-5" />
      //         </div>
      //         <div className="text-right">
      //           <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">New</div>
      //           <div className="text-2xl font-bold">{currentStats.newLearners}</div>
      //         </div>
      //       </div>
      //       <div className="text-xs text-muted-foreground">New registrants</div>
      //     </CardContent>
      //   </Card>

      //   <Card>
      //     <CardContent className="p-4">
      //       <div className="flex items-center justify-between mb-2">
      //         <div className="p-2 rounded-full bg-muted text-muted-foreground">
      //           <Users className="h-5 w-5" />
      //         </div>
      //         <div className="text-right">
      //           <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Students</div>
      //           <div className="text-2xl font-bold">{currentStats.totalLearners}</div>
      //         </div>
      //       </div>
      //       <div className="text-xs text-muted-foreground">New + Repeaters</div>
      //     </CardContent>
      //   </Card>
      // </div> */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card
          className="cursor-pointer transition-colors hover:bg-muted"
          onClick={() => handleStudentListStatClick("probation")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-full bg-destructive/10 text-destructive">
                <UserX className="h-5 w-5" />
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Probation
                </div>
                <div className="text-2xl font-bold">{learnersListStats.probation}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-colors hover:bg-muted"
          onClick={() => handleStudentListStatClick("readmitted")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Re-admitted
                </div>
                <div className="text-2xl font-bold">{learnersListStats.readmitted}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-colors hover:bg-muted"
          onClick={() => handleStudentListStatClick("repeater")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-full bg-secondary/10 text-secondary-foreground">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Repeaters
                </div>
                <div className="text-2xl font-bold">
                  {learnersListStats.repeaters.first +
                    learnersListStats.repeaters.second +
                    learnersListStats.repeaters.third +
                    learnersListStats.repeaters.fourth}
                </div>
              </div>
            </div>
            {/* <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>1st:</span>
                <span>{learnersListStats.repeaters.first}</span>
              </div>
              <div className="flex justify-between">
                <span>2nd:</span>
                <span>{learnersListStats.repeaters.second}</span>
              </div>
              <div className="flex justify-between">
                <span>3rd:</span>
                <span>{learnersListStats.repeaters.third}</span>
              </div>
              <div className="flex justify-between">
                <span>4th:</span>
                <span>{learnersListStats.repeaters.fourth}</span>
              </div>
            </div> */}
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-colors hover:bg-muted"
          onClick={() => handleStudentListStatClick("firstTime")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  First Time
                </div>
                <div className="text-2xl font-bold">{learnersListStats.firstTime}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">New registrants</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-full bg-muted text-muted-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Total Registered
                </div>
                <div className="text-2xl font-bold">{learnersListStats.total}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">All students</div>
          </CardContent>
        </Card>
      </div>


      {/* Student List */}
      <Card className="border bg-card rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Students List</CardTitle>
              <CardDescription>Manage and communicate with your students</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {selectedStudentListStudents.length > 0 && (
                <>
                  <Button
                    onClick={() => setShowStudentListSendMessage(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button onClick={() => setShowStudentListSendRiskNote(true)} variant="destructive" className="shadow-sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Send Risk Note
                  </Button>
                </>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={studentListSearchTerm}
                onChange={(e) => setStudentListSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={selectedStudentListModule} onValueChange={setSelectedStudentListModule}>
              <SelectTrigger className="w-[280px] h-12">
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {mockModules.map((module) => (
                  <SelectItem key={module.id} value={module.code}>
                    {module.code} - {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStudentListGroup} onValueChange={setSelectedStudentListGroup}>
              <SelectTrigger className="w-[200px] h-12">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {mockGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={studentListStatusFilter} onValueChange={setStudentListStatusFilter}>
              <SelectTrigger className="w-[200px] h-12">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="First-time">First-time</SelectItem>
                <SelectItem value="Academic Warning">Probation</SelectItem>
                <SelectItem value="Repeating Grade">Re-admitted</SelectItem>
                <SelectItem value="Repeating Subject">Repeater(x1)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="w-12 font-semibold">
                    <Checkbox
                      checked={selectedStudentListStudents.length === filteredStudentList.length && filteredStudentList.length > 0}
                      onCheckedChange={handleSelectAllStudentList}
                    />
                  </TableHead>
                  <TableHead className="font-semibold">Student Number</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Academic Status</TableHead>
                  <TableHead className="font-semibold">Registered Modules</TableHead>
                  <TableHead className="font-semibold">Supported Modules</TableHead>
                  <TableHead className="font-semibold">Department Modules</TableHead>
                  <TableHead className="font-semibold">Assessments</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudentList.map((student, index) => (
                  <TableRow
                    key={student.id}
                    className={`transition-colors ${index % 2 === 0 ? "bg-muted/30" : "bg-background"}`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedStudentListStudents.includes(student.id)}
                        onCheckedChange={(checked) => handleSelectStudentListStudent(student.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-semibold">{student.studentNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {student.name.charAt(0)}
                          {student.surname.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {student.name} {student.surname}
                          </div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStudentListStatusBadge(student.academicStatus)}
                      {student.academicStatus === "Academic Warning" && student.id === 9 && (
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                          HEDS
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg">
                        {Math.min(7, Math.max(3, (student.previousModules?.length || 0) + 1))}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-muted text-foreground rounded-lg">
                        {Math.max(1, student.assessments.AS > 60 ? Math.min(5, Math.floor((student.assessments.AS - 60) / 10) + 1) : 1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-muted text-foreground rounded-lg">
                        {Math.max(1, (student.previousModules?.filter((m) => m.startsWith("CS") || m.startsWith("ENG")).length || 0) + 1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-3 text-sm font-medium">
                        <span className="px-2 py-1 bg-muted text-foreground rounded-lg">AS: {student.assessments.AS}</span>
                        <span className="px-2 py-1 bg-muted text-foreground rounded-lg">CT: {student.assessments.CT}</span>
                        <span className="px-2 py-1 bg-muted text-foreground rounded-lg">WR: {student.assessments.WR}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/students/${student.id}`} className="flex w-full">
                              View Student Report
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuItem>Send Risk Note</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredStudentList.length > 0 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Showing {studentListStartIndex + 1} to {Math.min(studentListEndIndex, filteredStudentList.length)} of {filteredStudentList.length} students
                </p>
                <Select
                  value={studentListItemsPerPage.toString()}
                  onValueChange={(value) => {
                    setStudentListItemsPerPage(Number(value))
                    setStudentListCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (studentListCurrentPage > 1) setStudentListCurrentPage(studentListCurrentPage - 1)
                      }}
                      className={studentListCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {getStudentListPageNumbers().map((page, index) => {
                    if (page === "ellipsis-start" || page === "ellipsis-end") {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setStudentListCurrentPage(page as number)
                          }}
                          isActive={studentListCurrentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (studentListCurrentPage < studentListTotalPages) setStudentListCurrentPage(studentListCurrentPage + 1)
                      }}
                      className={studentListCurrentPage === studentListTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SendMessageDialog
        open={showSendMessage}
        onOpenChange={setShowSendMessage}
        selectedStudents={selectedStudents.map((id) => filteredStudents.find((s) => s.id === id)!).filter(Boolean)}
      />
      <SendRiskNoteDialog
        open={showSendRiskNote}
        onOpenChange={setShowSendRiskNote}
        selectedStudents={selectedStudents.map((id) => filteredStudents.find((s) => s.id === id)!).filter(Boolean)}
      />
      <SendMessageDialog
        open={showStudentListSendMessage}
        onOpenChange={setShowStudentListSendMessage}
        selectedStudents={selectedStudentListStudents.map((id) => filteredStudentList.find((s) => s.id === id)!).filter(Boolean)}
      />
      <SendRiskNoteDialog
        open={showStudentListSendRiskNote}
        onOpenChange={setShowStudentListSendRiskNote}
        selectedStudents={selectedStudentListStudents.map((id) => filteredStudentList.find((s) => s.id === id)!).filter(Boolean)}
      />
    </div>
  )
}
