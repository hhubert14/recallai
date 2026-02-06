import { Metadata } from "next";
import { Shield, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - Retenio",
  description:
    "Privacy Policy for Retenio Chrome Extension and Web Application",
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

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center animate-fade-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your privacy matters to us. Learn how we protect and handle your
              data.
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
          <SectionCard number={1} title="Introduction" delay={50}>
            <p>
              Retenio (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
              respects your privacy and is committed to protecting your personal
              data. This privacy policy explains how we collect, use, and
              safeguard your information when you use our Chrome extension and
              web application.
            </p>
          </SectionCard>

          <SectionCard number={2} title="Information We Collect" delay={100}>
            <h3 className="text-lg font-medium text-foreground mb-2">
              2.1 Personal Information
            </h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Email address (for account creation and authentication)</li>
              <li>Username and profile information</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mb-2">
              2.2 Usage Data
            </h3>
            <ul className="list-disc pl-6 mb-4">
              <li>
                YouTube video URLs and metadata that you choose to analyze
              </li>
              <li>Quiz responses and learning progress</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mb-2">
              2.3 Technical Data
            </h3>
            <ul className="list-disc pl-6">
              <li>Authentication cookies for secure login sessions</li>
              <li>Local storage for user interface preferences</li>
            </ul>
          </SectionCard>

          <SectionCard
            number={3}
            title="How We Use Your Information"
            delay={150}
          >
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc pl-6">
              <li>Provide and maintain our service</li>
              <li>
                Process YouTube video content to generate summaries and quizzes
              </li>
              <li>
                Track your learning progress and provide personalized
                recommendations
              </li>
              <li>Send important service updates and notifications</li>
              <li>Improve our service and develop new features</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </SectionCard>

          <SectionCard number={4} title="Data Storage and Security" delay={200}>
            <p className="mb-3">
              Your data is stored securely using Supabase, a trusted cloud
              database provider. We implement industry-standard security
              measures including:
            </p>
            <ul className="list-disc pl-6">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication systems</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and data minimization</li>
            </ul>
          </SectionCard>

          <SectionCard number={5} title="Third-Party Services" delay={250}>
            <p className="mb-3">We use the following third-party services:</p>
            <ul className="list-disc pl-6 mb-3">
              <li>
                <strong>YouTube API:</strong> To access video metadata and
                transcripts
              </li>
              <li>
                <strong>OpenAI:</strong> To generate summaries and quiz
                questions
              </li>
              <li>
                <strong>Supabase:</strong> For database and authentication
                services
              </li>
            </ul>
            <p>
              Each service has its own privacy policy, and we recommend
              reviewing them to understand how your data is handled.
            </p>
          </SectionCard>

          <SectionCard number={6} title="Data Sharing" delay={300}>
            <p className="mb-3">
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information only in the following
              circumstances:
            </p>
            <ul className="list-disc pl-6">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
          </SectionCard>

          <SectionCard number={7} title="Your Rights" delay={350}>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </SectionCard>

          <SectionCard number={8} title="Data Retention" delay={400}>
            <p>
              We retain your personal data only as long as necessary to provide
              our services and comply with legal obligations. When you delete
              your account, we will remove your personal data within 30 days,
              except where required by law to retain it longer.
            </p>
          </SectionCard>

          <SectionCard number={9} title="Children's Privacy" delay={450}>
            <p>
              Our service is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13. If you become aware that a child has provided us with personal
              information, please contact us immediately.
            </p>
          </SectionCard>

          <SectionCard
            number={10}
            title="International Data Transfers"
            delay={500}
          >
            <p>
              Your data may be transferred to and processed in countries other
              than your own. We ensure appropriate safeguards are in place to
              protect your data in accordance with applicable privacy laws.
            </p>
          </SectionCard>

          <SectionCard number={11} title="Changes to This Policy" delay={550}>
            <p>
              We may update this privacy policy from time to time. We will
              notify you of any material changes by posting the new policy on
              this page and updating the effective date. Your continued use of
              our service after changes become effective constitutes acceptance
              of the revised policy.
            </p>
          </SectionCard>

          <SectionCard number={12} title="Contact Us" delay={600}>
            <p className="mb-4">
              If you have any questions about this privacy policy or our data
              practices, please contact us at:
            </p>
            <div className="bg-primary/10 p-4 rounded-lg flex items-center">
              <Mail className="w-5 h-5 text-primary mr-3" />
              <span className="font-medium text-foreground">
                hubert@recallai.io
              </span>
            </div>
          </SectionCard>

          <div
            className="pt-8 border-t border-border animate-fade-up"
            style={{ animationDelay: "650ms" }}
          >
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
