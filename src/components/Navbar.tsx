import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-lg bg-[image:var(--gradient-primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-xl font-bold text-primary-foreground">P</span>
            </div>
            <span className="text-xl font-bold text-foreground">PitchPoint</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              How It Works
            </a>
            <Link to="/auth?mode=login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button variant="hero">Get Started</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border/50">
            <a
              href="#features"
              className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              How It Works
            </a>
            <div className="px-4 space-y-2 pt-2 border-t border-border/50">
              <Link to="/auth?mode=login" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full">Log In</Button>
              </Link>
              <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                <Button variant="hero" className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
