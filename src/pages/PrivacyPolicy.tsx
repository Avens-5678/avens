import Layout from "@/components/layout/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-5 sm:px-6 py-16 lg:py-24 max-w-3xl">
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm mb-12">Last updated: February 27, 2026</p>

          <div className="space-y-10 text-foreground/80 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
              <p>
                Evnting.com ("we", "our", or "us") is an event management and premium rental marketplace headquartered at 1st Floor, TFO Building Hitex, Izzathnagar, Hyderabad, Telangana 500049, India. We are committed to protecting the privacy and security of your personal information.
              </p>
              <p>
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at evnting.com or use our services, including our event management solutions, equipment rental marketplace, vendor platform, and client dashboards.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
              <h3 className="text-lg font-medium text-foreground">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, phone number, company name, and password when you register as a Client or Vendor.</li>
                <li><strong>Profile Information:</strong> Business details, GST number, PAN number, godown/warehouse address, city, and bio for Vendor accounts.</li>
                <li><strong>Inquiry & Booking Data:</strong> Event type, date, location, guest count, budget, and special requirements submitted through inquiry forms.</li>
                <li><strong>Rental Order Information:</strong> Equipment details, event dates, delivery locations, and contact information for rental orders.</li>
                <li><strong>Communication Data:</strong> Messages, feedback, testimonials, and correspondence with our team.</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">2.2 Information Collected via Third-Party Authentication</h3>
              <p>
                We offer <strong>Google Sign-In (OAuth 2.0)</strong> as a convenient login method. When you authenticate using Google, we receive and store only:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your <strong>name</strong></li>
                <li>Your <strong>email address</strong></li>
                <li>Your <strong>profile picture URL</strong> (if available)</li>
              </ul>
              <p>
                This information is used <strong>solely for account creation and secure platform access</strong>. We do not access your Google contacts, calendar, drive, or any other Google services data.
              </p>

              <h3 className="text-lg font-medium text-foreground">2.3 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and approximate location</li>
                <li>Pages visited, time spent, and navigation patterns</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To create and manage your Client or Vendor account</li>
                <li>To process event inquiries, rental orders, and booking requests</li>
                <li>To match Clients with appropriate Vendors for event services and equipment</li>
                <li>To send order updates, confirmations, and service notifications via email and WhatsApp</li>
                <li>To improve our website, services, and user experience</li>
                <li>To display portfolio, testimonials, and case studies (with consent)</li>
                <li>To comply with legal obligations and resolve disputes</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. Data Sharing & Disclosure</h2>
              <p className="font-semibold text-foreground">
                We do not sell, rent, or trade your personal information to third parties.
              </p>
              <p>We may share your information only in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>With Vendors:</strong> When you submit a rental order or event request, relevant details are shared with assigned Vendors to fulfill your order.</li>
                <li><strong>With Service Providers:</strong> We use trusted third-party services for authentication (Supabase/Google OAuth), messaging (WATI WhatsApp), and analytics (Google Analytics). These providers process data on our behalf under strict confidentiality agreements.</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, with prior notice.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Data Security</h2>
              <p>
                We implement industry-standard security measures including encrypted data transmission (SSL/TLS), secure authentication with row-level security policies, password hashing, and access controls. However, no method of electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Cookies</h2>
              <p>
                We use essential cookies for authentication and session management. We may also use analytics cookies (e.g., Google Analytics) to understand website usage. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access, correct, or delete your personal data</li>
                <li>Withdraw consent for data processing</li>
                <li>Request data portability</li>
                <li>Object to or restrict certain processing activities</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at <strong>info@evnting.com</strong> or call <strong>+91 9849085678</strong>.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Data Retention</h2>
              <p>
                We retain your personal information for as long as your account is active or as needed to provide services. Inquiry and order data is retained for business records and legal compliance. You may request deletion of your account and associated data at any time.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites or services. We are not responsible for the privacy practices of those external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">10. Children's Privacy</h2>
              <p>
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware of such collection, we will delete the data promptly.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. Changes will be posted on this page with an updated "Last updated" date. Continued use of the platform after changes constitutes acceptance.
              </p>
            </section>

            <section className="space-y-4 border-t border-border pt-8">
              <h2 className="text-xl font-semibold text-foreground">12. Contact Us</h2>
              <p>For questions or concerns about this Privacy Policy, contact:</p>
              <div className="bg-muted/50 rounded-lg p-5 space-y-1 text-sm">
                <p className="font-semibold text-foreground">Evnting.com</p>
                <p>1st Floor, TFO Building Hitex, Izzathnagar, Hyderabad, Telangana 500049</p>
                <p>Email: info@evnting.com</p>
                <p>Phone: +91 9849085678</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
