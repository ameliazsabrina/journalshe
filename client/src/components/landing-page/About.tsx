"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Target, CheckCircle2 } from "lucide-react";

export default function About() {
  const [activeTab, setActiveTab] = useState("mission");

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

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-20 pb-10 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 dark:bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/4 -right-24 w-96 h-96 bg-secondary/10 dark:bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeIn}>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
                About Journalshe
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 dark:text-white/80 mb-10 max-w-3xl mx-auto text-center">
                Journalshe is a PKM-PM project by UII students from English
                Education, Informatics, and International Relations. Designed
                for schools, it helps students and teachers enhance English
                learning through AI-driven storytelling and feedback.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="pt-10 pb-16 bg-card/30 dark:bg-black/30">
        <div className="container mx-auto px-4">
          <Tabs
            defaultValue="mission"
            value={activeTab}
            onValueChange={setActiveTab}
            className="max-w-5xl mx-auto"
          >
            <TabsList className="grid grid-cols-3 mb-12">
              <TabsTrigger
                value="mission"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
              >
                <Target className="w-4 h-4 mr-2" /> Mission
              </TabsTrigger>
              <TabsTrigger
                value="story"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-white dark:data-[state=active]
                :text-black"
              >
                <BookOpen className="w-4 h-4 mr-2" /> Our Story
              </TabsTrigger>
              <TabsTrigger
                value="team"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
              >
                <Users className="w-4 h-4 mr-2" /> Team
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mission" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-center md:text-left">
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-center md:text-left">
                    Our Mission
                  </h2>
                  <p className="text-foreground/80 dark:text-white/80 mb-6 text-center md:text-left">
                    At Journalshe, our mission is to make English language
                    learning accessible, engaging, and effective for everyone.
                    We believe that storytelling is one of the most powerful
                    ways to learn a language. This project is part of our
                    commitment to community service through the PKM-PM 2025
                    competition, aiming to bring innovative educational
                    technology to schools.
                  </p>
                  <p className="text-foreground/80 dark:text-white/80 mb-6 text-center md:text-left">
                    By combining AI technology with proven language learning
                    methodologies, we create a personalized learning experience
                    that adapts to each student's needs, pace, and interests.
                    Our platform is designed for use by both students and
                    teachers, supporting classroom activities and independent
                    study alike.
                  </p>
                  <ul className="space-y-3 text-center md:text-left">
                    {[
                      "Personalized learning paths",
                      "AI-powered feedback",
                      "Gamification",
                      "Teacher-student collaboration",
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex flex-col items-center md:flex-row md:items-start md:justify-start"
                      >
                        <span className="flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-primary dark:text-white mr-2 mt-0.5" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative flex justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-white/10 dark:to-gray-700/20 rounded-2xl -z-10 blur-xl"></div>
                  <Image
                    src="/mission.jpg"
                    alt="Our mission illustration"
                    width={500}
                    height={400}
                    className="rounded-2xl shadow-xl aspect-[4/5] mx-auto"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="story" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-center md:text-left">
                <div className="order-2 md:order-1 relative flex justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-white/10 dark:to-gray-700/20 rounded-2xl -z-10 blur-xl"></div>
                  <Image
                    src="/story.jpg"
                    alt="Our story illustration"
                    width={500}
                    height={400}
                    className="rounded-2xl shadow-xl aspect-[4/5] object-cover mx-auto"
                  />
                </div>
                <div className="order-1 md:order-2">
                  <h2 className="text-3xl font-bold mb-6 text-center md:text-left">
                    Our Story
                  </h2>
                  <p className="text-foreground/80 dark:text-white/80 mb-6 text-center md:text-left">
                    Journalshe was founded in 2025 by a team of language
                    educators, AI specialists, and learning experience designers
                    from Universitas Islam Indonesia. Our team brings together
                    expertise from English Language Education, Informatics, and
                    Architecture, united by a passion for improving education
                    through technology.
                  </p>
                  <p className="text-foreground/80 dark:text-white/80 mb-6 text-center md:text-left">
                    Traditional language learning methods weren't engaging
                    enough, and existing apps weren't providing the personalized
                    feedback needed for true mastery. We set out to change that,
                    especially for school environments where both teachers and
                    students can benefit from innovative tools.
                  </p>
                  <p className="text-foreground/80 dark:text-white/80 text-center md:text-left">
                    Starting with English language learning, we've built a
                    platform that combines the best of AI technology with proven
                    language acquisition methods. Our journey is just beginning,
                    and we're excited to support schools and classrooms as we
                    expand to more languages and learning domains in the future.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="team" className="mt-0">
              <h2 className="text-3xl font-bold mb-10 text-center">
                Meet Our Team
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
                {[
                  {
                    name: "Attikah Dwi Riyani",
                    role: "English Education",
                    bio: "Language learning specialist focused on innovative teaching methodologies for high-schoolers.",
                    image: "/avatar1.svg",
                  },
                  {
                    name: "Firza Mulyana",
                    role: "English Education",
                    bio: "Curriculum developer specializing in interactive storytelling for language acquisition.",
                    image: "/avatar2.svg",
                  },
                  {
                    name: "Asriya Usman",
                    role: "English Education",
                    bio: "Assessment expert designing effective evaluation systems for language proficiency.",
                    image: "/avatar3.svg",
                  },
                  {
                    name: "Kamalia Salsabila",
                    role: "International Relations",
                    bio: "UX designer creating intuitive learning spaces and interface aesthetics for the platform.",
                    image: "/avatar4.svg",
                  },
                  {
                    name: "Amelia Zakiya Sabrina",
                    role: "Informatics",
                    bio: "Web developer and AI integration specialist developing the AI-powered features.",
                    image: "/avatar5.svg",
                  },
                ].map((member, index) => (
                  <div
                    key={index}
                    className="bg-card dark:bg-black rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow dark:shadow-white/30"
                  >
                    <div className="w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full">
                      <Image
                        src={member.image || "/herosectionpic.jpg"}
                        alt={member.name}
                        width={128}
                        height={128}
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary dark:text-gray-300 text-center mb-4">
                      {member.role}
                    </p>
                    <p className="text-foreground/80 dark:text-white/80 text-center">
                      {member.bio}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
