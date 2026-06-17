"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getCurrentUser, logout } from "@/lib/auth"
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  ClipboardList,
  BarChart3,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen,
  Calendar,
  GraduationCap,
  MessageSquare,
  Network,
  Brain,
  Target,
  Search,
  TrendingUp,
  RefreshCw,
  Layers,
  ShieldAlert,
  UsersRound,
  ListFilter,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight } from "lucide-react"

const adminTeacherNavigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Modules Per Department", href: "/dashboard/modules-per-department", icon: Layers },
  { name: "Probation & Exclusion Analysis", href: "/dashboard/probation-exclusion-analysis", icon: ShieldAlert },
  { name: "Faculty Analysis", href: "/dashboard/faculty-analysis", icon: UsersRound },
  { name: "AI Overview", href: "/dashboard/ai-overview", icon: Search },
  { name: "Classlist", href: "/dashboard/students", icon: Users },
  { name: "Risk Detection", href: "/dashboard/risk", icon: AlertTriangle },
  { name: "Interventions", href: "/dashboard/interventions", icon: ClipboardList },
  // { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  // { name: "School Analysis", href: "/dashboard/school-analysis", icon: Building2 },
  { name: "Communications", href: "/dashboard/communications", icon: MessageSquare },
  { name: "AI Support", href: "/dashboard/ai-support", icon: Brain },

  // { name: "Governance", href: "/dashboard/governance", icon: Network },
  { name: "MEL Metrics", href: "/dashboard/mel-metrics", icon: Target },
  { name: "Schedule", href: "/dashboard/schedule", icon: Calendar },
  { name: "Attendance", href: "/dashboard/attendance", icon: UserCheck },
  // { name: "Models", href: "/dashboard/models", icon: BrainIcon },
  // { name: "Cohorts", href: "/dashboard/cohorts", icon: Users },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  //{ name: "Compliance", href: "/dashboard/compliance", icon: Scale },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const studentNavigation = [
  { name: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Subjects", href: "/dashboard/my-courses", icon: BookOpen },
  { name: "My Assignments", href: "/dashboard/my-assignments", icon: ClipboardList },
  { name: "My Attendance", href: "/dashboard/my-attendance", icon: Calendar },
  { name: "My Progress", href: "/dashboard/my-progress", icon: GraduationCap },
  { name: "Support Chat", href: "/dashboard/communications", icon: MessageSquare },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const navLinkBase =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"

const navLinkStyles = (isActive: boolean) =>
  isActive
    ? "bg-primary/10 text-primary shadow-sm border-l-[3px] border-l-primary pl-[calc(0.75rem+3px)] -ml-px"
    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground border-l-[3px] border-l-transparent pl-[calc(0.75rem+3px)] -ml-px"

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const user = getCurrentUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(pathname?.startsWith("/dashboard/students/analysis") || false)
  const [categoriesOpen, setCategoriesOpen] = useState(
    pathname?.startsWith("/dashboard/students/categories") || false
  )
  const [progressionOpen, setProgressionOpen] = useState(
    pathname?.startsWith("/dashboard/students/progression") ||
    pathname?.startsWith("/dashboard/students/stop-start") ||
    pathname?.startsWith("/dashboard/students/completion-forecast") || false
  )
  
  // Update analysisOpen when pathname changes
  useEffect(() => {
    setAnalysisOpen(pathname?.startsWith("/dashboard/students/analysis") || false)
  }, [pathname])

  useEffect(() => {
    setCategoriesOpen(pathname?.startsWith("/dashboard/students/categories") || false)
  }, [pathname])

  // Update progressionOpen when pathname changes
  useEffect(() => {
    setProgressionOpen(
      pathname?.startsWith("/dashboard/students/progression") ||
      pathname?.startsWith("/dashboard/students/stop-start") ||
      pathname?.startsWith("/dashboard/students/completion-forecast") || false
    )
  }, [pathname])

  const navigation = user?.role === "student" ? studentNavigation : adminTeacherNavigation

  const handleLogout = () => {
    logout()
    router.push("/select-role")
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden rounded-xl shadow-sm bg-card/95 backdrop-blur border"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 h-screen max-h-screen transform transition-all duration-300 ease-out lg:translate-x-0 lg:static",
          "bg-card/95 backdrop-blur-xl border-r border-border/50 lg:rounded-r-2xl lg:shadow-sm",
          mobileMenuOpen ? "translate-x-0 shadow-xl" : "-translate-x-full",
        )}
      >
        <div className="flex h-full max-h-screen flex-col overflow-hidden">
          {/* Logo */}
          <div className="flex h-14 items-center px-5 flex-shrink-0 border-b border-border/50">
            <span className="text-lg font-semibold tracking-tight text-foreground">SASO</span>
          </div>

          {/* User info */}
          <div className="p-4 flex-shrink-0">
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5 border border-transparent">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                {user?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex-1 space-y-0.5 p-3 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
                
                // Special handling for Students - add collapsible analysis submenu
                if (item.name === "Classlist" && user?.role !== "student") {
                  const isAnalysisActive = pathname?.startsWith("/dashboard/students/analysis")
                  const isProgressionActive =
                    pathname?.startsWith("/dashboard/students/progression") ||
                    pathname?.startsWith("/dashboard/students/stop-start") ||
                    pathname?.startsWith("/dashboard/students/completion-forecast")
                  return (
                    <div key={item.name} className="space-y-0.5">
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(navLinkBase, navLinkStyles(pathname === item.href))}
                      >
                        <item.icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
                        {item.name}
                      </Link>
                      <Link
                        href="/dashboard/students/categories"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          navLinkBase,
                          navLinkStyles(pathname === "/dashboard/students/categories"),
                          "ml-4 text-sm"
                        )}
                      >
                        <ListFilter className="h-4 w-4 shrink-0 opacity-70" />
                        Student Categories
                      </Link>
                      {/* <Collapsible open={analysisOpen} onOpenChange={setAnalysisOpen}>
                        <CollapsibleTrigger
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full",
                            isAnalysisActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          {analysisOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <BarChart3 className="h-5 w-5" />
                          Student Analysis
                        </CollapsibleTrigger>
                        <CollapsibleContent className="ml-4 space-y-1 mt-1">
                          <Link
                            href="/dashboard/students/analysis/demographics"
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              pathname === "/dashboard/students/analysis/demographics"
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            Demographics
                          </Link>
                          <Link
                            href="/dashboard/students/analysis/trends"
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              pathname === "/dashboard/students/analysis/trends"
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            Trends
                          </Link>
                      
                          <Link
                            href="/dashboard/students/analysis/early-warning"
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              pathname === "/dashboard/students/analysis/early-warning"
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            Early Warning
                          </Link>
                          <Link
                            href="/dashboard/students/analysis/interventions"
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              pathname === "/dashboard/students/analysis/interventions"
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            Interventions
                          </Link>
                        </CollapsibleContent>
                      </Collapsible> */}
                      <Collapsible open={progressionOpen} onOpenChange={setProgressionOpen}>
                        <CollapsibleTrigger
                          className={cn(
                            navLinkBase,
                            "w-full text-left pl-[calc(0.75rem+3px)] -ml-px border-l-[3px]",
                            isProgressionActive
                              ? "bg-primary/10 text-primary border-l-primary"
                              : "text-muted-foreground hover:bg-muted/80 hover:text-foreground border-l-transparent",
                          )}
                        >
                          {progressionOpen ? (
                            <ChevronDown className="h-4 w-4 shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0" />
                          )}
                          <TrendingUp className="h-[1.125rem] w-[1.125rem] shrink-0" />
                          Progression & Retention
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden">
                          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/50 pl-3 py-1">
                            <Link
                              href="/dashboard/students/progression"
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                                pathname === "/dashboard/students/progression"
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                              )}
                            >
                              <TrendingUp className="h-4 w-4 shrink-0 opacity-70" />
                              Progression
                            </Link>
                            <Link
                              href="/dashboard/students/stop-start"
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                                pathname === "/dashboard/students/stop-start"
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                              )}
                            >
                              <RefreshCw className="h-4 w-4 shrink-0 opacity-70" />
                              Stop-start & Exclusions
                            </Link>
                            <Link
                              href="/dashboard/students/completion-forecast"
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                                pathname === "/dashboard/students/completion-forecast"
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                              )}
                            >
                              <Target className="h-4 w-4 shrink-0 opacity-70" />
                              Completion Forecast
                            </Link>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )
                }
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(navLinkBase, navLinkStyles(isActive))}
                  >
                    <item.icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Footer: theme + logout */}
          <div className="border-t border-border/50 p-3 flex-shrink-0 space-y-1">
            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-[1.125rem] w-[1.125rem]" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden
        />
      )}
    </>
  )
}
