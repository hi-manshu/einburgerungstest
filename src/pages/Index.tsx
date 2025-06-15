import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, CheckCircle, BookOpen, ChevronRight } from 'lucide-react';
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchQuestions, fetchStates } from "@/utils/dataService";
import DownloadQuestionsCard from "@/components/DownloadQuestionsCard";

const testimonials = [
  {
    name: "Fatima H.",
    text: "I aced my German citizenship test after just a week of practicing here! The explanations and timed mode made it easy to review.",
    avatar: "https://randomuser.me/api/portraits/women/60.jpg",
    state: "Berlin",
  },
  {
    name: "Raj S.",
    text: "This is by far the easiest and most friendly way to prepare. Loved the flashcards and the up-to-date state questions.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    state: "Bayern",
  },
  {
    name: "Maria S.",
    text: "Passed on my first try! The mock exam felt just like the real thing.",
    avatar: "https://randomuser.me/api/portraits/women/51.jpg",
    state: "Hamburg",
  },
];

const features = [
  {
    title: "State-Specific Test",
    description: "Practice questions specific to your German state.",
    icon: CheckCircle,
    path: "/state-test",
  },
  {
    title: "Comprehensive Knowledge Test",
    description: "Master all general questions plus state-specific content for complete preparation.",
    icon: BookOpen,
    path: "/general-test",
  },
  {
    title: "Official Mock Exam",
    description: "Take a full practice exam with 33 questions in 60 minutes.",
    icon: Clock,
    path: "/mock-exam",
  },
  {
    title: "Flashcards",
    description: "Quick practice with timed questions from all categories.",
    icon: Play,
    path: "/flashcards",
  },
  {
    title: "Topic-based Practice",
    description: "Select and practice by specific topics across all questions.",
    icon: BookOpen,
    path: "/topic-practice"
  },
];

const steps = [
  {
    title: "1. Choose Your Mode",
    text: "Take a Mock Exam, State-specific questions, or use Flashcards.",
  },
  {
    title: "2. Practice & Learn",
    text: "Track your progress with instant feedback and explanations.",
  },
  {
    title: "3. Pass With Confidence",
    text: "Simulate the official timing, review weaknesses, and succeed!",
  },
];

function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0);
  React.useEffect(() => {
    const tm = setInterval(() => setIdx(i => (i + 1) % testimonials.length), 3500);
    return () => clearInterval(tm);
  }, []);
  const t = testimonials[idx];
  return (
    <div className="w-full flex flex-col items-center justify-center py-8 animate-fade-in">
      <div className="rounded-full border-2 border-primary/50 p-1 shadow-lg mb-2 bg-white dark:bg-zinc-900">
        <img src={t.avatar} alt={t.name} className="rounded-full h-14 w-14 object-cover" />
      </div>
      <p className="text-lg italic font-semibold text-primary mb-1 max-w-lg text-center">"{t.text}"</p>
      <div className="text-sm text-muted-foreground">{t.name} — {t.state}</div>
      <div className="flex gap-2 mt-2">
        {testimonials.map((_, i) =>
          <button key={i}
            aria-label={`Go to testimonial ${i+1}`}
            className={`h-2.5 w-2.5 rounded-full transition ${i === idx ? "bg-primary/80" : "bg-muted"}`}
            onClick={() => setIdx(i)}
          />
        )}
      </div>
    </div>
  );
}

const Index = () => {
  const navigate = useNavigate();

  // -- get states & questions for the PDF button --
  const { data: states = [], isLoading: statesLoading } = useQuery({
    queryKey: ["states"],
    queryFn: fetchStates,
  });
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ["questions", states],
    queryFn: () => fetchQuestions(states),
    enabled: !!states && states.length > 0,
  });

  const isLoading = statesLoading || questionsLoading;

  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen">
      {/* HERO */}
      <div className="gradient-bg pt-16 pb-20 relative flex flex-col items-center justify-center">
        <div className="container px-4 flex flex-col items-center justify-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight mb-4 text-center animate-fade-in">
            Ace your{" "}
            <span
              className="bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(85deg, #DD1E2F 0%, #FFCD00 80%)',
              }}
            >
              German Citizenship
            </span>{" "}
            Test
          </h1>
          <div className="mt-2 text-lg md:text-2xl font-bold opacity-80 mb-0 text-center animate-fade-in">
            Pass the Einbürgerungstest with the most trusted, up-to-date practice system.
          </div>
          <div className="text-base md:text-lg font-semibold text-muted-foreground mb-2 mt-0 text-center">
            460+ official questions. Full mock exams. Every Bundesland covered.
          </div>
          <div className="my-7 flex flex-col sm:flex-row gap-3 items-center justify-center w-full animate-fade-in">
            <Button 
              size="lg"
              onClick={() => navigate('/mock-exam')}
              className={`
                font-extrabold border border-gray-200 dark:border-gray-700 shadow-md
                bg-black text-white
                dark:bg-white dark:text-black
                hover:bg-zinc-900 hover:text-white
                dark:hover:bg-neutral-100 dark:hover:text-black
                transition-colors
              `}
              style={{ borderWidth: 2, minWidth: 245 }}
            >
              <Clock className="mr-2 h-5 w-5" />
              Take Mock Exam Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/general-test')}
              className="border-2 min-w-[180px]"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Browse Questions
            </Button>
          </div>
        </div>
      </div>
      {/* How it works */}
      <section className="container px-4 pt-6 pb-8 md:pt-12 md:pb-12 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
        <div className="flex flex-col md:flex-row gap-6 justify-center items-start md:items-stretch">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`bg-card p-6 rounded-xl shadow-sm flex-1 min-w-[200px] flex flex-col items-center border animate-fade-in`}
              style={{ animationDelay: `${60 * i}ms` as any }}
            >
              <div className="flex items-center justify-center mb-3">
                <span className="font-semibold text-lg">{step.title}</span>
              </div>
              <span className="text-base text-muted-foreground text-center">{step.text}</span>
            </div>
          ))}
        </div>
      </section>
      {/* Features grid */}
      <section className="py-10 bg-muted/30">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-center mb-10">
            <span className="text-black dark:text-white transition">
              All options to practice
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-7 max-w-4xl mx-auto">
            {/* Download All Questions Card now isolated */}
            <DownloadQuestionsCard
              states={states}
              questions={questions}
              isLoading={isLoading}
            />
            {/* The rest of the features */}
            {features.map((feature) => (
              <Card
                key={feature.title}
                className={`
                  group relative flex flex-col px-4 py-4 rounded-xl border bg-card
                  shadow-sm transition-all duration-200 hover:scale-[1.03]
                  cursor-pointer hover:-translate-y-1
                  focus-visible:scale-[1.03] ring-1 ring-transparent
                  hover:ring-primary/40
                  min-h-[150px] animate-fade-in
                `}
                onClick={() => navigate(feature.path)}
                tabIndex={0}
                role="button"
                style={{ minHeight: 0 }}
              >
                <CardHeader className="flex-row items-center gap-4 mb-1 p-0 pb-2">
                  <div className="bg-muted text-primary rounded-full p-2 shadow-sm">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base mb-1">{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto flex justify-end pt-2 p-0">
                  <Button
                    variant="secondary"
                    className="w-full mt-4 py-2 text-sm font-semibold"
                  >
                    Start Practice <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Remove Testimonials Section */}
      {/* Remove FAQ Section */}
      {/* Footer */}
      <footer className="mt-auto py-6 px-4 bg-background border-t text-center text-muted-foreground text-sm">
        Built by{" "}
        <a 
          href="https://github.com/hi-manshu"
          className="font-semibold underline underline-offset-2 hover:text-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Himanshu Singh
        </a>
        .{" "}
        <a
          href="https://buymeacoffee.com/himanshoe"
          className="font-semibold underline underline-offset-2 hover:text-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Sponsor to help build the project
        </a>
        .
      </footer>
    </div>
  );
};

export default Index;
