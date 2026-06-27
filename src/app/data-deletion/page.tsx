import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Data Deletion — top3news' };

export default function DataDeletionPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-black uppercase tracking-tight text-gray-950 mb-2">Data Deletion</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: June 27, 2026</p>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">

        <section>
          <h2 className="text-lg font-black text-gray-900 mb-2">No Personal Data Collected</h2>
          <p>top3news does not collect, store, or process any personal data from visitors. We do not require registration or login, and we do not use tracking cookies.</p>
          <p className="mt-2">Because we hold no personal data about you, there is nothing to delete.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-gray-900 mb-2">Facebook / Meta Integration</h2>
          <p>top3news uses the Facebook Pages API solely to publish news content to our own Facebook Page. We do not receive, store, or process any personal data from Facebook users as a result of this integration.</p>
          <p className="mt-2">If you have interacted with our Facebook Page and wish to manage your data with Meta, please use Meta's own data tools at <a href="https://www.facebook.com/help/contact/540977946302970" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">facebook.com/help</a>.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-gray-900 mb-2">Contact</h2>
          <p>If you have any questions, contact us at: <a href="mailto:ramonzamora89@gmail.com" className="text-brand hover:underline">ramonzamora89@gmail.com</a></p>
        </section>

      </div>
    </div>
  );
}
