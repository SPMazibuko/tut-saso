import { Card } from "@/components/ui/card"
import { AlertCircle, BarChart3, Target, Network, FileText, Users } from "lucide-react"

const features = [
  {
    icon: AlertCircle,
    title: "Early Risk Detection",
    description:
      "Continuously monitors attendance, participation, and academic trends to identify students who may need support before issues escalate.",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics Dashboard",
    description:
      "Provides visual reports and performance trends with actionable insights for educators and administrators.",
  },
  {
    icon: Target,
    title: "Proactive Intervention Management",
    description:
      "Tracks at-risk students and coordinates targeted support actions across departments and support services.",
  },
  {
    icon: Network,
    title: "Integrated Support Ecosystem",
    description:
      "Connects Student Affairs, Residence Life, Tutors, and Academic Departments for seamless collaboration.",
  },
  {
    icon: FileText,
    title: "Automated Reporting",
    description:
      "Generates evidence-based reports for institutional planning, accreditation, and continuous improvement.",
  },
  {
    icon: Users,
    title: "Mentorship & Tutorship Tools",
    description:
      "Ensures alignment between mentors, tutors, and lecturers with shared student insights and progress tracking.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Key Features</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools designed to support every aspect of student success, from early detection to
              coordinated intervention.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 mb-6">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
