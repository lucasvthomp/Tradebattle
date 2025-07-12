import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  const features = [
    "Real-time leaderboards and rankings",
    "Virtual portfolios with real market data",
    "Multiple competition formats and prizes",
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-black mb-6">Why Choose Us</h2>
              <p className="text-gray-600 mb-6">
                Our platform bridges the gap between aspiring traders and competitive trading. 
                Experience real market conditions with virtual money, learn from other participants,
                and compete for prizes in a risk-free environment.
              </p>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="text-black w-5 h-5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="bg-gray-50 rounded-lg p-6 h-80">
                <h3 className="text-lg font-semibold mb-4">Platform Activity</h3>
                <div className="space-y-4">
                  {[
                    { label: "Active Traders", value: 95 },
                    { label: "Daily Competitions", value: 85 },
                    { label: "Market Coverage", value: 90 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-black h-2 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.value}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          viewport={{ once: true }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
