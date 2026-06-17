import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, HelpCircle, BookOpen } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function ResourcesSection() {
  return (
    <section id="resources" className="py-20 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Resources</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to understand how iPASS can transform your institution.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-16">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-6">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Proposal Document</h3>
              <p className="text-muted-foreground mb-6">
                Comprehensive overview of iPASS features, implementation, and pricing.
              </p>
              <Button variant="outline" className="w-full bg-transparent">
                Download PDF
              </Button>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary/10 mx-auto mb-6">
                <FileText className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Case Studies</h3>
              <p className="text-muted-foreground mb-6">Real-world success stories from institutions using iPASS.</p>
              <Button variant="outline" className="w-full bg-transparent">
                View Case Studies
              </Button>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-accent/10 mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Implementation Guide</h3>
              <p className="text-muted-foreground mb-6">Step-by-step guide to integrating iPASS with your systems.</p>
              <Button variant="outline" className="w-full bg-transparent">
                Download Guide
              </Button>
            </Card>
          </div>

          <Card className="p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Frequently Asked Questions</h3>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How does iPASS integrate with existing student information systems?</AccordionTrigger>
                <AccordionContent>
                  iPASS offers flexible integration options including REST APIs, CSV imports, and direct database
                  connections. Our implementation team works with your IT department to ensure seamless data flow from
                  your existing systems while maintaining data security and privacy standards.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>What kind of training is provided for staff?</AccordionTrigger>
                <AccordionContent>
                  We provide comprehensive training including live workshops, video tutorials, and ongoing support.
                  Training is customized for different user roles (administrators, faculty, support staff) and includes
                  hands-on practice with the system before go-live.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>How long does implementation typically take?</AccordionTrigger>
                <AccordionContent>
                  Implementation timelines vary based on institution size and complexity, but typically range from 6-12
                  weeks. This includes system configuration, data migration, integration setup, staff training, and
                  pilot testing before full deployment.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>What data security measures are in place?</AccordionTrigger>
                <AccordionContent>
                  iPASS employs enterprise-grade security including end-to-end encryption, role-based access controls,
                  regular security audits, and compliance with FERPA, GDPR, and other relevant data protection
                  regulations. All data is stored in secure, redundant cloud infrastructure with regular backups.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>Can iPASS be customized for our institution's specific needs?</AccordionTrigger>
                <AccordionContent>
                  Yes, iPASS is highly configurable. You can customize dashboards, reports, risk indicators,
                  intervention workflows, and notification settings to match your institution's policies and procedures.
                  Our team works with you to configure the system to your specific requirements.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>What kind of ongoing support is available?</AccordionTrigger>
                <AccordionContent>
                  We provide 24/7 technical support, regular system updates, quarterly training refreshers, and a
                  dedicated account manager. You'll also have access to our knowledge base, user community, and regular
                  webinars on best practices and new features.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>
      </div>
    </section>
  )
}
