import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - RecallAI',
  description: 'Privacy Policy for RecallAI Chrome Extension and Web Application',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-green-950">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Your privacy matters to us. Learn how we protect and handle your data.
            </p>
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                Effective Date: June 29, 2025
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="prose prose-slate dark:prose-invert max-w-none prose-lg prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300">

          <section className="mb-10 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-xl border border-green-200 dark:border-green-800">
            <h2 className="text-2xl font-semibold mb-4 text-green-900 dark:text-green-100 flex items-center">
              <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
              Introduction
            </h2>
            <p>
              RecallAI ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our Chrome 
              extension and web application.
            </p>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-semibold mb-4 text-blue-900 dark:text-blue-100 flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
              Information We Collect
            </h2>
            
            <h3 className="text-xl font-medium mb-3">2.1 Personal Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Email address (for account creation and authentication)</li>
              <li>Username and profile information</li>
              <li>Subscription and billing information (processed securely through Stripe)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">2.2 Usage Data</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>YouTube video URLs and metadata that you choose to analyze</li>
              <li>Quiz responses and learning progress</li>
              <li>Extension usage statistics and performance data</li>
              <li>Device information and browser type</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">2.3 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>IP address and location data</li>
              <li>Browser and device information</li>
              <li>Usage patterns and interaction data</li>
            </ul>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
            <h2 className="text-2xl font-semibold mb-4 text-purple-900 dark:text-purple-100 flex items-center">
              <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
              How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide and maintain our service</li>
              <li>Process YouTube video content to generate summaries and quizzes</li>
              <li>Track your learning progress and provide personalized recommendations</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send important service updates and notifications</li>
              <li>Improve our service and develop new features</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-900 dark:text-emerald-100 flex items-center">
              <span className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
              Data Storage and Security
            </h2>
            <p>
              Your data is stored securely using Supabase, a trusted cloud database provider. We implement 
              industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication systems</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and data minimization</li>
            </ul>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl border border-orange-200 dark:border-orange-800">
            <h2 className="text-2xl font-semibold mb-4 text-orange-900 dark:text-orange-100 flex items-center">
              <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
              Third-Party Services
            </h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>YouTube API:</strong> To access video metadata and transcripts</li>
              <li><strong>OpenAI:</strong> To generate summaries and quiz questions</li>
              <li><strong>Stripe:</strong> For secure payment processing</li>
              <li><strong>Supabase:</strong> For database and authentication services</li>
              <li><strong>ZeroBounce:</strong> For email validation</li>
            </ul>
            <p>
              Each service has its own privacy policy, and we recommend reviewing them to understand 
              how your data is handled.
            </p>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-xl border border-rose-200 dark:border-rose-800">
            <h2 className="text-2xl font-semibold mb-4 text-rose-900 dark:text-rose-100 flex items-center">
              <span className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">6</span>
              Data Sharing
            </h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share 
              your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-900 dark:text-cyan-100 flex items-center">
              <span className="bg-cyan-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">7</span>
              Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-900 dark:text-indigo-100 flex items-center">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">8</span>
              Data Retention
            </h2>
            <p>
              We retain your personal data only as long as necessary to provide our services and 
              comply with legal obligations. When you delete your account, we will remove your 
              personal data within 30 days, except where required by law to retain it longer.
            </p>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-900 dark:text-yellow-100 flex items-center">
              <span className="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">9</span>
              Children's Privacy
            </h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If you become aware that a child 
              has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 rounded-xl border border-teal-200 dark:border-teal-800">
            <h2 className="text-2xl font-semibold mb-4 text-teal-900 dark:text-teal-100 flex items-center">
              <span className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">10</span>
              International Data Transfers
            </h2>
            <p>
              Your data may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your data in accordance 
              with applicable privacy laws.
            </p>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-xl border border-violet-200 dark:border-violet-800">
            <h2 className="text-2xl font-semibold mb-4 text-violet-900 dark:text-violet-100 flex items-center">
              <span className="bg-violet-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">11</span>
              Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any 
              material changes by posting the new policy on this page and updating the effective 
              date. Your continued use of our service after changes become effective constitutes 
              acceptance of the revised policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our data practices, please contact us at:
            </p>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800 mt-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="font-semibold text-green-900 dark:text-green-100">hubert@recallai.io</p>
              </div>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Last updated: June 29, 2025
                </span>
              </div>
            </div>
          </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
