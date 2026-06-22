const GAMIFICATION_STORAGE_KEY = "tut_saso:student_gamification"

export interface GamificationStats {
  totalXp: number
  level: number
  streak: number
  quizzesCompleted: number
  circuitsBuilt: number
  badges: string[]
  completedQuizIds: string[]
  lastActiveDate: string | null
}

export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface ModuleQuiz {
  id: string
  moduleCode: string
  title: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  xpReward: number
  questions: QuizQuestion[]
}

const XP_PER_LEVEL = 500

function defaultStats(): GamificationStats {
  return {
    totalXp: 0,
    level: 1,
    streak: 0,
    quizzesCompleted: 0,
    circuitsBuilt: 0,
    badges: [],
    completedQuizIds: [],
    lastActiveDate: null,
  }
}

export function getGamificationStats(): GamificationStats {
  if (typeof window === "undefined") return defaultStats()
  try {
    const raw = localStorage.getItem(GAMIFICATION_STORAGE_KEY)
    if (!raw) return defaultStats()
    return { ...defaultStats(), ...JSON.parse(raw) }
  } catch {
    return defaultStats()
  }
}

function saveStats(stats: GamificationStats) {
  if (typeof window !== "undefined") {
    localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(stats))
  }
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function updateStreak(stats: GamificationStats): GamificationStats {
  const today = todayKey()
  if (stats.lastActiveDate === today) return stats

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`

  const streak = stats.lastActiveDate === yesterdayKey ? stats.streak + 1 : 1
  return { ...stats, streak, lastActiveDate: today }
}

function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

function xpToNextLevel(xp: number): { current: number; next: number; progress: number } {
  const level = levelFromXp(xp)
  const currentLevelXp = (level - 1) * XP_PER_LEVEL
  const nextLevelXp = level * XP_PER_LEVEL
  const progress = ((xp - currentLevelXp) / XP_PER_LEVEL) * 100
  return { current: xp - currentLevelXp, next: XP_PER_LEVEL, progress }
}

export function getXpProgress(xp: number) {
  return xpToNextLevel(xp)
}

export function addXp(amount: number, reason?: "quiz" | "circuit"): GamificationStats {
  let stats = updateStreak(getGamificationStats())
  stats.totalXp += amount
  stats.level = levelFromXp(stats.totalXp)

  if (reason === "quiz") stats.quizzesCompleted += 1
  if (reason === "circuit") stats.circuitsBuilt += 1

  if (stats.totalXp >= 500 && !stats.badges.includes("First Steps")) {
    stats.badges.push("First Steps")
  }
  if (stats.quizzesCompleted >= 3 && !stats.badges.includes("Quiz Master")) {
    stats.badges.push("Quiz Master")
  }
  if (stats.circuitsBuilt >= 1 && !stats.badges.includes("Circuit Builder")) {
    stats.badges.push("Circuit Builder")
  }
  if (stats.streak >= 7 && !stats.badges.includes("Streak Champion")) {
    stats.badges.push("Streak Champion")
  }

  saveStats(stats)
  return stats
}

export function completeQuiz(quizId: string, scorePercent: number, baseXp: number): GamificationStats {
  const stats = getGamificationStats()
  if (stats.completedQuizIds.includes(quizId)) return stats

  const bonus = scorePercent === 100 ? Math.round(baseXp * 0.25) : 0
  const earned = Math.round(baseXp * (scorePercent / 100)) + bonus

  let updated = addXp(earned, "quiz")
  updated = {
    ...updated,
    completedQuizIds: [...updated.completedQuizIds, quizId],
  }
  saveStats(updated)
  return updated
}

export function recordCircuitBuild(): GamificationStats {
  const stats = getGamificationStats()
  if (stats.circuitsBuilt > 0) return stats
  return addXp(150, "circuit")
}

export const MODULE_QUIZZES: ModuleQuiz[] = [
  {
    id: "quiz-ppa115d",
    moduleCode: "PPA115D",
    title: "Programming Fundamentals",
    description: "Variables, control structures and basic C syntax",
    difficulty: "Beginner",
    xpReward: 200,
    questions: [
      {
        id: "q1",
        prompt: "Which data type stores whole numbers in C?",
        options: ["float", "int", "char", "void"],
        correctIndex: 1,
        explanation: "int stores integer (whole number) values.",
      },
      {
        id: "q2",
        prompt: "What does the '++' operator do?",
        options: ["Adds two variables", "Increments by 1", "Compares values", "Declares a constant"],
        correctIndex: 1,
        explanation: "++ increments a variable by 1.",
      },
      {
        id: "q3",
        prompt: "Which loop runs at least once?",
        options: ["for", "while", "do-while", "if"],
        correctIndex: 2,
        explanation: "do-while evaluates the condition after the first iteration.",
      },
      {
        id: "q4",
        prompt: "What is the output of: printf(\"%d\", 3 + 4 * 2);",
        options: ["14", "11", "10", "7"],
        correctIndex: 1,
        explanation: "Multiplication has higher precedence: 4*2=8, then 3+8=11.",
      },
      {
        id: "q5",
        prompt: "Which keyword defines a function that returns no value?",
        options: ["int", "return", "void", "null"],
        correctIndex: 2,
        explanation: "void indicates no return value.",
      },
    ],
  },
  {
    id: "quiz-el1115d",
    moduleCode: "EL1115D",
    title: "Electronics & Circuits",
    description: "Ohm's law, components and basic circuit analysis",
    difficulty: "Beginner",
    xpReward: 200,
    questions: [
      {
        id: "q1",
        prompt: "Ohm's law states V = ?",
        options: ["I / R", "I × R", "R / I", "I + R"],
        correctIndex: 1,
        explanation: "Voltage equals current multiplied by resistance.",
      },
      {
        id: "q2",
        prompt: "What does a resistor primarily do?",
        options: ["Amplify signal", "Limit current", "Store charge", "Convert AC to DC"],
        correctIndex: 1,
        explanation: "Resistors limit current flow in a circuit.",
      },
      {
        id: "q3",
        prompt: "LED stands for:",
        options: ["Low Energy Device", "Light Emitting Diode", "Linear Electronic Driver", "Logic Enable Display"],
        correctIndex: 1,
        explanation: "LED = Light Emitting Diode.",
      },
      {
        id: "q4",
        prompt: "In a series circuit, current is:",
        options: ["Different in each component", "The same everywhere", "Zero", "Only at the source"],
        correctIndex: 1,
        explanation: "Series circuits share the same current through all components.",
      },
      {
        id: "q5",
        prompt: "A typical LED requires a ___ to prevent burnout.",
        options: ["Capacitor", "Inductor", "Current-limiting resistor", "Transformer"],
        correctIndex: 2,
        explanation: "A resistor limits current through the LED.",
      },
    ],
  },
  {
    id: "quiz-dba216d",
    moduleCode: "DBA216D",
    title: "Database Management",
    description: "SQL, normalization and relational database concepts",
    difficulty: "Intermediate",
    xpReward: 250,
    questions: [
      {
        id: "q1",
        prompt: "SQL stands for:",
        options: ["Structured Query Language", "Simple Question Logic", "System Quality Layer", "Standard Queue List"],
        correctIndex: 0,
        explanation: "SQL = Structured Query Language.",
      },
      {
        id: "q2",
        prompt: "Which clause filters rows in SQL?",
        options: ["SELECT", "WHERE", "GROUP BY", "ORDER BY"],
        correctIndex: 1,
        explanation: "WHERE filters rows before grouping or ordering.",
      },
      {
        id: "q3",
        prompt: "A primary key must be:",
        options: ["Nullable", "Unique and not null", "A foreign key", "Text only"],
        correctIndex: 1,
        explanation: "Primary keys uniquely identify rows and cannot be null.",
      },
      {
        id: "q4",
        prompt: "First normal form (1NF) requires:",
        options: ["No duplicate rows", "Atomic values in each cell", "No foreign keys", "Only two tables"],
        correctIndex: 1,
        explanation: "1NF means each cell contains a single atomic value.",
      },
      {
        id: "q5",
        prompt: "JOIN combines data from:",
        options: ["Multiple tables", "Multiple databases only", "Files on disk", "User sessions"],
        correctIndex: 0,
        explanation: "JOINs merge rows from two or more related tables.",
      },
    ],
  },
  {
    id: "quiz-cn1115d",
    moduleCode: "CN1115D",
    title: "Computer Networks",
    description: "OSI model, IP addressing and network protocols",
    difficulty: "Intermediate",
    xpReward: 250,
    questions: [
      {
        id: "q1",
        prompt: "How many layers are in the OSI model?",
        options: ["5", "6", "7", "8"],
        correctIndex: 2,
        explanation: "The OSI model has 7 layers.",
      },
      {
        id: "q2",
        prompt: "Which protocol is connectionless?",
        options: ["TCP", "UDP", "HTTP", "FTP"],
        correctIndex: 1,
        explanation: "UDP is connectionless; TCP is connection-oriented.",
      },
      {
        id: "q3",
        prompt: "An IPv4 address has how many bits?",
        options: ["16", "32", "64", "128"],
        correctIndex: 1,
        explanation: "IPv4 addresses are 32 bits (4 octets).",
      },
      {
        id: "q4",
        prompt: "Port 80 is typically used for:",
        options: ["Email", "HTTP", "DNS", "SSH"],
        correctIndex: 1,
        explanation: "Port 80 is the default HTTP port.",
      },
      {
        id: "q5",
        prompt: "A MAC address operates at which OSI layer?",
        options: ["Network", "Data Link", "Transport", "Application"],
        correctIndex: 1,
        explanation: "MAC addresses are used at Layer 2 (Data Link).",
      },
    ],
  },
  {
    id: "quiz-sya216d",
    moduleCode: "SYA216D",
    title: "System Analysis",
    description: "SDLC, requirements engineering and UML basics",
    difficulty: "Advanced",
    xpReward: 300,
    questions: [
      {
        id: "q1",
        prompt: "SDLC stands for:",
        options: ["Software Design Life Cycle", "Systems Development Life Cycle", "Standard Data Link Control", "Secure Development Layer Code"],
        correctIndex: 1,
        explanation: "SDLC = Systems/Software Development Life Cycle.",
      },
      {
        id: "q2",
        prompt: "Functional requirements describe:",
        options: ["System performance only", "What the system must do", "Hardware costs", "Team structure"],
        correctIndex: 1,
        explanation: "Functional requirements define system behaviour and features.",
      },
      {
        id: "q3",
        prompt: "A use case diagram shows:",
        options: ["Database schema", "Actor interactions with the system", "Network topology", "Memory allocation"],
        correctIndex: 1,
        explanation: "Use cases model interactions between actors and the system.",
      },
      {
        id: "q4",
        prompt: "Prototyping helps to:",
        options: ["Skip testing", "Validate requirements early", "Eliminate documentation", "Avoid user feedback"],
        correctIndex: 1,
        explanation: "Prototypes let stakeholders validate requirements before full build.",
      },
      {
        id: "q5",
        prompt: "Non-functional requirements include:",
        options: ["Login feature", "Report generation", "Performance and security", "Add student record"],
        correctIndex: 2,
        explanation: "Non-functional requirements cover quality attributes like performance and security.",
      },
    ],
  },
]

export function getQuizById(id: string): ModuleQuiz | undefined {
  return MODULE_QUIZZES.find((q) => q.id === id)
}

export function getQuizzesForDepartment(department: string): ModuleQuiz[] {
  const deptModules: Record<string, string[]> = {
    Informatics: ["SYA216D", "DBA216D", "BUA216D", "ITP316D"],
    "Computer Science": ["PPA115D", "ADS216D", "DTP216D", "IVE316D"],
    "Information Technology": ["CN1115D", "CNT316D", "WNE316D", "NMG316D"],
    "Computer Systems Engineering": ["EL1115D", "DP1216D", "CFA115D", "DE2F06D"],
  }

  const codes = deptModules[department] ?? deptModules["Informatics"]
  return MODULE_QUIZZES.filter((q) => codes.includes(q.moduleCode))
}
