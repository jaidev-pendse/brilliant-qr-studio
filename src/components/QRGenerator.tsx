import { useState, useRef, useCallback } from "react";
import QRCodeStyling from "qr-code-styling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, Link, Mail, Phone, Wifi, User, FileText, Copy, Check, Palette, Frame, Sparkles, Image } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FrameSelector, type FrameType } from "./qr/FrameSelector";
import { DotStyleSelector, type DotStyle, type CornerStyle } from "./qr/DotStyleSelector";
import { LogoUploader } from "./qr/LogoUploader";
import { QRPreview } from "./qr/QRPreview";

type QRType = "url" | "text" | "email" | "phone" | "wifi" | "vcard";

interface WifiData {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
}

interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
}

const QRGenerator = () => {
  const [qrType, setQrType] = useState<QRType>("url");
  const [url, setUrl] = useState("https://lovable.dev");
  const [text, setText] = useState("");
  const [email, setEmail] = useState({ address: "", subject: "", body: "" });
  const [phone, setPhone] = useState("");
  const [wifi, setWifi] = useState<WifiData>({ ssid: "", password: "", encryption: "WPA" });
  const [vcard, setVcard] = useState<VCardData>({ firstName: "", lastName: "", phone: "", email: "", organization: "" });
  
  // Basic styling
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState([256]);
  
  // Advanced styling
  const [dotStyle, setDotStyle] = useState<DotStyle>("square");
  const [cornerStyle, setCornerStyle] = useState<CornerStyle>("square");
  
  // Frame settings
  const [frameType, setFrameType] = useState<FrameType>("none");
  const [frameText, setFrameText] = useState("SCAN ME");
  const [frameColor, setFrameColor] = useState("#000000");
  
  // Logo settings
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState([25]);
  
  const [copied, setCopied] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);

  const generateQRValue = useCallback((): string => {
    switch (qrType) {
      case "url":
        return url || "https://lovable.dev";
      case "text":
        return text || "Hello World";
      case "email":
        return `mailto:${email.address}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
      case "phone":
        return `tel:${phone}`;
      case "wifi":
        return `WIFI:T:${wifi.encryption};S:${wifi.ssid};P:${wifi.password};;`;
      case "vcard":
        return `BEGIN:VCARD
VERSION:3.0
N:${vcard.lastName};${vcard.firstName}
FN:${vcard.firstName} ${vcard.lastName}
TEL:${vcard.phone}
EMAIL:${vcard.email}
ORG:${vcard.organization}
END:VCARD`;
      default:
        return "https://lovable.dev";
    }
  }, [qrType, url, text, email, phone, wifi, vcard]);

  const downloadQR = async () => {
    const qrCode = new QRCodeStyling({
      width: size[0] * 2,
      height: size[0] * 2,
      data: generateQRValue(),
      dotsOptions: {
        color: fgColor,
        type: dotStyle,
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        color: fgColor,
        type: cornerStyle,
      },
      cornersDotOptions: {
        color: fgColor,
        type: cornerStyle === "square" ? "square" : "dot",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 4,
        imageSize: logoSize[0] / 100,
      },
      image: logo || undefined,
    });

    // Create canvas with frame
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const qrSize = size[0] * 2;
    const padding = frameType !== "none" ? 32 : 0;
    const bannerHeight = (frameType === "banner" || frameType === "scanme") ? 48 : 0;
    const totalWidth = qrSize + padding * 2;
    const totalHeight = qrSize + padding * 2 + bannerHeight;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Draw frame
    if (frameType !== "none") {
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 8;
      
      if (frameType === "rounded") {
        roundRect(ctx, 4, 4, totalWidth - 8, totalHeight - bannerHeight - 8, 24);
        ctx.stroke();
      } else if (frameType === "circle") {
        ctx.beginPath();
        const centerX = totalWidth / 2;
        const centerY = (totalHeight - bannerHeight) / 2;
        const radius = Math.min(centerX, centerY) - 4;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeRect(4, 4, totalWidth - 8, totalHeight - bannerHeight - 8);
      }
    }

    // Draw banner text
    if (frameType === "scanme") {
      ctx.fillStyle = frameColor;
      ctx.fillRect(0, 0, totalWidth, bannerHeight);
      ctx.fillStyle = bgColor;
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(frameText || "SCAN ME", totalWidth / 2, bannerHeight / 2);
    } else if (frameType === "banner") {
      ctx.fillStyle = frameColor;
      ctx.fillRect(0, totalHeight - bannerHeight, totalWidth, bannerHeight);
      ctx.fillStyle = bgColor;
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(frameText || "SCAN ME", totalWidth / 2, totalHeight - bannerHeight / 2);
    }

    // Get QR code as blob and draw it
    const blob = await qrCode.getRawData("png");
    if (blob && blob instanceof Blob) {
      const img = new window.Image();
      img.onload = () => {
        const yOffset = frameType === "scanme" ? bannerHeight : 0;
        ctx.drawImage(img, padding, padding + yOffset, qrSize, qrSize);
        
        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `qr-code-${qrType}.png`;
        link.href = pngUrl;
        link.click();
        
        toast({
          title: "Downloaded!",
          description: "Your QR code has been saved.",
        });
      };
      img.src = URL.createObjectURL(blob);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateQRValue());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "QR content copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const qrTypeIcons = {
    url: Link,
    text: FileText,
    email: Mail,
    phone: Phone,
    wifi: Wifi,
    vcard: User,
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="border-4 border-foreground bg-card p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">Select Type</h2>
          <Tabs value={qrType} onValueChange={(v) => setQrType(v as QRType)} className="w-full">
            <TabsList className="grid grid-cols-3 gap-2 h-auto bg-transparent p-0">
              {(Object.keys(qrTypeIcons) as QRType[]).map((type) => {
                const Icon = qrTypeIcons[type];
                return (
                  <TabsTrigger
                    key={type}
                    value={type}
                    className="border-2 border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background py-3 uppercase text-xs font-bold"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {type}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="mt-6 space-y-4">
              <TabsContent value="url" className="mt-0 space-y-4">
                <div>
                  <Label className="text-sm font-bold uppercase">Website URL</Label>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0 focus:border-foreground"
                  />
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-0 space-y-4">
                <div>
                  <Label className="text-sm font-bold uppercase">Your Text</Label>
                  <Input
                    placeholder="Enter any text..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
              </TabsContent>

              <TabsContent value="email" className="mt-0 space-y-4">
                <div>
                  <Label className="text-sm font-bold uppercase">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email.address}
                    onChange={(e) => setEmail({ ...email, address: e.target.value })}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase">Subject</Label>
                  <Input
                    placeholder="Email subject..."
                    value={email.subject}
                    onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase">Body</Label>
                  <Input
                    placeholder="Email body..."
                    value={email.body}
                    onChange={(e) => setEmail({ ...email, body: e.target.value })}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
              </TabsContent>

              <TabsContent value="phone" className="mt-0 space-y-4">
                <div>
                  <Label className="text-sm font-bold uppercase">Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
              </TabsContent>

              <TabsContent value="wifi" className="mt-0 space-y-4">
                <div>
                  <Label className="text-sm font-bold uppercase">Network Name (SSID)</Label>
                  <Input
                    placeholder="WiFi Name"
                    value={wifi.ssid}
                    onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase">Password</Label>
                  <Input
                    type="password"
                    placeholder="WiFi Password"
                    value={wifi.password}
                    onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase">Encryption</Label>
                  <div className="flex gap-2 mt-2">
                    {(["WPA", "WEP", "nopass"] as const).map((enc) => (
                      <Button
                        key={enc}
                        variant={wifi.encryption === enc ? "default" : "outline"}
                        size="sm"
                        onClick={() => setWifi({ ...wifi, encryption: enc })}
                        className="border-2 border-foreground font-bold"
                      >
                        {enc === "nopass" ? "None" : enc}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vcard" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-bold uppercase">First Name</Label>
                    <Input
                      placeholder="John"
                      value={vcard.firstName}
                      onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                      className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold uppercase">Last Name</Label>
                    <Input
                      placeholder="Doe"
                      value={vcard.lastName}
                      onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                      className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase">Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={vcard.phone}
                    onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase">Email</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={vcard.email}
                    onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase">Organization</Label>
                  <Input
                    placeholder="Company Name"
                    value={vcard.organization}
                    onChange={(e) => setVcard({ ...vcard, organization: e.target.value })}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Customization Accordion */}
        <div className="border-4 border-foreground bg-card shadow-md">
          <Accordion type="multiple" defaultValue={["colors"]} className="w-full">
            <AccordionItem value="colors" className="border-b-2 border-foreground">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  <span className="font-bold uppercase">Colors & Size</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-bold uppercase">Foreground</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-12 h-12 border-2 border-foreground cursor-pointer"
                        />
                        <Input
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="border-2 border-foreground bg-background font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-bold uppercase">Background</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-12 h-12 border-2 border-foreground cursor-pointer"
                        />
                        <Input
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="border-2 border-foreground bg-background font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-bold uppercase">Size</Label>
                      <span className="font-mono text-sm border-2 border-foreground px-2 py-1 bg-secondary">
                        {size[0]}px
                      </span>
                    </div>
                    <Slider
                      value={size}
                      onValueChange={setSize}
                      min={128}
                      max={512}
                      step={32}
                      className="py-4"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="style" className="border-b-2 border-foreground">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-bold uppercase">Dot Style</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <DotStyleSelector
                  dotStyle={dotStyle}
                  setDotStyle={setDotStyle}
                  cornerStyle={cornerStyle}
                  setCornerStyle={setCornerStyle}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="frame" className="border-b-2 border-foreground">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Frame className="w-5 h-5" />
                  <span className="font-bold uppercase">Frame</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <FrameSelector
                  frameType={frameType}
                  setFrameType={setFrameType}
                  frameText={frameText}
                  setFrameText={setFrameText}
                  frameColor={frameColor}
                  setFrameColor={setFrameColor}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="logo" className="border-none">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  <span className="font-bold uppercase">Logo</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <LogoUploader
                  logo={logo}
                  setLogo={setLogo}
                  logoSize={logoSize}
                  setLogoSize={setLogoSize}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
        <div className="border-4 border-foreground bg-card p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">Preview</h2>
          
          <div className="flex items-center justify-center p-8 border-2 border-foreground bg-muted/30">
            <QRPreview
              value={generateQRValue()}
              size={size[0]}
              fgColor={fgColor}
              bgColor={bgColor}
              dotStyle={dotStyle}
              cornerStyle={cornerStyle}
              logo={logo}
              logoSize={logoSize[0]}
              frameType={frameType}
              frameColor={frameColor}
              frameText={frameText}
              qrRef={qrRef}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button
              onClick={downloadQR}
              className="border-2 border-foreground font-bold uppercase py-6 shadow-sm hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PNG
            </Button>
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="border-2 border-foreground font-bold uppercase py-6 shadow-sm hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 mr-2" />
                  Copy Data
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <div className="border-4 border-foreground bg-secondary p-6 shadow-md">
          <h3 className="text-lg font-bold uppercase mb-2">Pro Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="font-bold text-foreground">→</span>
              Higher contrast colors scan better
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-foreground">→</span>
              Keep logos under 30% for reliability
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-foreground">→</span>
              Test your QR code before printing
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-foreground">→</span>
              Rounded dots give a modern look
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Helper function for rounded rectangles
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export default QRGenerator;
