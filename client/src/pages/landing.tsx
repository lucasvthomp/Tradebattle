import Hero from "@/components/sections/hero";
import About from "@/components/sections/about";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Newspaper, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Study } from "@shared/schema";

export default function Landing() {
  const { data: featuredStudies, isLoading } = useQuery<Study[]>({
    queryKey: ["/api/studies/featured"],
  });

  return (
    <div>
      <Hero />
      <About />
      
      {/* Studies Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-black mb-6">Research Studies</h2>
                <p className="text-xl text-gray-600">
                  In-depth analysis and case studies from our research team
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="h-16 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : featuredStudies && featuredStudies.length > 0 ? (
                featuredStudies.slice(0, 3).map((study, index) => (
                  <motion.div
                    key={study.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <TrendingUp className="text-black mr-3 w-5 h-5" />
                          <span className="text-sm text-gray-500">{study.category}</span>
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">{study.title}</h3>
                        <p className="text-gray-600 mb-4">{study.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {new Date(study.publishedAt!).toLocaleDateString()}
                          </span>
                          <Button variant="ghost" size="sm" className="p-0">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-600">No featured studies available at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-black mb-6">Professional Tools</h2>
                <p className="text-xl text-gray-600">
                  Everything you need for qualitative investment research
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: Search,
                  title: "Company Research",
                  description: "Deep dive analysis tools",
                },
                {
                  icon: Newspaper,
                  title: "News Aggregator",
                  description: "Real-time news analysis",
                },
                {
                  icon: TrendingUp,
                  title: "Sentiment Tracker",
                  description: "Market sentiment analysis",
                },
                {
                  icon: TrendingUp,
                  title: "Watchlist",
                  description: "Custom research lists",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <feature.icon className="text-black mr-2 w-5 h-5" />
                        <h4 className="font-semibold text-black">{feature.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
