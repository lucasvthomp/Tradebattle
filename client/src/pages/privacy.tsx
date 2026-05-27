import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Privacy() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'transparent' }}>
      <motion.div
        className="max-w-4xl mx-auto py-20 px-4"
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-8"
          style={{ color: '#C9D1E2' }}
          variants={fadeInUp}
        >
          Privacy Policy
        </motion.h1>

        <motion.div className="max-w-none" variants={fadeInUp}>
          <p className="mb-8" style={{ color: '#8A93A6' }}>
            <strong style={{ color: '#C9D1E2' }}>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#C9D1E2' }}>Information We Collect</h2>
            <p className="mb-4" style={{ color: '#8A93A6' }}>
              At Tradebattle, we collect information that you provide directly to us, such as when you create an account, participate in tournaments, or contact us for support.
            </p>
            <ul className="list-disc list-inside space-y-2" style={{ color: '#8A93A6' }}>
              <li>Account information (username, email address, payment details)</li>
              <li>Profile information and preferences</li>
              <li>Communication records and support interactions</li>
              <li>Usage data and analytics</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#C9D1E2' }}>How We Use Your Information</h2>
            <p className="mb-4" style={{ color: '#8A93A6' }}>
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2" style={{ color: '#8A93A6' }}>
              <li>Provide and improve our trading simulation platform</li>
              <li>Process payments and manage tournament entries</li>
              <li>Send important updates and communications</li>
              <li>Personalize your experience and content recommendations</li>
              <li>Analyze usage patterns to enhance our platform</li>
              <li>Comply with legal obligations and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#C9D1E2' }}>Information Sharing</h2>
            <p className="mb-4" style={{ color: '#8A93A6' }}>
              We do not sell, rent, or share your personal information with third parties except in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2" style={{ color: '#8A93A6' }}>
              <li>With your explicit consent</li>
              <li>To service providers who help us operate our platform</li>
              <li>To comply with legal requirements or court orders</li>
              <li>To protect our rights or prevent fraud</li>
              <li>In connection with a business transaction (merger, acquisition, etc.)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#C9D1E2' }}>Data Security</h2>
            <p className="mb-4" style={{ color: '#8A93A6' }}>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2" style={{ color: '#8A93A6' }}>
              <li>SSL encryption for data transmission</li>
              <li>Secure data storage with access controls</li>
              <li>Regular security audits and updates</li>
              <li>Employee training on data protection</li>
              <li>Incident response procedures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#C9D1E2' }}>Your Rights</h2>
            <p className="mb-4" style={{ color: '#8A93A6' }}>
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2" style={{ color: '#8A93A6' }}>
              <li>Access, update, or delete your personal information</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
              <li>Restrict processing of your information</li>
              <li>Data portability where applicable</li>
              <li>Lodge a complaint with supervisory authorities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#C9D1E2' }}>Cookies and Tracking</h2>
            <p className="mb-4" style={{ color: '#8A93A6' }}>
              We use cookies and similar technologies to enhance your experience on our platform. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#C9D1E2' }}>Changes to This Policy</h2>
            <p className="mb-4" style={{ color: '#8A93A6' }}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#C9D1E2' }}>Contact Us</h2>
            <p style={{ color: '#8A93A6' }}>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#1E2D3F', border: '1px solid #2B3A4C' }}>
              <p style={{ color: '#8A93A6' }}>
                <strong style={{ color: '#C9D1E2' }}>Email:</strong> support@tradebattle.gg<br />
                <strong style={{ color: '#C9D1E2' }}>Address:</strong> United States
              </p>
            </div>
          </section>
        </motion.div>
      </motion.div>
    </div>
  );
}
