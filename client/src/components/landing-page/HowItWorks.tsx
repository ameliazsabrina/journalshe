"use client";
import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle, Edit, BarChart3, Phone } from "lucide-react";
import { Button } from "../ui/button";

const steps = [
  {
    icon: <Edit className="w-8 h-8 text-primary mb-2" />,
    title: "Write Your Story",
    description:
      "Start by writing your daily story or completing a themed writing task. Express your thoughts and practice your English skills.",
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-primary mb-2" />,
    title: "Get AI Feedback",
    description:
      "Receive instant, AI-powered feedback on your writing. Learn from suggestions and improve your grammar, vocabulary, and style.",
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-primary mb-2" />,
    title: "Track Your Progress",
    description:
      "Monitor your improvement over time, complete challenges, and climb the leaderboard as you master your English writing skills!",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section
      className="py-20 bg-background flex flex-col items-center"
      id="how-it-works"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-primary dark:text-white text-center">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl px-4">
        {steps.map((step, idx) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="flex flex-col items-center p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
              {step.icon}
              <CardTitle className="mb-2 text-xl text-center">
                {step.title}
              </CardTitle>
              <CardContent className="text-foreground/80 text-center">
                {step.description}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <section className="pt-32 pb-0 bg-card/30 dark:bg-black/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="text-foreground/80 dark:text-white/80 mb-8">
              Have questions about Journalshe? We'd love to hear from you!
            </p>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-white dark:hover:bg-gray-200 dark:text-black"
              onClick={() => {
                window.location.href = "https://wa.me/6285713578438";
              }}
            >
              <Phone className="w-4 h-4 mr-2" /> Contact Us
            </Button>
          </div>
        </div>
      </section>
    </section>
  );
};

export default HowItWorks;
