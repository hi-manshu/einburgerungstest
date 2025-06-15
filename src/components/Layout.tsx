
import { Link, Outlet } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Heart, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageProvider } from "./LanguageContext";

export function Layout() {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
          <div className="container flex h-14 items-center">
            <Link to="/" className="flex items-center space-x-2 mr-auto">
              <img src="/icon.svg" alt="German Quiz" className="h-8 w-8" />
            </Link>
            <nav className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm"
                asChild
              >
                <a
                  href="https://github.com/hi-manshu/einburgerungstest"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-sm"
                asChild
                style={{
                  background: "#FFCD00",
                  color: "#222",
                  borderColor: "#FFCD00",
                  borderWidth: 1,
                  borderRadius: 8, // only slight rounding, not full/huge
                  fontWeight: 700
                }}
              >
                <a
                  href="https://buymeacoffee.com/himanshoe"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontWeight: 700 }}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Sponsor
                </a>
              </Button>
              {/* SettingsDialog removed */}
              <ThemeToggle />
            </nav>
          </div>
          <style>
            {`
              .sponsor-animated-border {
                border-radius: 9999px;
                position: relative;
                border: 1px solid transparent;
                z-index: 1;
              }
              .sponsor-animated-border::before {
                content: "";
                position: absolute;
                inset: -2px;
                border-radius: 9999px;
                pointer-events: none;
                z-index: 0;
                border-width: 1px;
                border-style: solid;
                border-color: #FFCD00;
                background: conic-gradient(
                  #FFCD00 0% 10%, 
                  #000 12% 19%, 
                  #D00 20% 32%, 
                  #FFCD00 33% 44%, 
                  #000 45% 69%, 
                  #D00 70% 80%, 
                  #FFCD00 81% 100%
                );
                -webkit-mask:
                  linear-gradient(#fff 0 0) content-box, 
                  linear-gradient(#fff 0 0);
                mask:
                  linear-gradient(#fff 0 0) content-box, 
                  linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                animation: sponsor-border-move 2.2s linear infinite;
              }
              @keyframes sponsor-border-move {
                0% { transform: rotate(0deg);}
                100% { transform: rotate(360deg);}
              }
            `}
          </style>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </LanguageProvider>
  );
}

