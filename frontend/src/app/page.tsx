"use client";

import AuthModals from "../components/auth/AuthModals";
import LandingHeader from "../components/landing/LandingHeader";
import HeroSection from "../components/landing/HeroSection";
import PersonalizationSection from "../components/landing/PersonalizationSection";
import MealRegistrationSection from "../components/landing/MealRegistrationSection";
import ReportsSection from "../components/landing/ReportsSection";
import WeightAndGamificationSection from "../components/landing/WeightAndGamificationSection";
import Footer from "../components/dashboard/Footer";
import CTASection from "../components/landing/CTASection";

export default function HomePage() {
  return (
    <>
      <AuthModals />
      <div className="force-light min-h-screen bg-white scroll-smooth">
        <LandingHeader />
        <main>
          <HeroSection />
          <PersonalizationSection />
          <MealRegistrationSection />
          <ReportsSection />
          <WeightAndGamificationSection />
        </main>
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
