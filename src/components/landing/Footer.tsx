import { Link } from "react-router-dom";
import { Phone, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  const links = {
    Product: [{ name: "Features", href: "#features" }, { name: "Pricing", href: "#pricing" }, { name: "Integrations", href: "#" }],
    Company: [{ name: "About", href: "#" }, { name: "Blog", href: "#" }, { name: "Contact", href: "#" }],
    Resources: [{ name: "Documentation", href: "#" }, { name: "Help Center", href: "#" }],
    Legal: [{ name: "Privacy", href: "#" }, { name: "Terms", href: "#" }, { name: "GDPR", href: "#" }],
  };

  return (
    <footer className="landing-theme border-t border-white/5">
      <div className="absolute inset-0 bg-[hsl(240_10%_4%)]" />
      <div className="container relative z-10 mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(265_97%_64%)] to-[hsl(220_95%_65%)] flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-semibold text-white">Callisto</span>
            </Link>
            <p className="text-white/40 text-sm mb-6 max-w-xs">AI-powered voice receptionist for healthcare providers.</p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-medium text-white mb-4">{category}</h4>
              <ul className="space-y-3">
                {items.map((link) => (
                  <li key={link.name}><a href={link.href} className="text-sm text-white/40 hover:text-white transition-colors">{link.name}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">© {new Date().getFullYear()} Callisto. All rights reserved.</p>
          <p className="text-sm text-white/40">Made with ❤️ in the Netherlands</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
