import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  const features = [
    "Deep company research and analysis",
    "Real-time news and market sentiment",
    "Weekend research for Monday opportunities",
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
              <h2 className="text-4xl font-bold text-black mb-6">Our Approach</h2>
              <p className="text-gray-600 mb-6">
                While most investment firms rely on numerical data and technical analysis, we focus on
                in-depth qualitative research. We analyze company fundamentals, market conditions, and
                real-world events that drive stock movements.
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
                <h3 className="text-lg font-semibold mb-4">Research Impact Analysis</h3>
                <div className="space-y-4">
                  {[
                    { label: "Company Analysis", value: 85 },
                    { label: "Market Sentiment", value: 70 },
                    { label: "News Impact", value: 90 },
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
