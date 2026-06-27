import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy — top3news' };

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-black uppercase tracking-tight text-gray-950 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: June 27, 2026</p>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">

        <section>
          <h2 className="text-lg font-black text-gray-900 mb-2">1. Overview</h2>
          <p>top3news ("we", "us", or "our") operates the website top3.news (the "Site"). This Privacy Policy explains how we handle information when you visit our Site.</p>
          <p className="mt-2">top3news is a news aggregator. We do not require registration, do not create user accounts, and do not collect personal information from visitors.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-gray-900 mb-2">2. Information We Do Not Collect</h2>
          <p>We do not collect, store, or process any personally identifiable information (PII) from visitors, including:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Names, email addresses, or phone numbers</li>
            <li>Account credentials or passwords</li>
            <li>Payment or financial information</li>
            <li>Location data</li>
            <li>Cookies for tracking or advertising purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-black text-gray-900 mb-2">3. Content Sources</h2>
          <p>top3news aggregates publicly available news content from third-party RSS feeds and news sources. We link to original articles and credit all sources. We do not republish full articles without permission.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-gray-900 mb-2">4. Third-Party Services</h2>
          <p>Our Site may reference or link to third-party websites. We are not responsible for the privacy practices or content of those sites. We recommend reviewing the privacy policy of any third-party site you visit.</p>
          <p className="mt-2">We use the following third-party services to operate the Site:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>GitHub Pages</strong> — for hosting (github.com/privacy)</li>
            <li><strong>Anthropic Claude API</strong> — for AI-generated article summaries (anthropic.com/privacy)</li>
            <li><strong>wttr.in</strong> — for weather data (no user data sent)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-black text-gray-900 mb-2">5. Social Media</h2>
          <p>top3news maintains a presence on Facebook and other social platforms. When you interact with our social media pages, those platforms' own privacy policies apply. We do not receive or store your personal data from those interactions.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-gray-900 mb-2">6. Children's Privacy</h2>
          <p>Our Site is not directed to children under the age of 13. We do not knowingly collect information from children.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-gray-900 mb-2">7. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of the Site after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-gray-900 mb-2">8. Contact</h2>
          <p>If you have questions about this Privacy Policy, contact us at: <a href="mailto:ramonzamora89@gmail.com" className="text-brand hover:underline">ramonzamora89@gmail.com</a></p>
        </section>

      </div>
    </div>
  );
}
