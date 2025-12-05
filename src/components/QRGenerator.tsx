import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Download, Link, Mail, Phone, Wifi, User, FileText, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState([256]);
  const [copied, setCopied] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);

  const generateQRValue = (): string => {
    switch (qrType) {
      case "url":
        return url || "https://lovable.dev";
      case "text":
        return text || "Hello World";
      case "email":
        const emailStr = `mailto:${email.address}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
        return emailStr;
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
  };

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = size[0];
      canvas.height = size[0];
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

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

    img.src = url;
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

        {/* Customization */}
        <div className="border-4 border-foreground bg-card p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">Customize</h2>
          
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
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
        <div className="border-4 border-foreground bg-card p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">Preview</h2>
          
          <div
            ref={qrRef}
            className="flex items-center justify-center p-8 border-2 border-foreground"
            style={{ backgroundColor: bgColor }}
          >
            <QRCodeSVG
              value={generateQRValue()}
              size={size[0]}
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
              includeMargin={false}
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
              Test your QR code before printing
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-foreground">→</span>
              WiFi QR codes work on iOS & Android
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-foreground">→</span>
              vCard QR saves contact info instantly
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
