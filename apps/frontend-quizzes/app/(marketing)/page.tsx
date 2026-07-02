import FeaturedQuestions from "@/sections/FeaturedQuestions";
import Hero from "@/sections/Hero";
import LatestGuides from "@/sections/LatestGuides";
import PopularTopics from "@/sections/PopularTopics";
import FeaturedQuizzes from "@/sections/FeaturedQuizzes";
import RecentlyAdded from "@/sections/RecentlyAdded";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "FrontendPrep | Crack Frontend Interviews",
  },
  description:
    "Master React, JavaScript, CSS, Next.js and frontend system design interview questions with practical, detailed explanations.",
  alternates: {
    canonical: "/",
  },
};

const Home = () => {
  return (
    <div className="flex flex-col gap-6">
      <Hero />
      <PopularTopics />
      <RecentlyAdded />
      <FeaturedQuizzes />
      <FeaturedQuestions />
      <LatestGuides />
    </div>
  );
};



export default Home;
