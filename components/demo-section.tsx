import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Play } from "lucide-react"

export function DemoSection() {
  return (
    <section id="demo" className="py-20 md:py-32 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">See iPASS in Action</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Experience how iPASS transforms student success through intelligent analytics and coordinated support.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <Card className="p-8">
              <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center mb-6 relative overflow-hidden">
                <img src="/video-player-interface-showing-educational-analyti.jpg" alt="iPASS Demo Video" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Button size="lg" className="rounded-full h-16 w-16 p-0">
                    <Play className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Demo</h3>
              <p className="text-muted-foreground">
                Watch how educators use iPASS to identify at-risk students, coordinate interventions, and track success
                metrics in real-time.
              </p>
            </Card>

            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6">Book a Live Demo</h3>
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john.doe@university.edu" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input id="institution" placeholder="University Name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="e.g., Dean, Director, Administrator" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea id="message" placeholder="Tell us about your institution's needs..." rows={4} />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Request Demo
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
