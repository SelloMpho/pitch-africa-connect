import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Target } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="South African entrepreneurs collaborating" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[image:var(--gradient-overlay)]"></div>
        <div className="absolute inset-0 bg-primary/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full text-accent-foreground">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Connecting South African Innovation</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
            Connect Your Vision
            <br />
            <span className="text-accent">With Capital & Mentorship</span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-primary-foreground/90 leading-relaxed">
            PitchPoint empowers South African entrepreneurs to showcase their startups 
            and connect with investors, mentors, and strategic partners—all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/auth?mode=signup&role=entrepreneur">
              <Button variant="hero" size="xl" className="group min-w-[200px]">
                Start Your Pitch
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth?mode=signup&role=investor">
              <Button variant="success" size="xl" className="min-w-[200px]">
                <Target className="w-5 h-5" />
                Find Opportunities
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 max-w-4xl mx-auto">
            <div className="p-6 bg-card/10 backdrop-blur-md rounded-xl border border-primary-foreground/20">
              <div className="text-4xl font-bold text-accent mb-2">500+</div>
              <div className="text-primary-foreground/80 font-medium">Active Startups</div>
            </div>
            <div className="p-6 bg-card/10 backdrop-blur-md rounded-xl border border-primary-foreground/20">
              <div className="text-4xl font-bold text-secondary mb-2">200+</div>
              <div className="text-primary-foreground/80 font-medium">Verified Investors</div>
            </div>
            <div className="p-6 bg-card/10 backdrop-blur-md rounded-xl border border-primary-foreground/20">
              <div className="text-4xl font-bold text-accent mb-2">R50M+</div>
              <div className="text-primary-foreground/80 font-medium">Capital Connected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};
