import { Card } from "@/components/ui/card"
import { School, Building2, Users } from "lucide-react"

export function SolutionsSection() {
  return (
    <section id="solutions" className="py-20 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Solutions for Every Level</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              iPASS adapts to your institution's unique needs, whether you're managing a school, college, or university.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="p-8 lg:p-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 mb-6">
                <School className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Schools</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">●</span>
                  <span>Track student attendance and participation patterns across faculties</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">●</span>
                  <span>Identify learning gaps early with predictive analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">●</span>
                  <span>Coordinate parent-teacher-counselor communication</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">●</span>
                  <span>Generate reports for school improvement plans</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 lg:p-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary/10 mb-6">
                <Building2 className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Higher Education</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-secondary mt-1">●</span>
                  <span>Faculty dashboards with real-time student performance insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-secondary mt-1">●</span>
                  <span>Cross-departmental analytics for institutional planning</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-secondary mt-1">●</span>
                  <span>Integration with existing student information systems</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-secondary mt-1">●</span>
                  <span>Retention and graduation rate optimization tools</span>
                </li>
              </ul>
            </Card>
          </div>

          <Card className="mt-8 p-8 lg:p-10 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">Cross-Departmental Insights</h3>
                <p className="text-muted-foreground leading-relaxed">
                  iPASS breaks down silos by providing a unified view of student success across all departments. Student
                  Affairs, Academic Departments, Residence Life, and Support Services all work from the same data,
                  ensuring coordinated and effective interventions that truly support student success.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
