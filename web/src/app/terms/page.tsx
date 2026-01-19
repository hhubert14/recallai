import { Metadata } from "next";
import { FileText, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
    title: "Terms of Service - RecallAI",
    description:
        "Terms of Service for RecallAI Chrome Extension and Web Application",
};

function SectionCard({
    number,
    title,
    children,
    delay = 0,
}: {
    number: number;
    title: string;
    children: React.ReactNode;
    delay?: number;
}) {
    return (
        <section
            className="p-6 bg-card rounded-xl border border-border animate-fade-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                    {number}
                </span>
                {title}
            </h2>
            <div className="text-muted-foreground space-y-3">{children}</div>
        </section>
    );
}

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="container mx-auto px-4 py-12 max-w-4xl">
                    <div className="text-center animate-fade-up">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6">
                            <FileText className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-4xl font-bold text-foreground mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Please read these terms carefully before using RecallAI
                        </p>
                        <div className="mt-6 inline-flex items-center px-4 py-2 bg-primary/10 rounded-full">
                            <Clock className="w-4 h-4 text-primary mr-2" />
                            <span className="text-sm font-medium text-primary">
                                Effective Date: July 8, 2025
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="space-y-6">
                    <SectionCard number={1} title="Acceptance of Terms" delay={50}>
                        <p>
                            By accessing or using RecallAI (&quot;the Service&quot;), you
                            agree to be bound by these Terms of Service (&quot;Terms&quot;).
                            If you do not agree to these Terms, please do not use the
                            Service.
                        </p>
                    </SectionCard>

                    <SectionCard number={2} title="Description of Service" delay={100}>
                        <p>
                            RecallAI is a Chrome extension and web application that
                            helps users learn from YouTube videos by generating
                            summaries and interactive quizzes using artificial
                            intelligence.
                        </p>
                    </SectionCard>

                    <SectionCard number={3} title="User Accounts" delay={150}>
                        <ul className="list-disc pl-6">
                            <li>You must provide accurate and complete information when creating an account</li>
                            <li>You are responsible for maintaining the security of your account credentials</li>
                            <li>You must notify us immediately of any unauthorized use of your account</li>
                            <li>You must be at least 13 years old to use the Service</li>
                        </ul>
                    </SectionCard>

                    <SectionCard number={4} title="Acceptable Use" delay={200}>
                        <p className="mb-3">You agree not to:</p>
                        <ul className="list-disc pl-6">
                            <li>Use the Service for any illegal or unauthorized purpose</li>
                            <li>Violate any applicable laws or regulations</li>
                            <li>Infringe upon the rights of others</li>
                            <li>Attempt to gain unauthorized access to the Service or its systems</li>
                            <li>Use the Service to distribute malware or harmful content</li>
                            <li>Reverse engineer or attempt to extract source code from the Service</li>
                        </ul>
                    </SectionCard>

                    <SectionCard number={5} title="Intellectual Property" delay={250}>
                        <p>
                            The Service and its original content, features, and
                            functionality are owned by RecallAI and are protected by
                            international copyright, trademark, patent, trade secret,
                            and other intellectual property laws.
                        </p>
                    </SectionCard>

                    <SectionCard number={6} title="User Content" delay={300}>
                        <ul className="list-disc pl-6">
                            <li>You retain ownership of content you submit to the Service</li>
                            <li>You grant us a license to use your content to provide the Service</li>
                            <li>You are responsible for ensuring you have rights to any content you submit</li>
                            <li>We may remove content that violates these Terms</li>
                        </ul>
                    </SectionCard>

                    <SectionCard number={7} title="Privacy" delay={350}>
                        <p>
                            Your privacy is important to us. Please review our Privacy
                            Policy, which explains how we collect, use, and protect
                            your information when you use the Service.
                        </p>
                    </SectionCard>

                    <SectionCard number={8} title="Disclaimers" delay={400}>
                        <p className="uppercase">
                            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF
                            ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED,
                            INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                            PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                        </p>
                    </SectionCard>

                    <SectionCard number={9} title="Limitation of Liability" delay={450}>
                        <p className="uppercase">
                            IN NO EVENT SHALL RECALLAI BE LIABLE FOR ANY INDIRECT,
                            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES
                            ARISING OUT OF YOUR USE OF THE SERVICE.
                        </p>
                    </SectionCard>

                    <SectionCard number={10} title="Termination" delay={500}>
                        <p>
                            We may terminate or suspend your account and access to the
                            Service at our sole discretion, without prior notice, for
                            conduct that we believe violates these Terms or is harmful
                            to other users, us, or third parties.
                        </p>
                    </SectionCard>

                    <SectionCard number={11} title="Changes to Terms" delay={550}>
                        <p>
                            We reserve the right to modify these Terms at any time.
                            We will notify users of material changes by posting the
                            new Terms on this page and updating the effective date.
                        </p>
                    </SectionCard>

                    <SectionCard number={12} title="Governing Law" delay={600}>
                        <p>
                            These Terms are governed by and construed in accordance
                            with the laws of Missouri, United States, without regard
                            to its conflict of law principles.
                        </p>
                    </SectionCard>

                    <SectionCard number={13} title="Contact Information" delay={650}>
                        <p className="mb-4">
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <div className="bg-primary/10 p-4 rounded-lg flex items-center">
                            <Mail className="w-5 h-5 text-primary mr-3" />
                            <span className="font-medium text-foreground">hubert@recallai.io</span>
                        </div>
                    </SectionCard>

                    <div className="pt-8 border-t border-border animate-fade-up" style={{ animationDelay: '700ms' }}>
                        <div className="text-center">
                            <div className="inline-flex items-center px-4 py-2 bg-muted rounded-full">
                                <Clock className="w-4 h-4 text-muted-foreground mr-2" />
                                <span className="text-sm text-muted-foreground">
                                    Last updated: July 8, 2025
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
