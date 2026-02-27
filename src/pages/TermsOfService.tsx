import Layout from "@/components/Layout/Layout";

const TermsOfService = () => {
  return (
    <Layout>
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-5 sm:px-6 py-16 lg:py-24 max-w-3xl">
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground text-sm mb-12">Last updated: February 27, 2026</p>

          <div className="space-y-10 text-foreground/80 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Evnting.com platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, please do not use the Platform. These Terms apply to all users, including Clients (event organizers and renters), Vendors (equipment and service providers), and general visitors.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. About the Platform</h2>
              <p>
                Evnting.com is a dual-sided marketplace operated from Hyderabad, India, providing:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Event Management Services:</strong> Corporate events, government expos, weddings, entertainment shows, sports events, healthcare conferences, and more.</li>
                <li><strong>Premium Equipment Rental:</strong> German aluminum hangars, clear-span structures, AC domes, concert stages, lighting systems, LED walls, mobile AC lounges, and Airwingz 100 TR chillers.</li>
                <li><strong>Vendor Marketplace:</strong> Connecting verified equipment and service vendors with clients for event fulfillment.</li>
              </ul>
              <p>
                Evnting.com acts as an intermediary platform. We facilitate connections between Clients and Vendors but are not a party to the agreements made between them unless explicitly stated.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
              <h3 className="text-lg font-medium text-foreground">3.1 Registration</h3>
              <p>
                You may register as a <strong>Client</strong> or <strong>Vendor</strong>. You can sign up using email/password or via Google Sign-In (OAuth). You must provide accurate, current, and complete information during registration.
              </p>
              <h3 className="text-lg font-medium text-foreground">3.2 Account Security</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You must notify us immediately of any unauthorized access to your account.</li>
                <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
              </ul>
              <h3 className="text-lg font-medium text-foreground">3.3 Account Types</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Client:</strong> Can browse services, submit event requests, place rental orders, and track event progress.</li>
                <li><strong>Vendor:</strong> Can manage inventory, respond to job assignments, set availability, and fulfill orders.</li>
                <li><strong>Admin:</strong> Platform administrators with full management access (internal use only).</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. Client Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate event details including date, location, guest count, and requirements when submitting inquiries or rental orders.</li>
                <li>Respond to vendor communications and confirmations in a timely manner.</li>
                <li>Ensure the event venue is accessible and safe for equipment delivery and setup.</li>
                <li>Pay all agreed-upon fees as per the booking confirmation.</li>
                <li>Report any equipment damage or issues during the rental period promptly.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Vendor Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintain accurate inventory listings including descriptions, pricing, availability, and images.</li>
                <li>Respond to order assignments (accept or decline) within a reasonable timeframe.</li>
                <li>Deliver equipment in good working condition and on the agreed schedule.</li>
                <li>Comply with all applicable laws, safety regulations, and licensing requirements.</li>
                <li>Maintain appropriate insurance coverage for equipment and services.</li>
                <li>Provide accurate business information including GST number and PAN (where applicable).</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Booking & Order Process</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Clients submit event requests or rental orders through the Platform.</li>
                <li>Evnting.com assigns orders to appropriate Vendors based on availability, location, and specialization.</li>
                <li>Vendors may <strong>accept</strong> or <strong>decline</strong> assigned orders. Acceptance constitutes a commitment to fulfill the order.</li>
                <li>Pricing is communicated during the booking process. Final pricing may vary based on event-specific requirements.</li>
                <li>Cancellation policies are determined on a per-booking basis and communicated at the time of confirmation.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Payments</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payment terms are agreed upon between Evnting.com, the Client, and the Vendor at the time of booking.</li>
                <li>Evnting.com may facilitate payment collection on behalf of Vendors.</li>
                <li>All prices are quoted in Indian Rupees (INR) unless otherwise specified.</li>
                <li>Applicable taxes (GST) will be added as per government regulations.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Intellectual Property</h2>
              <p>
                All content on the Platform — including logos, text, images, designs, portfolio materials, and software — is the property of Evnting.com or its licensors. You may not reproduce, distribute, or create derivative works without written permission.
              </p>
              <p>
                By submitting testimonials, reviews, or portfolio images, you grant Evnting.com a non-exclusive, royalty-free license to display such content on the Platform and marketing materials.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Platform Liability Limitations</h2>
              <p>
                <strong>Evnting.com acts as a marketplace intermediary.</strong> To the maximum extent permitted by law:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We are <strong>not liable</strong> for the quality, safety, or legality of equipment or services provided by Vendors.</li>
                <li>We are <strong>not liable</strong> for any damages arising from the use of rented equipment or event services.</li>
                <li>We do <strong>not guarantee</strong> the availability of any specific Vendor, equipment, or service.</li>
                <li>We are <strong>not responsible</strong> for disputes between Clients and Vendors, though we may assist in mediation at our discretion.</li>
                <li>Our total liability shall not exceed the fees paid to Evnting.com for the specific transaction in question.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">10. Prohibited Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide false or misleading information in your account or listings</li>
                <li>Use the Platform for any unlawful purpose</li>
                <li>Attempt to circumvent the Platform to engage directly with Clients or Vendors to avoid platform fees</li>
                <li>Upload malicious content, spam, or engage in fraudulent activity</li>
                <li>Interfere with the proper functioning of the Platform</li>
                <li>Scrape, mine, or harvest data from the Platform without authorization</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">11. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Evnting.com, its directors, employees, and partners from any claims, damages, losses, or expenses arising from your use of the Platform, violation of these Terms, or infringement of any third-party rights.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">12. Termination</h2>
              <p>
                We may suspend or terminate your account at our sole discretion for violation of these Terms, fraudulent activity, or any conduct we deem harmful to the Platform or its users. You may also delete your account at any time by contacting us.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">13. Governing Law & Dispute Resolution</h2>
              <p>
                These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana. We encourage resolution through good-faith negotiation before pursuing legal remedies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">14. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Updated Terms will be posted on this page. Continued use of the Platform after modifications constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section className="space-y-4 border-t border-border pt-8">
              <h2 className="text-xl font-semibold text-foreground">15. Contact Us</h2>
              <p>For questions about these Terms of Service, contact:</p>
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

export default TermsOfService;
