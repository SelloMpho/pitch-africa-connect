import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-[image:var(--gradient-primary)] flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">P</span>
              </div>
              <span className="text-xl font-bold text-foreground">PitchPoint</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting South African entrepreneurs with investors, mentors, and opportunities.
            </p>
          </div>

          {/* For Entrepreneurs */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">For Entrepreneurs</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/auth?mode=signup&role=entrepreneur" className="text-muted-foreground hover:text-primary transition-colors">
                  Create Pitch
                </Link>
              </li>
              <li>
                <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* For Investors */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">For Investors</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/auth?mode=signup&role=investor" className="text-muted-foreground hover:text-primary transition-colors">
                  Join as Investor
                </Link>
              </li>
              <li>
                <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Browse Startups
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PitchPoint. All rights reserved. Empowering South African Innovation.</p>
        </div>
      </div>
    </footer>
  );
};
