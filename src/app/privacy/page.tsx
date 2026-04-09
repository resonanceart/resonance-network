import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Resonance Network privacy policy. How we collect, use, and protect your personal data when you use our art collaboration platform and services.',
  alternates: { canonical: 'https://resonancenetwork.org/privacy' },
  openGraph: {
    title: 'Privacy Policy | Resonance Network',
    description: 'How we collect, use, and protect your personal data on the Resonance Network platform.',
    url: 'https://resonancenetwork.org/privacy',
    images: [{ url: '/og-image.jpg' }],
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | Resonance Network',
    description: 'How we collect, use, and protect your personal data on the Resonance Network platform.',
  },
}

export default function PrivacyPage() {
  return (
    <article className="legal-page">
      <div className="container legal-page__container">
        <h1 className="legal-page__title">Privacy Policy</h1>
        <p className="legal-page__updated">Last updated: March 25, 2026</p>

        <p>
          Resonance Network (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the platform at{' '}
          <strong>resonancenetwork.org</strong>. This Privacy Policy explains how we collect, use, store,
          and protect your information when you use our website and services.
        </p>

        <h2>1. Information We Collect</h2>

        <h3>Account Information</h3>
        <p>
          When you create an account, we collect your email address and password (stored securely
          via Supabase Auth). If you sign up with a magic link, we collect only your email address.
        </p>

        <h3>Profile Information</h3>
        <p>
          You may optionally provide a display name, bio, location, skills, website URL, and
          profile photo. This information is visible to other users on the platform.
        </p>

        <h3>Project Submissions</h3>
        <p>
          When you submit a project, we collect the project details you provide, including title,
          description, images, artist information, and contact email.
        </p>

        <h3>Collaboration Data</h3>
        <p>
          When you express interest in collaborating on a project or send messages through the
          platform, we store that communication data.
        </p>

        <h3>Usage Data</h3>
        <p>
          We automatically collect basic usage data including pages visited and timestamps.
          We do not use third-party analytics or tracking cookies.
        </p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li><strong>Provide the platform:</strong> Display your profile, projects, and facilitate collaboration.</li>
          <li><strong>Authentication:</strong> Verify your identity and maintain your session.</li>
          <li><strong>Email notifications:</strong> Send updates about projects you follow, collaboration requests, and platform announcements. You can manage these in your dashboard settings.</li>
          <li><strong>Match collaborators:</strong> Help connect creators with collaborators based on skills and interests.</li>
          <li><strong>Improve the platform:</strong> Understand how the platform is used to make it better.</li>
        </ul>

        <h2>3. Data Storage and Security</h2>
        <p>
          Your data is stored in <strong>Supabase</strong>, which uses Amazon Web Services (AWS)
          infrastructure hosted in the United States. Passwords are hashed and never stored in
          plain text. All data is transmitted over encrypted HTTPS connections. We use Row Level
          Security (RLS) policies in our database to ensure users can only access their own data.
        </p>

        <h2>4. Third-Party Services</h2>
        <p>We use the following third-party services to operate the platform:</p>
        <ul>
          <li><strong>Supabase</strong>. Authentication, database, and file storage.</li>
          <li><strong>Vercel</strong>. Website hosting and deployment.</li>
          <li><strong>Resend / Gmail</strong>. Transactional and notification emails.</li>
        </ul>
        <p>
          These services have their own privacy policies. We do not sell, trade, or rent your
          personal information to third parties.
        </p>

        <h2>5. Cookies</h2>
        <p>
          We use <strong>essential cookies only</strong> for authentication session management via
          Supabase Auth. These cookies are necessary for the platform to function and keep you
          signed in. We do not use advertising, analytics, or tracking cookies.
        </p>
        <p>
          We also store a cookie consent preference in your browser&apos;s local storage to
          remember whether you&apos;ve acknowledged our cookie notice.
        </p>

        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access your data:</strong> You can download all your data from{' '}
            <Link href="/dashboard/settings">Dashboard Settings</Link> using the &quot;Download My Data&quot; feature.
          </li>
          <li><strong>Correct your data:</strong> Update your profile information at any time from your{' '}
            <Link href="/dashboard/profile">profile editor</Link>.
          </li>
          <li><strong>Delete your data:</strong> You can permanently delete your account and all associated
            data from{' '}
            <Link href="/dashboard/settings">Dashboard Settings</Link>. This action is irreversible.
          </li>
          <li><strong>Control communications:</strong> Manage your email notification preferences in your
            dashboard settings.
          </li>
        </ul>

        <h2>7. Data Retention</h2>
        <p>
          We retain your personal data for as long as your account is active. When you delete
          your account, all personal data (profile, submissions, messages, follows) is permanently
          deleted. Anonymous, aggregated usage data may be retained indefinitely for platform
          improvement purposes.
        </p>

        <h2>8. Children&apos;s Privacy</h2>
        <p>
          Resonance Network is not directed at children under the age of 13. We do not knowingly
          collect personal information from children under 13. If we become aware that we have
          collected data from a child under 13, we will take steps to delete that information promptly.
        </p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify registered users of
          significant changes via email or a notice on the platform. Continued use of the platform
          after changes constitutes acceptance of the updated policy.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or your data, please contact us at:{' '}
          <a href="mailto:resonanceartcollective@gmail.com">resonanceartcollective@gmail.com</a>
        </p>
      </div>
    </article>
  )
}
