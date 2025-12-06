import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-xl shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-teal-light flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span
              className={`font-serif text-2xl font-medium transition-colors duration-300 ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
            >
              Callisto
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/demo"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isScrolled ? "text-muted-foreground" : "text-white/80"
              }`}
            >
              Try Demo
            </Link>
            <a
              href="#features"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isScrolled ? "text-muted-foreground" : "text-white/80"
              }`}
            >
              Features
            </a>
            <a
              href="#pricing"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isScrolled ? "text-muted-foreground" : "text-white/80"
              }`}
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isScrolled ? "text-muted-foreground" : "text-white/80"
              }`}
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isScrolled ? "text-muted-foreground" : "text-white/80"
              }`}
            >
              FAQ
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button
                variant={isScrolled ? "ghost" : "glass"}
                size="sm"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="hero" size="sm">
                Start Free Trial
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={isScrolled ? "text-foreground" : "text-white"} />
            ) : (
              <Menu className={isScrolled ? "text-foreground" : "text-white"} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 bg-white rounded-2xl shadow-xl animate-fade-in-down">
            <div className="flex flex-col gap-4">
              <Link to="/demo" className="text-foreground font-medium py-2">
                Try Demo
              </Link>
              <a href="#features" className="text-foreground font-medium py-2">
                Features
              </a>
              <a href="#pricing" className="text-foreground font-medium py-2">
                Pricing
              </a>
              <a href="#testimonials" className="text-foreground font-medium py-2">
                Testimonials
              </a>
              <a href="#faq" className="text-foreground font-medium py-2">
                FAQ
              </a>
              <hr className="border-border" />
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="hero" className="w-full">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
