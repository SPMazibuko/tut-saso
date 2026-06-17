/**
 * Mock dataset for identified modules per department.
 * Used to derive counts for Modules Identified Per Department, Supported Modules Per Department,
 * and Identified Modules widgets. Also provides module metadata (lecturer, tutors) for drill-down dialogs.
 */

export type ModuleSupport = "solusi" | "department" | "none"

export interface MockStaff {
  id: string
  name: string
}

export interface MockIdentifiedModule {
  department: string
  moduleCode: string
  moduleName: string
  support: ModuleSupport
  lecturer: MockStaff
  tutors: MockStaff[]
  semester: 1 | 2
  year: number
}

/** South African–relevant module names per department (for mock data). */
const EDU_NAMES = [
  "Foundations of South African Schooling",
  "isiZulu in the Classroom",
  "NCS and CAPS Curriculum",
  "Life Orientation Pedagogy",
  "Multilingual Education in SA",
  "History Education",
  "African Languages Methodology",
  "Mathematics for FET",
  "Physical Sciences Education",
  "Early Childhood Development",
  "Inclusive Education in Diverse Classrooms",
  "Assessment and NQF",
  "Educational Technology",
  "School Leadership and Management",
  "Environmental Education",
  "Life Sciences Education",
  "Economic and Management Sciences",
  "Social Sciences Pedagogy",
  "Creative Arts Education",
  "Literacy and Numeracy Foundations",
]
const HUM_NAMES = [
  "South African History",
  "African Philosophy",
  "isiXhosa Literature",
  "Heritage and Identity",
  "Political Economy of SA",
  "Oral Traditions and Storytelling",
  "Gender and Society",
  "Urban Studies",
  "Cultural Studies",
  "Afrikaans Literature",
  "English in Africa",
  "Archaeology of Southern Africa",
  "Museum and Heritage Studies",
  "Media and Democracy",
  "Creative Writing",
]
const AGR_NAMES = [
  "Dryland Crop Production",
  "Livestock Management",
  "Soil Science",
  "Agricultural Economics",
  "Agribusiness in SA",
  "Rangeland Management",
  "Irrigation and Water Management",
  "Poultry Production",
  "Dairy Science",
  "Plant Pathology",
  "Agricultural Extension",
  "Farm Management",
  "Agricultural Policy",
  "Sustainable Agriculture",
  "Animal Nutrition",
]
const SCI_NAMES = [
  "Physics for Life Sciences",
  "Chemistry",
  "Mathematics",
  "Statistics",
  "Ecology and Conservation",
  "Geology of Southern Africa",
  "Biochemistry",
  "Microbiology",
  "Genetics",
  "Environmental Science",
  "Computational Methods",
  "Scientific Writing",
  "Data Science",
  "Biostatistics",
  "Marine Science",
  "Astronomy",
  "Materials Science",
  "Organic Chemistry",
  "Inorganic Chemistry",
  "Physics Laboratory",
  "Botany",
  "Zoology",
]
const HLT_NAMES = [
  "Primary Health Care",
  "Community Health",
  "Clinical Practice",
  "Nursing Ethics",
  "Public Health in SA",
  "Mental Health",
  "Maternal and Child Health",
  "Health Systems",
  "Epidemiology",
  "Pharmacology",
  "Anatomy and Physiology",
  "Pathophysiology",
  "Health Promotion",
  "Rural Health",
  "Occupational Health",
  "Nutrition",
  "Rehabilitation",
  "Health Informatics",
  "Medical Law",
  "Clinical Skills",
]
const MGT_NAMES = [
  "Business Management",
  "Strategic Management",
  "Human Resource Management",
  "Operations Management",
  "Entrepreneurship",
  "Project Management",
  "Organisational Behaviour",
  "Business Ethics",
  "Supply Chain Management",
  "Quality Management",
  "Leadership",
  "Change Management",
  "Risk Management",
  "Corporate Governance",
  "Small Business Management",
  "International Business",
  "Marketing Management",
  "Financial Management for Managers",
  "Research Methods",
  "Business Communication",
  "Negotiation",
  "Innovation Management",
  "Sustainability in Business",
  "Digital Business",
  "Business Law",
]
const ACC_NAMES = [
  "Financial Accounting",
  "Management Accounting",
  "Auditing",
  "Taxation in SA",
  "Corporate Reporting",
  "Public Sector Accounting",
  "Accounting Information Systems",
  "Forensic Accounting",
  "Financial Management",
  "Cost Accounting",
  "Ethics for Accountants",
  "Company Law",
  "Integrated Reporting",
  "Audit and Assurance",
  "Tax Planning",
  "Financial Analysis",
  "Budgeting",
  "Internal Audit",
  "Accounting Theory",
  "Sustainability Reporting",
]
const MKT_NAMES = [
  "Marketing Principles",
  "Consumer Behaviour",
  "Digital Marketing",
  "Brand Management",
  "Market Research",
  "Integrated Marketing Communications",
  "Retail Marketing",
  "Services Marketing",
  "International Marketing",
  "Marketing Strategy",
  "Social Media Marketing",
  "Public Relations",
  "Sales Management",
  "Marketing Analytics",
  "African Markets",
  "Rural Marketing",
  "Non-profit Marketing",
  "Marketing Ethics",
]
const MIS_NAMES = [
  "Information Systems",
  "Database Management",
  "Systems Analysis",
  "Business Intelligence",
  "IT Project Management",
  "Enterprise Systems",
  "Cybersecurity",
  "Cloud Computing",
  "Data Analytics",
  "Programming for Business",
  "Network Management",
  "E-commerce",
  "IT Governance",
  "Digital Innovation",
  "Web Development",
  "IT Strategy",
]
const THE_NAMES = [
  "Introduction to Theology",
  "Biblical Studies",
  "Systematic Theology",
  "Ethics and Society",
  "Church History",
  "Practical Theology",
  "African Theology",
  "Ecumenical Studies",
  "Pastoral Care",
  "Mission Studies",
  "Religious Education",
  "Theology and Development",
]
const CHP_NAMES = [
  "Chaplaincy and Care",
  "Religious Studies",
  "Spiritual Care",
  "Interfaith Dialogue",
  "Ethics in Ministry",
  "Counselling Skills",
  "Ritual and Worship",
  "Chaplaincy in Institutions",
]

export const mockIdentifiedModules: MockIdentifiedModule[] = [
  // Education (28 total: 12 SOLUSI, 8 department, 8 none)
  { department: "Education", moduleCode: "EDU101", moduleName: "Introduction to Education", support: "solusi", lecturer: { id: "L1", name: "Dr. Sarah Nkosi" }, tutors: [{ id: "T1", name: "Ms. Thandi Moyo" }, { id: "T2", name: "Mr. James Dube" }], semester: 1, year: 2025 },
  { department: "Education", moduleCode: "EDU102", moduleName: "Curriculum Development", support: "solusi", lecturer: { id: "L1", name: "Dr. Sarah Nkosi" }, tutors: [{ id: "T1", name: "Ms. Thandi Moyo" }], semester: 1, year: 2025 },
  { department: "Education", moduleCode: "EDU201", moduleName: "Educational Psychology", support: "solusi", lecturer: { id: "L2", name: "Prof. Linda Khumalo" }, tutors: [{ id: "T3", name: "Mr. Peter Sithole" }], semester: 2, year: 2025 },
  { department: "Education", moduleCode: "EDU202", moduleName: "Assessment Methods", support: "solusi", lecturer: { id: "L2", name: "Prof. Linda Khumalo" }, tutors: [], semester: 2, year: 2025 },
  { department: "Education", moduleCode: "EDU103", moduleName: "Classroom Management", support: "department", lecturer: { id: "L3", name: "Dr. David Molefe" }, tutors: [{ id: "T4", name: "Ms. Zanele Ndlovu" }], semester: 1, year: 2025 },
  { department: "Education", moduleCode: "EDU104", moduleName: "Inclusive Education", support: "department", lecturer: { id: "L3", name: "Dr. David Molefe" }, tutors: [], semester: 1, year: 2025 },
  { department: "Education", moduleCode: "EDU105", moduleName: "Language in Education", support: "none", lecturer: { id: "L4", name: "Ms. Nomvula Zulu" }, tutors: [], semester: 1, year: 2025 },
  { department: "Education", moduleCode: "EDU106", moduleName: "Mathematics Education", support: "none", lecturer: { id: "L4", name: "Ms. Nomvula Zulu" }, tutors: [], semester: 1, year: 2025 },
  ...Array.from({ length: 20 }, (_, i) => {
    const supports: ModuleSupport[] = ["solusi", "solusi", "department", "department", "none"]
    const support = supports[i % 5]
    return {
      department: "Education",
      moduleCode: `EDU${107 + i}`,
      moduleName: EDU_NAMES[i % EDU_NAMES.length],
      support,
      lecturer: { id: `L${(i % 4) + 1}`, name: ["Dr. Sarah Nkosi", "Prof. Linda Khumalo", "Dr. David Molefe", "Ms. Nomvula Zulu"][i % 4] },
      tutors: i % 2 === 0 ? [{ id: `T${(i % 4) + 1}`, name: "Tutor A" }] : [],
      semester: (i % 2) + 1 as 1 | 2,
      year: 2025,
    } as MockIdentifiedModule
  }),
  // Humanities (18 total: 8 SOLUSI, 5 department, 5 none)
  { department: "Humanities", moduleCode: "HUM101", moduleName: "Introduction to Humanities", support: "solusi", lecturer: { id: "L5", name: "Dr. Anna Pretorius" }, tutors: [{ id: "T5", name: "Mr. Sipho Nkosi" }], semester: 1, year: 2025 },
  { department: "Humanities", moduleCode: "HUM102", moduleName: "African Literature", support: "solusi", lecturer: { id: "L5", name: "Dr. Anna Pretorius" }, tutors: [], semester: 1, year: 2025 },
  { department: "Humanities", moduleCode: "HUM201", moduleName: "History of Ideas", support: "department", lecturer: { id: "L6", name: "Prof. John Van Wyk" }, tutors: [{ id: "T6", name: "Ms. Lerato Mthembu" }], semester: 2, year: 2025 },
  { department: "Humanities", moduleCode: "HUM202", moduleName: "Philosophy", support: "none", lecturer: { id: "L6", name: "Prof. John Van Wyk" }, tutors: [], semester: 2, year: 2025 },
  ...Array.from({ length: 14 }, (_, i) => {
    const supports: ModuleSupport[] = ["solusi", "solusi", "department", "none", "none"]
    return {
      department: "Humanities",
      moduleCode: `HUM${300 + i}`,
      moduleName: HUM_NAMES[i % HUM_NAMES.length],
      support: supports[i % 5],
      lecturer: { id: i % 2 === 0 ? "L5" : "L6", name: i % 2 === 0 ? "Dr. Anna Pretorius" : "Prof. John Van Wyk" },
      tutors: i % 3 === 0 ? [{ id: `T${i + 5}`, name: "Tutor" }] : [],
      semester: (i % 2) + 1 as 1 | 2,
      year: 2025,
    } as MockIdentifiedModule
  }),
  // Agriculture (15)
  ...Array.from({ length: 15 }, (_, i) => {
    const supports: ModuleSupport[] = ["solusi", "solusi", "department", "none", "none"]
    return {
      department: "Agriculture",
      moduleCode: `AGR${100 + i}`,
      moduleName: AGR_NAMES[i % AGR_NAMES.length],
      support: supports[i % 5],
      lecturer: { id: "L7", name: "Dr. Agri Moyo" },
      tutors: i % 2 === 0 ? [{ id: "T7", name: "Tutor Agri" }] : [],
      semester: (i % 2) + 1 as 1 | 2,
      year: 2025,
    } as MockIdentifiedModule
  }),
  // Sciences (22)
  ...Array.from({ length: 22 }, (_, i) => {
    const supports: ModuleSupport[] = ["solusi", "solusi", "department", "department", "none", "none"]
    return {
      department: "Sciences",
      moduleCode: `SCI${100 + i}`,
      moduleName: SCI_NAMES[i % SCI_NAMES.length],
      support: supports[i % 6],
      lecturer: { id: i % 2 === 0 ? "L8" : "L9", name: i % 2 === 0 ? "Dr. Science One" : "Dr. Science Two" },
      tutors: i % 2 === 0 ? [{ id: `T${8 + i}`, name: "Lab Tutor" }] : [],
      semester: (i % 2) + 1 as 1 | 2,
      year: 2025,
    } as MockIdentifiedModule
  }),
  // Health Professions (20: 12 SOLUSI, 5 department, 3 none)
  ...Array.from({ length: 20 }, (_, i) => {
    const solusi = i < 12 ? "solusi" : i < 17 ? "department" : "none"
    return {
      department: "Health Professions",
      moduleCode: `HLT${100 + i}`,
      moduleName: HLT_NAMES[i % HLT_NAMES.length],
      support: solusi as ModuleSupport,
      lecturer: { id: "L10", name: "Dr. Health Mkhize" },
      tutors: i % 2 === 0 ? [{ id: "T10", name: "Clinical Tutor" }] : [],
      semester: (i % 2) + 1 as 1 | 2,
      year: 2025,
    } as MockIdentifiedModule
  }),
  // Management (25: 10 SOLUSI, 8 department, 7 none)
  ...Array.from({ length: 25 }, (_, i) => {
    const solusi = i < 10 ? "solusi" : i < 18 ? "department" : "none"
    return {
      department: "Management",
      moduleCode: `MGT${100 + i}`,
      moduleName: MGT_NAMES[i % MGT_NAMES.length],
      support: solusi as ModuleSupport,
      lecturer: { id: "L11", name: "Prof. Biz Manager" },
      tutors: i % 2 === 0 ? [{ id: "T11", name: "Case Tutor" }] : [],
      semester: (i % 2) + 1 as 1 | 2,
      year: 2025,
    } as MockIdentifiedModule
  }),
  // Accounting (20)
  ...Array.from({ length: 20 }, (_, i) => {
    const supports: ModuleSupport[] = ["solusi", "solusi", "department", "department", "none", "none"]
    return {
      department: "Accounting",
      moduleCode: `ACC${100 + i}`,
      moduleName: ACC_NAMES[i % ACC_NAMES.length],
      support: supports[i % 6],
      lecturer: { id: "L12", name: "Dr. Account Ndaba" },
      tutors: i % 2 === 0 ? [{ id: "T12", name: "Accounts Tutor" }] : [],
      semester: (i % 2) + 1 as 1 | 2,
      year: 2025,
    } as MockIdentifiedModule
  }),
  // Marketing (18)
  ...Array.from({ length: 18 }, (_, i) => {
    const supports: ModuleSupport[] = ["solusi", "department", "department", "none", "none", "none"]
    return {
      department: "Marketing",
      moduleCode: `MKT${100 + i}`,
      moduleName: MKT_NAMES[i % MKT_NAMES.length],
      support: supports[i % 6],
      lecturer: { id: "L13", name: "Dr. Market Singh" },
      tutors: i % 3 === 0 ? [{ id: "T13", name: "Marketing Tutor" }] : [],
      semester: (i % 2) + 1 as 1 | 2,
      year: 2025,
    } as MockIdentifiedModule
  }),
  // Management Information Systems (MIS) (16)
  ...Array.from({ length: 16 }, (_, i) => {
    const supports: ModuleSupport[] = ["solusi", "solusi", "department", "none", "none", "none"]
    return {
      department: "Management Information Systems (MIS)",
      moduleCode: `MIS${100 + i}`,
      moduleName: MIS_NAMES[i % MIS_NAMES.length],
      support: supports[i % 6],
      lecturer: { id: "L14", name: "Dr. Tech Patel" },
      tutors: i % 2 === 0 ? [{ id: "T14", name: "IT Tutor" }] : [],
      semester: (i % 2) + 1 as 1 | 2,
      year: 2025,
    } as MockIdentifiedModule
  }),
  // Theology (12)
  ...Array.from({ length: 12 }, (_, i) => {
    const supports: ModuleSupport[] = ["solusi", "solusi", "department", "department", "none", "none"]
    return {
      department: "Theology",
      moduleCode: `THE${100 + i}`,
      moduleName: THE_NAMES[i % THE_NAMES.length],
      support: supports[i % 6],
      lecturer: { id: "L15", name: "Rev. Theology Ngcobo" },
      tutors: i % 2 === 0 ? [{ id: "T15", name: "Theology Tutor" }] : [],
      semester: (i % 2) + 1 as 1 | 2,
      year: 2025,
    } as MockIdentifiedModule
  }),
  // Chaplaincy / Religious Studies (8)
  ...Array.from({ length: 8 }, (_, i) => {
    const supports: ModuleSupport[] = ["solusi", "solusi", "department", "department", "none", "none", "none", "none"]
    return {
      department: "Chaplaincy / Religious Studies",
      moduleCode: `CHP${100 + i}`,
      moduleName: CHP_NAMES[i % CHP_NAMES.length],
      support: supports[i % 8],
      lecturer: { id: "L16", name: "Rev. Chaplain Dlamini" },
      tutors: [],
      semester: (i % 2) + 1 as 1 | 2,
      year: 2025,
    } as MockIdentifiedModule
  }),
]

/** All departments that appear in the mock data (same order as dashboard). */
const DEPARTMENTS = [
  "Education",
  "Humanities",
  "Agriculture",
  "Sciences",
  "Health Professions",
  "Management",
  "Accounting",
  "Marketing",
  "Management Information Systems (MIS)",
  "Theology",
  "Chaplaincy / Religious Studies",
] as const

export interface ModulesPerDepartmentItem {
  name: string
  count: number
}

export interface ModuleBreakdownItem {
  supportedBySOLUSI: number
  supportedByDepartment: number
  notSupported: number
}

export interface IdentifiedModulesTotals {
  departmentModules: number
  supportedModules: number
  solusiModules: number
}

/** Count of modules per department (all modules). */
export function getModulesPerDepartment(): ModulesPerDepartmentItem[] {
  const counts = new Map<string, number>()
  for (const d of DEPARTMENTS) counts.set(d, 0)
  for (const m of mockIdentifiedModules) {
    counts.set(m.department, (counts.get(m.department) ?? 0) + 1)
  }
  return DEPARTMENTS.map((name) => ({ name, count: counts.get(name) ?? 0 }))
}

/** Count of supported modules (SOLUSI or department) per department; only departments with supported > 0. */
export function getSupportedModulesPerDepartment(): ModulesPerDepartmentItem[] {
  const counts = new Map<string, number>()
  for (const m of mockIdentifiedModules) {
    if (m.support === "solusi" || m.support === "department") {
      counts.set(m.department, (counts.get(m.department) ?? 0) + 1)
    }
  }
  return DEPARTMENTS.filter((d) => (counts.get(d) ?? 0) > 0).map((name) => ({ name, count: counts.get(name) ?? 0 }))
}

/** Per-department breakdown: SOLUSI / department / not supported counts. */
export function getModuleBreakdownByDepartment(department: string): ModuleBreakdownItem | undefined {
  const mods = mockIdentifiedModules.filter((m) => m.department === department)
  if (mods.length === 0) return undefined
  const supportedBySOLUSI = mods.filter((m) => m.support === "solusi").length
  const supportedByDepartment = mods.filter((m) => m.support === "department").length
  const notSupported = mods.filter((m) => m.support === "none").length
  return { supportedBySOLUSI, supportedByDepartment, notSupported }
}

/** Totals for Identified Modules widget. */
export function getIdentifiedModulesTotals(): IdentifiedModulesTotals {
  const departmentModules = mockIdentifiedModules.length
  const supportedModules = mockIdentifiedModules.filter((m) => m.support === "solusi" || m.support === "department").length
  const solusiModules = mockIdentifiedModules.filter((m) => m.support === "solusi").length
  return { departmentModules, supportedModules, solusiModules }
}

/** All modules for a department (for drill-down). */
export function getModulesByDepartment(department: string): MockIdentifiedModule[] {
  return mockIdentifiedModules.filter((m) => m.department === department)
}

/** Single module by department + code (for drill-down). */
export function getModuleByDepartmentAndCode(department: string, moduleCode: string): MockIdentifiedModule | undefined {
  return mockIdentifiedModules.find((m) => m.department === department && m.moduleCode === moduleCode)
}
