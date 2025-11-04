import React from 'react';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import ProblemSection from '@/components/landing/ProblemSection';
import SolutionSection from '@/components/landing/SolutionSection';
import HowItWorks from '@/components/landing/HowItWorks';
import TargetAudience from '@/components/landing/TargetAudience';
import FAQ from '@/components/landing/FAQ';
import CTAFinal from '@/components/landing/CTAFinal';
import Footer from '@/components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <TargetAudience />
      <FAQ />
      <CTAFinal />
      <Footer />
    </div>
  );
};

export default LandingPage;