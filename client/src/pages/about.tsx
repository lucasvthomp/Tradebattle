import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Brain, TrendingUp, Users } from "lucide-react";

const founders = [
  {
    name: "Marcus Orellana",
    role: "CEO & Chief Investment Officer",
    description: "Former Goldman Sachs analyst with 15+ years in qualitative research. Specializes in technology and healthcare sectors.",
    expertise: ["Tech Analysis", "Healthcare", "M&A Research"]
  },
  {
    name: "Isabella Santos",
    role: "CTO & Head of Research",
    description: "Previously at McKinsey & Company, leading digital transformation in financial services. Expert in emerging markets analysis.",
    expertise: ["Emerging Markets", "Digital Finance", "ESG Analysis"]
  },
  {
    name: "Alexander Thompson",
    role: "Head of Client Relations",
    description: "Former institutional sales director at Morgan Stanley. Focused on building long-term client relationships and custom research solutions.",
    expertise: ["Institutional Sales", "Client Strategy", "Custom Research"]
  }
];

const values = [
  {
    icon: <Brain className="w-8 h-8" />,
    title: "Qualitative Focus",
    description: "We believe the best investment decisions come from understanding the human factors behind market movements, not just the numbers."
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Independent Research",
    description: "Our research is completely independent, unbiased, and focused solely on providing value to our subscribers."
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Client-Centric",
    description: "Every piece of research is designed with our clients' investment success in mind, delivered with clarity and actionable insights."
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: "Excellence Standard",
    description: "We maintain the highest standards in research quality, ensuring every analysis meets institutional-grade requirements."
  }
];

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

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.section 
        className="py-20 px-4"
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6 text-black"
            variants={fadeInUp}
          >
            About ORSATH
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Founded by three high school juniors with a passion for qualitative investment research, ORSATH represents the next generation of financial analysis.
          </motion.p>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section 
        className="py-16 px-4 bg-gray-50"
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h2 className="text-3xl font-bold mb-6 text-black">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              To democratize access to institutional-quality investment research by focusing on the qualitative factors that drive market success. We believe that understanding the human elements behind financial decisions is key to superior investment outcomes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full border-0 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-black text-white">
                        {value.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-black">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-center">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section 
        className="py-20 px-4"
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-3xl font-bold mb-6 text-black">Meet the Founders</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three ambitious students combining traditional investment principles with modern analytical techniques.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {founders.map((founder, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full border-2 border-gray-200 hover:border-black transition-colors duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                    <CardTitle className="text-xl font-bold text-black">
                      {founder.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 font-medium">
                      {founder.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 mb-4">{founder.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {founder.expertise.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="bg-gray-100">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="py-16 px-4 bg-black text-white"
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h2 className="text-3xl font-bold mb-6">Our Impact</h2>
            <p className="text-xl text-gray-300">
              Building the future of investment research, one analysis at a time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <motion.div variants={fadeInUp}>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-gray-300">Research Studies</div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-gray-300">Active Subscribers</div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-gray-300">Client Satisfaction</div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-gray-300">Research Coverage</div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}