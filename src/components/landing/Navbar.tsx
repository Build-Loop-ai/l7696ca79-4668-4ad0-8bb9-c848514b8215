import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/lib/site-config";
import { useSiteConfigTransformed } from "@/hooks/useSiteConfig";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { config } = useSiteConfigTransformed();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-4 md:top-6 left-0 right-0 mx-auto z-50 w-[90%] max-w-2xl"
      >
        <div
          className={`relative rounded-2xl transition-all duration-500 ${
            isScrolled
              ? "bg-[hsl(222,47%,8%)]/95"
              : "bg-[hsl(222,47%,8%)]/70"
          }`}
          style={{
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: isScrolled 
              ? "1px solid rgba(255,255,255,0.1)" 
              : "1px solid rgba(255,255,255,0.15)",
            boxShadow: isScrolled 
              ? "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)" 
              : "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-3">
            {/* Logo */}
            <Link to="/" className="group flex items-center gap-2">
              {config.logoUrl ? (
                <img 
                  src={config.logoUrl} 
                  alt={config.name} 
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span className="font-serif text-xl font-medium text-white tracking-tight">
                  {config.name.toLowerCase()}
                </span>
              )}
            </Link>

            {/* Desktop Navigation - centered */}
            <div className="hidden md:flex items-center gap-1 flex-shrink-0">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-all duration-200 whitespace-nowrap"
                >
                  {link.name}
                </a>
              ))}
              <Link
                to="/demo"
                className="px-4 py-2 text-sm font-medium text-teal hover:text-teal-light rounded-xl hover:bg-teal/10 transition-all duration-200 whitespace-nowrap"
              >
                Try Demo
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <button className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
                  Sign in
                </button>
              </Link>
              <Link to="/signup">
                <button 
                  className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, hsl(166 76% 36%) 0%, hsl(166 76% 28%) 100%)",
                    color: "white",
                    boxShadow: "0 2px 8px rgba(45, 180, 150, 0.3)",
                  }}
                >
                  Get Started
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 overflow-hidden rounded-2xl"
              style={{
                background: "rgba(20, 20, 30, 0.95)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="p-4 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block text-white/80 font-medium py-3 px-4 rounded-xl hover:bg-white/10 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <Link
                  to="/demo"
                  className="block text-teal font-medium py-3 px-4 rounded-xl hover:bg-teal/10 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Try Demo
                </Link>
                <div className="pt-3 mt-3 border-t border-white/10 space-y-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full py-3 text-white/70 font-medium rounded-xl hover:bg-white/10 transition-colors">
                      Sign in
                    </button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <button 
                      className="w-full py-3 font-medium rounded-xl text-white"
                      style={{
                        background: "linear-gradient(135deg, hsl(166 76% 36%) 0%, hsl(166 76% 28%) 100%)",
                      }}
                    >
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;