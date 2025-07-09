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

export default function Terms() {
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
          Terms of Service
        </motion.h1>
        
        <motion.div className="prose prose-lg max-w-none" variants={fadeInUp}>
          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">1. Agreement to Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using ORSATH services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">2. Service Description</h2>
            <p className="text-gray-700 mb-4">
              ORSATH provides qualitative investment research services including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Investment analysis and research reports</li>
              <li>Market news and insights</li>
              <li>Portfolio tracking and analytics</li>
              <li>Custom research services</li>
              <li>Educational content and resources</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">3. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              To access certain features of our service, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Providing accurate and complete information</li>
              <li>Updating your information as necessary</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">4. Subscription and Payment</h2>
            <p className="text-gray-700 mb-4">
              Our services are offered on a subscription basis. By subscribing, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Pay all charges and fees associated with your subscription</li>
              <li>Automatic renewal unless cancelled before the renewal date</li>
              <li>Current pricing and billing terms as displayed on our website</li>
              <li>No refunds for partial months or unused portions of your subscription</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">5. Investment Disclaimer</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-gray-700 font-semibold">
                IMPORTANT: Our research and analysis are for informational purposes only and should not be considered as investment advice.
              </p>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Past performance does not guarantee future results</li>
              <li>All investments carry inherent risks</li>
              <li>You should consult with a qualified financial advisor before making investment decisions</li>
              <li>We are not responsible for any investment losses</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">6. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              All content, research, and materials provided through our service are protected by intellectual property laws. You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Reproduce, distribute, or display our content without permission</li>
              <li>Use our research for commercial purposes beyond your subscription</li>
              <li>Reverse engineer or attempt to extract data from our platform</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">7. Prohibited Uses</h2>
            <p className="text-gray-700 mb-4">
              You agree not to use our service for any unlawful purpose or in any way that could harm our business or other users:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Violating any applicable laws or regulations</li>
              <li>Transmitting harmful or malicious code</li>
              <li>Attempting to gain unauthorized access to our systems</li>
              <li>Harassing or threatening other users</li>
              <li>Interfering with the proper functioning of our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">8. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              To the maximum extent permitted by law, ORSATH shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Investment losses or missed opportunities</li>
              <li>Loss of profits or business interruption</li>
              <li>Data loss or corruption</li>
              <li>Service downtime or technical issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">9. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account immediately, without prior notice, for any reason including but not limited to breach of these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">10. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through our platform. Continued use of our service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">11. Contact Information</h2>
            <p className="text-gray-700">
              For questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@orsath.com<br />
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