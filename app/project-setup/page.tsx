import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ShieldCheck,
  Lock,
  Cloud,
  Database,
  KeyRound,
  Network,
  Cog,
  Server,
  BarChart3,
  UploadCloud,
  FileDown,
} from "lucide-react";

import Image from "next/image";
import aws from "../../public/project-setup/aws.png";
import image1 from "../../public/project-setup/image1.webp";
import image2 from "../../public/project-setup/image2.png";

export const metadata: Metadata = {
  title: "Project Setup – iPASS Data Security Plan",
  description:
    "Single-page overview of the iPASS project setup and comprehensive data security plan across AWS, Next.js, Hasura, Cognito, IAM and RDS.",
};

export default function ProjectSetupPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/30">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">iPASS Project Setup</h1>
          <Link href="/" className="text-sm text-primary hover:underline">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">

        {/* Hero / Narrative intro with image collage */}
        <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-8 md:p-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Building iPASS: secure, serverless and analysis‑ready
            </h2>
            <p className="mt-3 text-muted-foreground">
              A modern stack on AWS with Next.js SSR, Hasura GraphQL and
              AWS-managed security services. This page tells the story from data
              ingress (SA‑SAMS) to secure storage, APIs and analytics.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#architecture"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90"
              >
                See the architecture
              </a>
              <a
                href="#pipeline"
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted/50"
              >
                SA‑SAMS pipeline
              </a>
              <a
                href="#security"
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted/50"
              >
                Security details
              </a>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {/* Replace src with your images under public/project-setup/ */}
            <img
              src="/aws.png"
              alt="AWS"
              className="h-32 w-full rounded-lg object-cover sm:h-40"
            />
            <img
              src="/image1.webp"
              alt="Serverless"
              className="h-32 w-full rounded-lg object-cover sm:h-40"
            />
            <img
              src="/image2.png"
              alt="Architecture diagram"
              className="h-32 w-full rounded-lg object-cover sm:h-40"
            />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <img src="/Screenshot 2025-10-30 at 07.19.15.png" alt="AWS" className="h-96 w-full rounded-lg object-cover sm:h-96" />
          </div>

        </section>

                {/* Acronyms */}
                <section className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Key acronyms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-md border p-3 text-sm">
                  <span className="font-medium text-foreground">JWT</span>: JSON
                  Web Token
                </div>
                <div className="rounded-md border p-3 text-sm">
                  <span className="font-medium text-foreground">IAM</span>:
                  Identity and Access Management
                </div>
                <div className="rounded-md border p-3 text-sm">
                  <span className="font-medium text-foreground">WAF</span>: Web
                  Application Firewall
                </div>
                <div className="rounded-md border p-3 text-sm">
                  <span className="font-medium text-foreground">VPC</span>:
                  Virtual Private Cloud
                </div>
                <div className="rounded-md border p-3 text-sm">
                  <span className="font-medium text-foreground">RDS</span>:
                  Relational Database Service
                </div>
                <div className="rounded-md border p-3 text-sm">
                  <span className="font-medium text-foreground">AWS</span>:
                  Amazon Web Services
                </div>
                <div className="rounded-md border p-3 text-sm">
                  <span className="font-medium text-foreground">API</span>:
                  Application Programming Interface
                </div>
                <div className="rounded-md border p-3 text-sm">
                  <span className="font-medium text-foreground">MFA</span>:
                  Multi‑Factor Authentication
                </div>
                <div className="rounded-md border p-3 text-sm">
                  <span className="font-medium text-foreground">SSR</span>:
                  Server‑Side Rendering
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stack at a glance */}
        <section className="mt-10" id="architecture">
          <Card>
            <CardHeader>
              <CardTitle>Stack at a glance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="justify-start gap-2 py-2 text-sm cursor-help"
                    >
                      <Server className="h-4 w-4" /> Next.js (SSR)
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    Server‑side rendered pages for faster first paint and
                    improved privacy. Sessions and sensitive logic run on the
                    server; client receives minimal data.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="justify-start gap-2 py-2 text-sm cursor-help"
                    >
                      <Cloud className="h-4 w-4" /> AWS Lambda & API Gateway
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    Scalable serverless compute with managed HTTP entry points.
                    Pay per request; zero idle capacity.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="justify-start gap-2 py-2 text-sm cursor-help"
                    >
                      <Database className="h-4 w-4" /> AWS RDS (PostgreSQL)
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    Managed PostgreSQL with automated backups, Multi‑AZ, KMS
                    encryption and point‑in‑time restore.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="justify-start gap-2 py-2 text-sm cursor-help"
                    >
                      <KeyRound className="h-4 w-4" /> AWS Cognito (Auth)
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    Hosted user pools with MFA and password policies. Issues
                    signed JWTs consumed by Hasura and SSR.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="justify-start gap-2 py-2 text-sm cursor-help"
                    >
                      <ShieldCheck className="h-4 w-4" /> IAM • WAF • Shield
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    Least‑privilege access control, web firewall protections and
                    managed DDoS mitigation at the edge.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="justify-start gap-2 py-2 text-sm cursor-help"
                    >
                      <Network className="h-4 w-4" /> VPC • Private Subnets
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    Isolated networking; databases and Lambdas run in private
                    subnets with controlled egress and SGs.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="justify-start gap-2 py-2 text-sm cursor-help"
                    >
                      <Cog className="h-4 w-4" /> Hasura GraphQL
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    Real‑time GraphQL over Postgres with row‑level RBAC,
                    allow‑lists and query caching.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="justify-start gap-2 py-2 text-sm cursor-help"
                    >
                      <BarChart3 className="h-4 w-4" /> Analytics & Dashboards
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    Role‑aware dashboards and reports; exports with
                    watermarking; subscriptions for near real‑time.
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Narrative: How the system works */}
        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>The story</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>
                iPASS turns raw education data into timely insight. Users
                authenticate securely, the app renders server-side for speed and
                privacy, and our GraphQL API serves the right data to the right
                role. The same platform powers dashboards, reports and automated
                interventions.
              </p>
              <p>
                The plan covers key areas including authentication, data
                storage, network security, API protection, and compliance
                considerations. These measures mitigate risks like unauthorized
                access, data breaches, and denial-of-service attacks while
                ensuring scalability in a serverless environment.
              </p>
              <ul className="mt-2 grid gap-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    1
                  </span>
                  <span>
                    <span className="font-medium text-foreground">
                      Sign in:
                    </span>{" "}
                    Users sign in via Cognito (MFA/JWT). SSR pages set secure
                    cookies only on the server.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    2
                  </span>
                  <span>
                    <span className="font-medium text-foreground">Query:</span>{" "}
                    Next.js calls Hasura with role-aware JWT. WAF shields the
                    GraphQL endpoint.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    3
                  </span>
                  <span>
                    <span className="font-medium text-foreground">Store:</span>{" "}
                    Data lives in RDS (encrypted via KMS), isolated in a VPC.
                    IAM enforces least‑privilege.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    4
                  </span>
                  <span>
                    <span className="font-medium text-foreground">
                      Observe:
                    </span>{" "}
                    CloudWatch and GuardDuty provide logs, alerts and anomaly
                    detection.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Architecture Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">
                    Frontend/Backend
                  </span>
                  : Next.js SSR handles dynamic rendering and API calls with
                  secure session management and server-side data fetching.
                </li>
                <li>
                  <span className="font-medium text-foreground">API Layer</span>
                  : Hasura provides a GraphQL engine for real-time queries and
                  mutations backed by AWS RDS (PostgreSQL).
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Deployment
                  </span>
                  : Serverless on AWS (Lambda, API Gateway, or ECS Fargate) for
                  cost-efficient scaling.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Authentication
                  </span>
                  : AWS Cognito manages identities and JWT issuance.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Access Control
                  </span>
                  : IAM defines roles and policies with least privilege.
                </li>
                <li>
                  <span className="font-medium text-foreground">Database</span>:
                  AWS RDS stores structured data with high availability.
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* SA‑SAMS Data Pipeline */}
        <section className="mt-10" id="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>SA‑SAMS data pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="ingest">
                <TabsList className="flex w-full flex-wrap gap-2">
                  <TabsTrigger value="ingest" className="text-xs">
                    Ingest
                  </TabsTrigger>
                  <TabsTrigger value="secure" className="text-xs">
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="transform" className="text-xs">
                    Transform
                  </TabsTrigger>
                  <TabsTrigger value="deliver" className="text-xs">
                    Display & Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ingest" className="mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p className="text-foreground font-medium">
                        How we get the data
                      </p>
                      <ul className="grid gap-2">
                        <li className="flex items-start gap-2">
                          <FileDown className="mt-0.5 h-4 w-4 text-primary" />{" "}
                          SA‑SAMS exports daily CSV/XML extracts.
                        </li>
                        <li className="flex items-start gap-2">
                          <UploadCloud className="mt-0.5 h-4 w-4 text-primary" />{" "}
                          Files are uploaded via AWS Transfer Family (SFTP) into
                          a private S3 bucket.
                        </li>
                        <li className="flex items-start gap-2">
                          <Server className="mt-0.5 h-4 w-4 text-primary" /> An
                          S3 event triggers a Lambda to validate, decrypt and
                          stage data.
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-xs text-muted-foreground">
                        Ingestion flow
                      </div>
                      <ol className="mt-2 grid gap-2 text-sm">
                        <li>
                          SA‑SAMS → SFTP (AWS Transfer) → S3 private bucket
                        </li>
                        <li>S3 event → AWS Lambda (schema + PII checks)</li>
                        <li>
                          Lambda → RDS staging schema (<code>sams_raw</code>)
                        </li>
                      </ol>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="secure" className="mt-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Lock className="h-4 w-4" /> Transport
                      </div>
                      <p>
                        SFTP with enforced TLS 1.2+, IP allow‑listing and
                        per‑school user accounts.
                      </p>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <ShieldCheck className="h-4 w-4" /> At rest
                      </div>
                      <p>
                        S3 and RDS encrypted with KMS; separate keys for staging
                        vs. production domains.
                      </p>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <KeyRound className="h-4 w-4" /> Access
                      </div>
                      <p>
                        IAM roles with least privilege; temporary credentials;
                        secrets in AWS Secrets Manager.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="transform" className="mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p className="text-foreground font-medium">
                        Validation & modelling
                      </p>
                      <ul className="grid gap-2">
                        <li>
                          Lambda performs schema validation and de‑duplication.
                        </li>
                        <li>
                          Records move from <code>sams_raw</code> →{" "}
                          <code>sams_clean</code> with audit columns.
                        </li>
                        <li>
                          Hasura exposes views with row‑level RBAC per
                          school/district.
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                      <p className="text-foreground font-medium">
                        PII safeguards
                      </p>
                      <ul className="mt-2 grid gap-2">
                        <li>
                          Direct IDs hashed for internal joins; public
                          dashboards use aggregates only.
                        </li>
                        <li>
                          Access patterns reviewed quarterly; anomaly alerts on
                          unusual queries.
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="deliver" className="mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p className="text-foreground font-medium">
                        Displaying insights
                      </p>
                      <ul className="grid gap-2">
                        <li>
                          Next.js SSR renders role‑specific dashboards and
                          reports.
                        </li>
                        <li>
                          Hasura subscriptions enable near real‑time updates.
                        </li>
                        <li>
                          Export options: CSV/PDF with watermarking and access
                          logs.
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-xs text-muted-foreground">
                        Typical analytics
                      </div>
                      <ul className="mt-2 grid gap-2 text-sm">
                        <li className="flex items-center justify-between">
                          <span>Attendance risk</span>
                          <span className="h-2 w-24 rounded bg-primary/30"></span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Assessment gaps</span>
                          <span className="h-2 w-16 rounded bg-primary/30"></span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Intervention uptake</span>
                          <span className="h-2 w-12 rounded bg-primary/30"></span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* Security accordion */}
        <section className="mt-10" id="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Measures</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="authz">
                  <AccordionTrigger>
                    1. Authentication and Authorization
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                      <li>
                        <span className="font-medium text-foreground">
                          AWS Cognito Integration
                        </span>
                        : MFA, strong password policies, and JWT generation.
                      </li>
                      <li>
                        <span className="font-medium text-foreground">
                          JWT & RBAC
                        </span>
                        : Hasura enforces role-based permissions per user role.
                      </li>
                      <li>
                        <span className="font-medium text-foreground">
                          IAM Policies
                        </span>
                        : Apply least privilege and audit credentials regularly.
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="encryption">
                  <AccordionTrigger>2. Data Encryption</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                      <li>
                        <span className="font-medium text-foreground">
                          At Rest
                        </span>
                        : RDS encryption via KMS with periodic key rotation.
                      </li>
                      <li>
                        <span className="font-medium text-foreground">
                          In Transit
                        </span>
                        : Enforce HTTPS/TLS everywhere.
                      </li>
                      <li>
                        <span className="font-medium text-foreground">
                          Sensitive Data Handling
                        </span>
                        : Store secrets on the server via environment variables.
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="network">
                  <AccordionTrigger>3. Network Security</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                      <li>
                        Deploy within a VPC with private subnets and restrictive
                        security groups.
                      </li>
                      <li>
                        Use API Gateway, AWS Shield, and WAF to protect GraphQL
                        endpoints.
                      </li>
                      <li>Avoid public database exposure.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="monitoring">
                  <AccordionTrigger>
                    4. Monitoring, Logging, and Incident Response
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                      <li>Enable CloudWatch, GuardDuty, and Hasura logs.</li>
                      <li>
                        Configure alerts for failed logins and query anomalies.
                      </li>
                      <li>Schedule regular IAM and configuration audits.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="compliance">
                  <AccordionTrigger>
                    5. Compliance and Best Practices
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                      <li>Adhere to GDPR/CCPA principles.</li>
                      <li>Keep frameworks and dependencies updated.</li>
                      <li>
                        Conduct penetration tests and enable encrypted RDS
                        backups.
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="lifecycle">
                  <AccordionTrigger>
                    6. Data Lifecycle Management
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                      <li>
                        Retention: store logs 90 days; delete user data after
                        one year.
                      </li>
                      <li>
                        Deletion: permanently remove user data upon request.
                      </li>
                      <li>Minimization: collect only required data fields.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="secrets">
                  <AccordionTrigger>7. Secret Management</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                      <li>Use AWS Secrets Manager with automatic rotation.</li>
                      <li>Inject secrets at runtime only.</li>
                      <li>Never commit secrets to version control.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="appsec">
                  <AccordionTrigger>
                    8. Application Security (Next.js & Hasura)
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                      <li>Sanitize and validate user inputs.</li>
                      <li>Use CSP and secure headers in Next.js.</li>
                      <li>Restrict GraphQL queries via allow-lists.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="classification">
                  <AccordionTrigger>
                    9. Data Classification and Access Review
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                      <li>
                        Define levels: Public, Internal, Confidential, Highly
                        Confidential.
                      </li>
                      <li>Perform quarterly access reviews.</li>
                      <li>Enforce separation of duties.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="dr">
                  <AccordionTrigger>
                    10. Disaster Recovery & Business Continuity
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                      <li>Define RPO and RTO targets.</li>
                      <li>Test RDS failovers and recovery drills.</li>
                      <li>Maintain an incident response playbook.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="thirdparty">
                  <AccordionTrigger>
                    11. Third-Party Integrations and Dependency Security
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                      <li>Run regular dependency and vulnerability scans.</li>
                      <li>Vet third-party APIs for compliance requirements.</li>
                      <li>Adopt peer-reviewed code practices.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="training">
                  <AccordionTrigger>
                    12. User Awareness and Training
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                      <li>Conduct periodic security awareness sessions.</li>
                      <li>Educate users on phishing and MFA usage.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} iPASS Project. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
