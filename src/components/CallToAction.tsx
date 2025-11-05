import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const CallToAction = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[image:var(--gradient-hero)] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full text-accent-foreground mb-8">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold">Join South Africa's Innovation Network</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
          Ready to Take Your Startup
          <br />
          <span className="text-accent">To the Next Level?</span>
        </h2>

        <p className="text-xl sm:text-2xl text-primary-foreground/90 mb-10 leading-relaxed max-w-2xl mx-auto">
          Whether you're raising capital or seeking investment opportunities, 
          PitchPoint is your gateway to meaningful connections.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/auth?mode=signup&role=entrepreneur">
            <Button variant="hero" size="xl" className="group min-w-[220px] bg-accent hover:bg-accent/90 text-accent-foreground">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/auth?mode=signup&role=investor">
            <Button 
              size="xl" 
              className="min-w-[220px] bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              Explore Opportunities
            </Button>
          </Link>
        </div>

        <p className="text-primary-foreground/70 mt-8">
          No credit card required • Free tier available • Join 500+ startups
        </p>
      </div>
    </section>
  );
};
