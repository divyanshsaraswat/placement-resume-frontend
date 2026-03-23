"use client";
import React from "react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { FeatureQuestions } from "@/components/landing/FeatureQuestions";
import { LandingWrapper } from "@/components/landing/LandingWrapper";

export default function Home() {
  return (
    <LandingWrapper>
      <Header />
      <Hero />
      <Features />
      <Testimonials />
      <FeatureQuestions />
    </LandingWrapper>
  );
}

