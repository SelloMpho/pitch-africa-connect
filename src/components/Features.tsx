import { Rocket, Shield, MessageSquare, TrendingUp, Users, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Rocket,
    title: "Showcase Your Startup",
    description: "Create compelling pitch pages with decks, videos, traction data, and funding goals to attract the right investors.",
    color: "text-primary"
  },
  {
    icon: Target,
    title: "Smart Investor Matching",
    description: "Filter by industry, stage, location, and funding needs to find startups that align with your investment thesis.",
    color: "text-secondary"
  },
  {
    icon: Shield,
    title: "Verified & Secure",
    description: "KYC verification for investors and business registration checks ensure genuine, trustworthy connections.",
    color: "text-accent"
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "Secure messaging and integrated video calls enable seamless conversations between entrepreneurs and investors.",
    color: "text-primary"
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Analytics dashboard shows pitch views, investor interest, message engagement, and connection metrics.",
    color: "text-secondary"
  },
  {
    icon: Users,
    title: "Build Your Network",
    description: "Connect with mentors, strategic partners, and fellow entrepreneurs in South Africa's startup ecosystem.",
    color: "text-accent"
  }
];

export const Features = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            Everything You Need to <span className="text-primary">Connect & Grow</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            PitchPoint provides entrepreneurs and investors with powerful tools to discover opportunities, 
            build relationships, and drive business growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-[var(--shadow-strong)] transition-all duration-500 hover:-translate-y-2 border-border/50"
            >
              <CardHeader>
                <div className={`w-14 h-14 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
