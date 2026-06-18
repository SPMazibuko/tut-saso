import { Card } from "@/components/ui/card"
import { Target, Users, TrendingUp } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">About SASO System</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              We integrate data, analytics, and academic support to create a comprehensive ecosystem that empowers
              institutions to make data-informed decisions and improve student outcomes.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-16">
            <Card className="p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To transform education through intelligent systems that predict challenges before they become barriers
                to success.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary/10 mx-auto mb-6">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                Empower schools and universities with tools for early intervention, ensuring every student receives the
                support they need.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-accent/10 mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Our Impact</h3>
              <p className="text-muted-foreground leading-relaxed">
                Improved retention rates, enhanced academic performance, and data-driven institutional planning across
                education sectors.
              </p>
            </Card>
          </div>

          <div className="bg-muted/50 rounded-lg p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Collaboration Across Education</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  SASO System bridges the gap between Student Affairs, Residence Life, Academic Departments, and Support
                  Services, creating a unified approach to student success.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our platform ensures that mentors, tutors, and lecturers work in harmony, with shared insights and
                  coordinated interventions that make a real difference.
                </p>
              </div>
              <div className="aspect-square rounded-lg bg-card flex items-center justify-center">
                <img
                  src="/diverse-group-of-educators-and-students-collaborat.jpg"
                  alt="Collaboration in Education"
                  className="rounded-lg w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
