import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Resonance Network terms of service — the rules and guidelines for using our platform.',
}

export default function TermsPage() {
  return (
    <article className="legal-page">
      <div className="container legal-page__container">
        <h1 className="legal-page__title">Terms of Service</h1>
        <p className="legal-page__updated">Last updated: March 25, 2026</p>

        <p>
          Welcome to Resonance Network. By accessing or using our platform at{' '}
          <strong>resonance.network</strong>, you agree to be bound by these Terms of Service
          (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the platform.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account or using any part of the Resonance Network platform, you
          acknowledge that you have read, understood, and agree to be bound by these Terms
          and our <a href="/privacy">Privacy Policy</a>.
        </p>

        <h2>2. Account Responsibilities</h2>
        <ul>
          <li>You must provide accurate and complete information when creating your account.</li>
          <li>You are responsible for maintaining the security of your password and account.</li>
          <li>You must be at least 13 years old to use the platform.</li>
          <li>You are responsible for all activity that occurs under your account.</li>
          <li>You must notify us immediately of any unauthorized use of your account.</li>
        </ul>

        <h2>3. Content Ownership and License</h2>
        <p>
          <strong>Your content:</strong> You retain full ownership of all content you submit to
          Resonance Network, including project descriptions, images, profile information, and
          messages.
        </p>
        <p>
          <strong>License grant:</strong> By submitting content to the platform, you grant
          Resonance Network a non-exclusive, worldwide, royalty-free license to display,
          distribute, and promote your content in connection with the platform&apos;s operation.
          This license exists solely for the purpose of operating and improving the platform
          and terminates when you delete your content or account.
        </p>
        <p>
          <strong>Our content:</strong> The Resonance Network name, logo, design, and original
          platform content are owned by Resonance Network and protected by applicable intellectual
          property laws.
        </p>

        <h2>4. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Create fake accounts or misrepresent your identity.</li>
          <li>Submit false, misleading, or plagiarized content.</li>
          <li>Harass, threaten, or intimidate other users.</li>
          <li>Send spam, unsolicited promotions, or automated messages.</li>
          <li>Upload malicious code, viruses, or harmful content.</li>
          <li>Attempt to gain unauthorized access to the platform or other users&apos; accounts.</li>
          <li>Use the platform for any illegal purpose or in violation of any applicable law.</li>
          <li>Scrape, crawl, or use automated tools to extract data from the platform without permission.</li>
          <li>Interfere with or disrupt the platform&apos;s infrastructure or other users&apos; experience.</li>
        </ul>

        <h2>5. Project Submissions and Collaboration</h2>
        <p>
          Resonance Network is a platform for connecting creators and collaborators. We facilitate
          introductions and provide visibility for projects, but we are not a party to any
          collaboration agreements between users. Users are responsible for establishing their
          own terms of collaboration, compensation, and intellectual property arrangements.
        </p>

        <h2>6. Platform Disclaimers</h2>
        <p>
          The platform is provided <strong>&quot;as is&quot;</strong> and{' '}
          <strong>&quot;as available&quot;</strong> without warranties of any kind, either express
          or implied. We do not guarantee:
        </p>
        <ul>
          <li>That the platform will be uninterrupted, secure, or error-free.</li>
          <li>The accuracy or reliability of any content submitted by users.</li>
          <li>That any collaboration will result in a successful outcome.</li>
          <li>The quality, safety, or legality of any projects listed on the platform.</li>
        </ul>

        <h2>7. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, Resonance Network and its operators
          shall not be liable for any indirect, incidental, special, consequential, or punitive
          damages, or any loss of profits or revenues, whether incurred directly or indirectly,
          or any loss of data, use, goodwill, or other intangible losses resulting from:
        </p>
        <ul>
          <li>Your use of or inability to use the platform.</li>
          <li>Any unauthorized access to or alteration of your content.</li>
          <li>Any conduct or content of any third party on the platform.</li>
          <li>Any collaboration or interaction between users facilitated by the platform.</li>
        </ul>

        <h2>8. Modification of Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify registered
          users of material changes via email or a prominent notice on the platform. Your
          continued use of the platform after such changes constitutes acceptance of the
          updated Terms. If you disagree with the changes, you may close your account.
        </p>

        <h2>9. Termination</h2>
        <p>
          We may suspend or terminate your account at our discretion if you violate these
          Terms or engage in conduct that we determine is harmful to the platform or other
          users. You may delete your account at any time from your dashboard settings. Upon
          termination, your right to use the platform ceases immediately, and we may delete
          your data in accordance with our Privacy Policy.
        </p>

        <h2>10. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the
          State of California, United States, without regard to its conflict of law provisions.
          Any disputes arising from these Terms or your use of the platform shall be resolved
          in the courts located in the State of California.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          If you have questions about these Terms, please contact us at:{' '}
          <a href="mailto:resonanceartcollective@gmail.com">resonanceartcollective@gmail.com</a>
        </p>
      </div>
    </article>
  )
}
