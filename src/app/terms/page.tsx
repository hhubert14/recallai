import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - RecallAI',
  description: 'Terms of Service for RecallAI Chrome Extension and Web Application',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Please read these terms carefully before using RecallAI
            </p>
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Effective Date: July 8, 2025
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
              
              <section className="mb-10 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <h2 className="text-2xl font-semibold mb-4 text-blue-900 dark:text-blue-100 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                  Acceptance of Terms
                </h2>
                <p>
                  By accessing or using RecallAI ("the Service"), you agree to be bound by these Terms of Service 
                  ("Terms"). If you do not agree to these Terms, please do not use the Service.
                </p>
              </section>

              <section className="mb-10 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
                <h2 className="text-2xl font-semibold mb-4 text-purple-900 dark:text-purple-100 flex items-center">
                  <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                  Description of Service
                </h2>
                <p>
                  RecallAI is a Chrome extension and web application that helps users learn from YouTube videos 
                  by generating summaries and interactive quizzes using artificial intelligence.
                </p>
              </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-900 dark:text-indigo-100 flex items-center">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
              User Accounts
            </h2>
            <ul className="list-disc pl-6 mb-4">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>You must be at least 13 years old to use the Service</li>
            </ul>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-900 dark:text-emerald-100 flex items-center">
              <span className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
              Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Attempt to gain unauthorized access to the Service or its systems</li>
              <li>Use the Service to distribute malware or harmful content</li>
              <li>Reverse engineer or attempt to extract source code from the Service</li>
            </ul>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl border border-orange-200 dark:border-orange-800">
            <h2 className="text-2xl font-semibold mb-4 text-orange-900 dark:text-orange-100 flex items-center">
              <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
              Subscription and Payment
            </h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Some features require a paid subscription</li>
              <li>Subscription fees are billed in advance and are non-refundable</li>
              <li>You may cancel your subscription at any time</li>
              <li>Price changes will be communicated with 30 days notice</li>
              <li>Failed payments may result in service suspension</li>
            </ul>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-xl border border-rose-200 dark:border-rose-800">
            <h2 className="text-2xl font-semibold mb-4 text-rose-900 dark:text-rose-100 flex items-center">
              <span className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">6</span>
              Intellectual Property
            </h2>
            <p>
              The Service and its original content, features, and functionality are owned by RecallAI 
              and are protected by international copyright, trademark, patent, trade secret, and other 
              intellectual property laws.
            </p>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-900 dark:text-cyan-100 flex items-center">
              <span className="bg-cyan-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">7</span>
              User Content
            </h2>
            <ul className="list-disc pl-6 mb-4">
              <li>You retain ownership of content you submit to the Service</li>
              <li>You grant us a license to use your content to provide the Service</li>
              <li>You are responsible for ensuring you have rights to any content you submit</li>
              <li>We may remove content that violates these Terms</li>
            </ul>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-xl border border-violet-200 dark:border-violet-800">
            <h2 className="text-2xl font-semibold mb-4 text-violet-900 dark:text-violet-100 flex items-center">
              <span className="bg-violet-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">8</span>
              Privacy
            </h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which explains how we 
              collect, use, and protect your information when you use the Service.
            </p>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-xl border border-red-200 dark:border-red-800">
            <h2 className="text-2xl font-semibold mb-4 text-red-900 dark:text-red-100 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">9</span>
              Disclaimers
            </h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, 
              EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
              AND NON-INFRINGEMENT.
            </p>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-900 dark:text-yellow-100 flex items-center">
              <span className="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">10</span>
              Limitation of Liability
            </h2>
            <p>
              IN NO EVENT SHALL RECALLAI BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
              OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30 rounded-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center">
              <span className="bg-slate-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">11</span>
              Termination
            </h2>
            <p>
              We may terminate or suspend your account and access to the Service at our sole discretion, 
              without prior notice, for conduct that we believe violates these Terms or is harmful to 
              other users, us, or third parties.
            </p>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-xl border border-teal-200 dark:border-teal-800">
            <h2 className="text-2xl font-semibold mb-4 text-teal-900 dark:text-teal-100 flex items-center">
              <span className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">12</span>
              Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of material 
              changes by posting the new Terms on this page and updating the effective date.
            </p>
          </section>

          <section className="mb-10 p-6 bg-gradient-to-r from-lime-50 to-green-50 dark:from-lime-950/30 dark:to-green-950/30 rounded-xl border border-lime-200 dark:border-lime-800">
            <h2 className="text-2xl font-semibold mb-4 text-lime-900 dark:text-lime-100 flex items-center">
              <span className="bg-lime-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">13</span>
              Governing Law
            </h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of Missouri, United States, 
              without regard to its conflict of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800 mt-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="font-semibold text-blue-900 dark:text-blue-100">hubert@recallai.io</p>
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
                  Last updated: July 8, 2025
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
