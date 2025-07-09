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
    <div className="min-h-screen bg-white">
      <motion.div 
        className="max-w-4xl mx-auto py-20 px-4"
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-8 text-black"
          variants={fadeInUp}
        >
          Privacy Policy
        </motion.h1>
        
        <motion.div className="prose prose-lg max-w-none" variants={fadeInUp}>
          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              At ORSATH, we collect information that you provide directly to us, such as when you create an account, subscribe to our services, or contact us for support.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Account information (name, email address, payment details)</li>
              <li>Profile information and preferences</li>
              <li>Communication records and support interactions</li>
              <li>Usage data and analytics</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Provide and improve our investment research services</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send important updates and communications</li>
              <li>Personalize your experience and content recommendations</li>
              <li>Analyze usage patterns to enhance our platform</li>
              <li>Comply with legal obligations and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, rent, or share your personal information with third parties except in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>With your explicit consent</li>
              <li>To service providers who help us operate our platform</li>
              <li>To comply with legal requirements or court orders</li>
              <li>To protect our rights or prevent fraud</li>
              <li>In connection with a business transaction (merger, acquisition, etc.)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>SSL encryption for data transmission</li>
              <li>Secure data storage with access controls</li>
              <li>Regular security audits and updates</li>
              <li>Employee training on data protection</li>
              <li>Incident response procedures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">Your Rights</h2>
            <p className="text-gray-700 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Access, update, or delete your personal information</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
              <li>Restrict processing of your information</li>
              <li>Data portability where applicable</li>
              <li>Lodge a complaint with supervisory authorities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your experience on our platform. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@orsath.com<br />
                <strong>Phone:</strong> +1 (555) 123-4567<br />
                <strong>Address:</strong> 123 Finance Street, New York, NY 10001
              </p>
            </div>
          </section>
        </motion.div>
      </motion.div>
    </div>
  );
}