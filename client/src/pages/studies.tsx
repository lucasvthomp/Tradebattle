import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Study } from "@shared/schema";
import { TrendingUp, Search, Newspaper, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Studies() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { data: studies, isLoading } = useQuery<Study[]>({
    queryKey: ["/api/studies"],
  });

  const categories = [
    { id: "all", label: "All Studies", icon: TrendingUp },
    { id: "Case Study", label: "Case Studies", icon: Search },
    { id: "Analysis", label: "Analysis", icon: Newspaper },
    { id: "Research", label: "Research", icon: Search },
  ];

  const filteredStudies = studies?.filter(study => 
    selectedCategory === "all" || study.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold text-black mb-6">Research Studies</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                In-depth analysis and case studies from our research team. Discover the qualitative insights that drive investment decisions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-2"
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Studies Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="h-20 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredStudies && filteredStudies.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStudies.map((study, index) => (
                  <motion.div
                    key={study.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <TrendingUp className="text-black mr-3 w-5 h-5" />
                          <span className="text-sm text-gray-500">{study.category}</span>
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">{study.title}</h3>
                        <p className="text-gray-600 mb-4 flex-1">{study.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {new Date(study.publishedAt!).toLocaleDateString()}
                          </span>
                          <Button variant="ghost" size="sm" className="hover:text-black">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Studies Found</h3>
                  <p className="text-gray-600 mb-6">
                    {selectedCategory === "all" 
                      ? "No studies are available at the moment. Check back later for new research."
                      : `No studies found in the ${selectedCategory} category.`
                    }
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCategory("all")}
                    className="mx-auto"
                  >
                    View All Studies
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-black mb-4">
                Want to Access Premium Research?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join our platform to get access to exclusive research studies and detailed analysis reports.
              </p>
              <Button 
                size="lg" 
                className="bg-black text-white hover:bg-gray-800"
                onClick={() => window.location.href = "/api/login"}
              >
                Get Access Now
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
