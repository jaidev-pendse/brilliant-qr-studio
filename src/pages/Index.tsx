import QRGenerator from "@/components/QRGenerator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { KeyboardShortcutsHelp } from "@/components/qr/KeyboardShortcutsHelp";
import { QrCode, Zap, Palette, Download, Shield, Smartphone } from "lucide-react";

const Index = () => {
  const features = [
    { icon: Zap, title: "Instant Generation", desc: "Real-time QR code preview" },
    { icon: Palette, title: "Full Customization", desc: "Custom colors & sizes" },
    { icon: Download, title: "High Quality Export", desc: "Download as PNG" },
    { icon: Shield, title: "Private & Secure", desc: "No data stored" },
    { icon: Smartphone, title: "Multiple Types", desc: "URL, WiFi, vCard & more" },
    { icon: QrCode, title: "Error Correction", desc: "High reliability scanning" },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b-4 border-foreground bg-secondary">
        <div className="container py-12 md:py-20">
          <div className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-2">
            <KeyboardShortcutsHelp />
            <ThemeToggle />
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-foreground bg-foreground flex items-center justify-center shadow-md">
                <QrCode className="w-10 h-10 md:w-12 md:h-12 text-background" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight mb-4">
              QR Code
              <br />
              <span className="inline-block border-4 border-foreground px-4 py-2 mt-2 bg-background shadow-sm">
                Generator
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mt-6">
              Create beautiful, customizable QR codes for URLs, WiFi, contacts, and more.
              Free, fast, and no sign-up required.
            </p>
          </div>
        </div>
      </header>

      {/* Features Bar */}
      <section className="border-b-4 border-foreground bg-card">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`p-4 md:p-6 text-center ${
                  i < features.length - 1 ? "border-r-2 border-foreground" : ""
                } ${i >= 2 && i < 4 ? "border-t-2 md:border-t-0 border-foreground" : ""} ${
                  i >= 4 ? "border-t-2 lg:border-t-0 border-foreground" : ""
                }`}
              >
                <feature.icon className="w-6 h-6 mx-auto mb-2" />
                <h3 className="font-bold text-xs uppercase">{feature.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Generator Section */}
      <section className="container py-12 md:py-16">
        <QRGenerator />
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-foreground bg-secondary">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-foreground bg-foreground flex items-center justify-center">
                <QrCode className="w-6 h-6 text-background" />
              </div>
              <span className="font-bold uppercase">QR Generator</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              Free QR code generator. No tracking. No sign-up required.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
