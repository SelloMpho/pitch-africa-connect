import { CheckCircle2 } from "lucide-react";

const entrepreneurSteps = [
  {
    number: "01",
    title: "Create Your Profile",
    description: "Sign up as an entrepreneur and build your startup's profile with key information, pitch deck, and funding goals."
  },
  {
    number: "02",
    title: "Showcase Your Vision",
    description: "Add compelling content—videos, traction data, market analysis—to attract the right investors."
  },
  {
    number: "03",
    title: "Get Discovered",
    description: "Verified investors browse and filter startups. Your pitch appears in search results matching their criteria."
  },
  {
    number: "04",
    title: "Connect & Close",
    description: "Engage with interested investors through secure messaging and video calls to move deals forward."
  }
];

const investorSteps = [
  {
    number: "01",
    title: "Sign Up & Verify",
    description: "Create an investor account and complete KYC verification to access the full startup database."
  },
  {
    number: "02",
    title: "Discover Opportunities",
    description: "Use advanced filters to find startups by industry, stage, location, and funding requirements."
  },
  {
    number: "03",
    title: "Review Pitches",
    description: "Access detailed pitch pages with decks, financials, traction metrics, and team information."
  },
  {
    number: "04",
    title: "Engage Directly",
    description: "Reach out to promising startups via secure messaging and schedule video meetings."
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            How <span className="text-secondary">PitchPoint</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Simple, transparent process for both entrepreneurs and investors
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Entrepreneurs */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">For Entrepreneurs</h3>
            </div>
            <div className="space-y-6">
              {entrepreneurSteps.map((step, index) => (
                <div key={index} className="flex gap-6 group">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-[image:var(--gradient-primary)] transition-all duration-300">
                      <span className="text-2xl font-bold text-primary group-hover:text-primary-foreground transition-colors">
                        {step.number}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="text-lg font-bold text-foreground mb-2">{step.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investors */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-[image:var(--gradient-success)] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">For Investors</h3>
            </div>
            <div className="space-y-6">
              {investorSteps.map((step, index) => (
                <div key={index} className="flex gap-6 group">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-[image:var(--gradient-success)] transition-all duration-300">
                      <span className="text-2xl font-bold text-secondary group-hover:text-secondary-foreground transition-colors">
                        {step.number}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="text-lg font-bold text-foreground mb-2">{step.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
