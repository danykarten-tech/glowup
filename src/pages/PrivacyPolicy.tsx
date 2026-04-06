import LegalPageLayout from "@/components/LegalPageLayout";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => (
  <LegalPageLayout>
    <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
    <p className="text-muted-foreground mb-8 text-sm">Last updated: April 1, 2026</p>

    <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-foreground/90">
      <section>
        <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
        <p>When you use FaceNova, we collect the following information:</p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li><strong>Account Information:</strong> Email address, name, and profile details you provide during registration.</li>
          <li><strong>Photos:</strong> Facial photos you upload for analysis. Photos are stored securely and associated with your account for history tracking.</li>
          <li><strong>Analysis Data:</strong> Results generated from your photo analysis, including scores and recommendations.</li>
          <li><strong>Usage Data:</strong> Pages visited, features used, device type, and browser information for improving our service.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>To provide AI-powered facial analysis and personalized recommendations.</li>
          <li>To maintain your analysis history so you can track progress over time.</li>
          <li>To improve our AI models and service quality (using anonymized, aggregated data only).</li>
          <li>To communicate with you about your account and service updates.</li>
          <li>To process payments for premium plans.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">3. Photo Data & AI Processing</h2>
        <p className="text-muted-foreground">
          Your photos are processed by our AI analysis engine to generate glow scores and recommendations.
          Photos are stored securely in encrypted cloud storage and are only accessible by you.
          We do <strong>not</strong> sell, share, or use your photos for advertising purposes.
          You can delete your photos and analysis history at any time from your account settings.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">4. Data Sharing</h2>
        <p className="text-muted-foreground">We do not sell your personal data. We may share data only in these cases:</p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li><strong>Service Providers:</strong> Cloud hosting and AI processing providers who help us deliver the service.</li>
          <li><strong>Legal Compliance:</strong> When required by law or to protect our rights.</li>
          <li><strong>Shared Results:</strong> Only when you explicitly choose to share your analysis results via a share link.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">5. Data Security</h2>
        <p className="text-muted-foreground">
          We use industry-standard encryption (TLS/SSL) for data in transit and AES-256 for data at rest.
          Access to user data is restricted to authorized personnel only. We conduct regular security audits.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
        <p className="text-muted-foreground">You have the right to:</p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Access and download your personal data.</li>
          <li>Delete your account and all associated data.</li>
          <li>Opt out of non-essential communications.</li>
          <li>Request correction of inaccurate data.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">7. Cookies & Tracking</h2>
        <p className="text-muted-foreground">
          We use essential cookies for authentication and session management. We also use basic analytics
          to understand how users interact with our service. No third-party advertising trackers are used.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">8. Children's Privacy</h2>
        <p className="text-muted-foreground">
          FaceNova is not intended for users under 16 years of age. We do not knowingly collect
          data from minors. If we learn that we have collected data from a minor, we will promptly delete it.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">9. Changes to This Policy</h2>
        <p className="text-muted-foreground">
          We may update this policy from time to time. We will notify you of significant changes via email
          or an in-app notification. Continued use of the service after changes constitutes acceptance.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">10. Contact Us</h2>
        <p className="text-muted-foreground">
          For privacy-related questions or data requests, contact us at{" "}
          <Link to="/support" className="text-primary underline">our support page</Link>.
        </p>
      </section>
    </div>
  </LegalPageLayout>
);

export default PrivacyPolicy;
