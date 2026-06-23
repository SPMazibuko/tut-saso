"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { StudentViewLayout } from "@/components/student-view/student-view-layout"
import { User, Mail, GraduationCap, Globe, Save, Hash, MapPin } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getStudentDashboardSummary, getStudentViewModules, STUDENT_QUALIFICATION_OPTIONS, saveStudentEnrollment, getDepartmentForQualification, getStudentEnrollment } from "@/lib/student-view-data"

export default function StudentProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentNumber: "",
    qualification: "DPIF20",
    campus: "Soshanguve (South)",
    yearOfStudy: "2",
    language: "en",
  })

  const modules = getStudentViewModules()
  const summary = getStudentDashboardSummary(modules)

  useEffect(() => {
    const current = getCurrentUser()
    const enrollment = getStudentEnrollment()
    if (current) {
      setUser(current)
      setFormData((prev) => ({
        ...prev,
        name: current.name || "",
        email: current.email || "",
        studentNumber: `221234${String(current.id ?? "001").padStart(3, "0")}`,
        qualification: enrollment.qualificationCode,
        campus: enrollment.campus
          .toLowerCase()
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
      }))
    }
  }, [])

  const handleSave = () => {
    if (!user) return
    const updatedUser = { ...user, name: formData.name, email: formData.email }
    localStorage.setItem("ipass_auth_user", JSON.stringify(updatedUser))
    saveStudentEnrollment(formData.qualification, formData.campus)
    setUser(updatedUser)
  }

  if (!user) return null

  const initials = formData.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <StudentViewLayout>
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Student Profile</h1>
          <p className="text-muted-foreground">Your institutional student record and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{formData.name}</h3>
                <p className="text-muted-foreground">{formData.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary">Student</Badge>
                  <Badge variant="outline">{formData.studentNumber}</Badge>
                  <Badge variant="outline">{summary.academicStanding}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your contact and preference details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Institutional Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Student Number
              </Label>
              <Input value={formData.studentNumber} disabled />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Qualification
              </Label>
              <Select
                value={formData.qualification}
                onValueChange={(value) => setFormData({ ...formData, qualification: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STUDENT_QUALIFICATION_OPTIONS.map((q) => (
                    <SelectItem key={q.code} value={q.code}>
                      {q.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Department: {getDepartmentForQualification(formData.qualification)}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Campus
              </Label>
              <Select value={formData.campus} onValueChange={(value) => setFormData({ ...formData, campus: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soshanguve (South)">Soshanguve (South)</SelectItem>
                  <SelectItem value="Soshanguve (North)">Soshanguve (North)</SelectItem>
                  <SelectItem value="Polokwane">Polokwane</SelectItem>
                  <SelectItem value="eMalahleni">eMalahleni</SelectItem>
                  <SelectItem value="Mbombela">Mbombela</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Year of Study</Label>
              <Select
                value={formData.yearOfStudy}
                onValueChange={(value) => setFormData({ ...formData, yearOfStudy: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Year 1</SelectItem>
                  <SelectItem value="2">Year 2</SelectItem>
                  <SelectItem value="3">Year 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Preferred Language
              </Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zu">isiZulu</SelectItem>
                  <SelectItem value="xh">isiXhosa</SelectItem>
                  <SelectItem value="af">Afrikaans</SelectItem>
                  <SelectItem value="st">Sesotho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSave} className="w-full md:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Summary</CardTitle>
            <CardDescription>{summary.academicYear} academic year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-3xl font-bold text-primary">{summary.aps}</p>
                <p className="text-sm text-muted-foreground mt-1">APS Score</p>
              </div> */}
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-3xl font-bold">{summary.registeredModules}</p>
                <p className="text-sm text-muted-foreground mt-1">Modules</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-3xl font-bold">{summary.totalCredits}</p>
                <p className="text-sm text-muted-foreground mt-1">Credits</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-3xl font-bold">{summary.averageAttendance}%</p>
                <p className="text-sm text-muted-foreground mt-1">Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentViewLayout>
  )
}
