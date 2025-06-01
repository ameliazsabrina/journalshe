"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { PointerHighlight } from "@/components/ui/pointer-highlight";

export default function HeroSection() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const heroImage = "/herosectionpic.jpg";

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  if (!mounted) return null;

  return (
    <section className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 dark:bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-secondary/10 dark:bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-primary/5 dark:bg-white/5 rounded-full blur-3xl" />
      </div>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
        className="w-full max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between mt-12 md:mt-24 relative z-10"
      >
        <motion.div
          variants={fadeIn}
          className="md:w-1/2 text-center md:text-left mb-12 md:mb-0 flex flex-col items-center md:items-start"
        >
          <Badge className="mb-4 bg-secondary/30 dark:bg-gray-900 text-primary dark:text-white hover:bg-secondary/40 dark:hover:bg-gray-800 transition-all mx-auto md:mx-0">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> AI-Powered Learning
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary dark:text-white leading-tight mb-6 text-center md:text-left">
            Master Your English,
            <br />
            <PointerHighlight>
              <span> One Story at a Time! </span>
            </PointerHighlight>
          </h1>

          <p className="text-foreground/90 dark:text-gray-300 text-lg md:text-xl mb-8 max-w-xl leading-relaxed mx-auto text-center md:text-left">
            Turn your daily thoughts into powerful stories and improve your
            English writing skills with AI-guided feedback with Journalshe!
            Complete themed writing tasks, track your progress, and climb the
            leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-center md:items-start md:justify-start">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-white dark:hover:bg-gray-200 dark:text-black rounded-full font-medium shadow-lg shadow-primary/20 dark:shadow-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 dark:hover:shadow-white/20 hover:translate-y-[-2px]"
            >
              <Link href="/get-started">Get Started</Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-secondary dark:border-gray-700 text-foreground dark:text-white hover:bg-secondary/20 dark:hover:bg-gray-900/50 hover:text-foreground dark:hover:text-white transition-all duration-300"
              onClick={() => {
                const section = document.getElementById("how-it-works");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              See How It Works
            </Button>
          </div>

          <div className="flex flex-col md:flex-col md:grid md:grid-cols-1 items-center md:items-start gap-6 text-sm text-foreground/70 dark:text-gray-300 w-full">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 dark:bg-white/10">
                <Check className="w-3 h-3 text-primary dark:text-white" />
              </div>
              <span>Personalized Lessons</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 dark:bg-white/10">
                <Check className="w-3 h-3 text-primary dark:text-white" />
              </div>
              <span>Track Progress</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 dark:bg-white/10">
                <Check className="w-3 h-3 text-primary dark:text-white" />
              </div>
              <span>AI Feedback</span>
            </div>
          </div>
        </motion.div>

        {/* Right side - Picture */}
        <motion.div
          variants={fadeIn}
          className="md:w-1/2 flex justify-center md:justify-end items-end relative w-full"
        >
          <div
            className="relative w-full max-w-md z-10 rounded-lg overflow-hidden shadow-lg shadow-primary/20 dark:shadow-white/10
              aspect-video h-48 sm:h-64 md:aspect-[3/4] md:h-[80vh] md:max-h-[700px] mx-auto"
          >
            <div className="animate-float w-full h-full">
              <Image
                src={heroImage}
                alt="Person writing stories with colorful notes"
                fill
                className="object-cover object-center w-full h-full transition-all duration-500"
                priority
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-sm text-foreground/60 dark:text-white/60 mb-2">
          Scroll to explore
        </span>
        <div className="w-6 h-10 border-2 border-foreground/20 dark:border-white/20 rounded-full flex justify-center pt-1">
          <motion.div
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 1.5,
            }}
            className="w-1.5 h-1.5 rounded-full bg-foreground/60 dark:bg-white/60"
          />
        </div>
      </motion.div>
    </section>
  );
}
