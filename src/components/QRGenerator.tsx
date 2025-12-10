import { useState, useRef, useCallback } from "react";
import QRCodeStyling from "qr-code-styling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, Link, Mail, Phone, Wifi, User, FileText, Copy, Check, Palette, Frame, Sparkles, Image, Settings2, MessageSquare, MapPin, Calendar, Share2, LayoutTemplate, Wand2, Layers, Film, Layers2, Accessibility } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FrameSelector, type FrameType } from "./qr/FrameSelector";
import { DotStyleSelector, type DotStyle, type CornerStyle } from "./qr/DotStyleSelector";
import { LogoUploader } from "./qr/LogoUploader";
import { QRPreview } from "./qr/QRPreview";
import { ExportOptions, type ErrorCorrectionLevel, type Resolution } from "./qr/ExportOptions";
import { QRHistory } from "./qr/QRHistory";
import { QRTemplates, type QRTemplate } from "./qr/QRTemplates";
import { useQRHistory, type QRHistoryItem } from "@/hooks/useQRHistory";
import { GradientPicker, type GradientConfig } from "./qr/GradientPicker";
import { BackgroundImageUploader, type BackgroundConfig } from "./qr/BackgroundImageUploader";
import { CornerBadge, type CornerBadgeConfig } from "./qr/CornerBadge";
import { ShapeMask, type ShapeType } from "./qr/ShapeMask";
import { AnimationOptions, type AnimationConfig, getAnimationDuration } from "./qr/AnimationOptions";
import { generateSpriteSheet } from "@/lib/gifEncoder";
import { ShareOptions } from "./qr/ShareOptions";
import { PrintPreview } from "./qr/PrintPreview";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { BatchGenerator } from "./qr/BatchGenerator";
import { BatchPreview } from "./qr/BatchPreview";
import { BatchQRItem, BatchQRConfig } from "@/lib/batchExport";
import { AccessibilityOptions } from "./qr/AccessibilityOptions";

type GeneratorMode = "single" | "batch" | "accessibility";

type QRType = "url" | "text" | "email" | "phone" | "wifi" | "vcard" | "sms" | "location" | "calendar" | "social";

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

interface SmsData {
  phone: string;
  message: string;
}

interface LocationData {
  latitude: string;
  longitude: string;
  label: string;
}

interface CalendarData {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
  location: string;
}

interface SocialData {
  platform: "instagram" | "twitter" | "linkedin" | "tiktok" | "facebook" | "youtube";
  username: string;
}

const QRGenerator = () => {
  const [qrType, setQrType] = useState<QRType>("url");
  const [url, setUrl] = useState("https://lovable.dev");
  const [text, setText] = useState("");
  const [email, setEmail] = useState({ address: "", subject: "", body: "" });
  const [phone, setPhone] = useState("");
  const [wifi, setWifi] = useState<WifiData>({ ssid: "", password: "", encryption: "WPA" });
  const [vcard, setVcard] = useState<VCardData>({ firstName: "", lastName: "", phone: "", email: "", organization: "" });
  const [sms, setSms] = useState<SmsData>({ phone: "", message: "" });
  const [location, setLocation] = useState<LocationData>({ latitude: "", longitude: "", label: "" });
  const [calendar, setCalendar] = useState<CalendarData>({ 
    title: "", 
    startDate: "", 
    startTime: "", 
    endDate: "", 
    endTime: "", 
    description: "", 
    location: "" 
  });
  const [social, setSocial] = useState<SocialData>({ platform: "instagram", username: "" });
  
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
  
  // Export settings
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("H");
  const [transparentBg, setTransparentBg] = useState(false);
  const [resolution, setResolution] = useState<Resolution>(2);
  
  // Advanced styling - Phase A
  const [gradient, setGradient] = useState<GradientConfig>({
    enabled: false,
    type: "linear",
    color1: "#000000",
    color2: "#333333",
    rotation: 45,
  });
  const [background, setBackground] = useState<BackgroundConfig>({
    enabled: false,
    image: null,
    opacity: 50,
    blur: 0,
  });
  const [cornerBadge, setCornerBadge] = useState<CornerBadgeConfig>({
    enabled: false,
    image: null,
    position: "bottom-right",
    size: 10,
  });
  const [shapeMask, setShapeMask] = useState<ShapeType>("square");
  const [animation, setAnimation] = useState<AnimationConfig>({
    enabled: false,
    type: "none",
    speed: "medium",
  });
  
  const [copied, setCopied] = useState(false);
  
  // Mode state
  const [generatorMode, setGeneratorMode] = useState<GeneratorMode>("single");
  const [batchItems, setBatchItems] = useState<BatchQRItem[]>([]);
  const [showBatchPreview, setShowBatchPreview] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);
  
  // History hook
  const { history, addToHistory, toggleFavorite, removeFromHistory, clearHistory } = useQRHistory();

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
      case "sms":
        return `sms:${sms.phone}${sms.message ? `?body=${encodeURIComponent(sms.message)}` : ""}`;
      case "location":
        if (location.latitude && location.longitude) {
          return `geo:${location.latitude},${location.longitude}${location.label ? `?q=${encodeURIComponent(location.label)}` : ""}`;
        }
        return `geo:0,0?q=${encodeURIComponent(location.label || "Location")}`;
      case "calendar": {
        const formatDateTime = (date: string, time: string) => {
          if (!date) return "";
          const d = new Date(`${date}T${time || "00:00"}`);
          return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
        };
        const dtStart = formatDateTime(calendar.startDate, calendar.startTime);
        const dtEnd = formatDateTime(calendar.endDate || calendar.startDate, calendar.endTime || calendar.startTime);
        return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${calendar.title}
DTSTART:${dtStart}
DTEND:${dtEnd}
DESCRIPTION:${calendar.description}
LOCATION:${calendar.location}
END:VEVENT
END:VCALENDAR`;
      }
      case "social": {
        const socialUrls: Record<SocialData["platform"], string> = {
          instagram: `https://instagram.com/${social.username}`,
          twitter: `https://twitter.com/${social.username}`,
          linkedin: `https://linkedin.com/in/${social.username}`,
          tiktok: `https://tiktok.com/@${social.username}`,
          facebook: `https://facebook.com/${social.username}`,
          youtube: `https://youtube.com/@${social.username}`,
        };
        return socialUrls[social.platform];
      }
      default:
        return "https://lovable.dev";
    }
  }, [qrType, url, text, email, phone, wifi, vcard]);

  const createQRCodeInstance = (multiplier: number) => {
    const dotsOptions = gradient.enabled
      ? {
          gradient: {
            type: gradient.type as "linear" | "radial",
            rotation: gradient.rotation * (Math.PI / 180),
            colorStops: [
              { offset: 0, color: gradient.color1 },
              { offset: 1, color: gradient.color2 },
            ],
          },
          type: dotStyle,
        }
      : {
          color: fgColor,
          type: dotStyle,
        };

    const cornersOptions = gradient.enabled
      ? {
          gradient: {
            type: gradient.type as "linear" | "radial",
            rotation: gradient.rotation * (Math.PI / 180),
            colorStops: [
              { offset: 0, color: gradient.color1 },
              { offset: 1, color: gradient.color2 },
            ],
          },
          type: cornerStyle,
        }
      : {
          color: fgColor,
          type: cornerStyle,
        };

    return new QRCodeStyling({
      width: size[0] * multiplier,
      height: size[0] * multiplier,
      data: generateQRValue(),
      qrOptions: {
        errorCorrectionLevel: errorLevel,
      },
      dotsOptions,
      backgroundOptions: {
        color: transparentBg ? "transparent" : bgColor,
      },
      cornersSquareOptions: cornersOptions,
      cornersDotOptions: gradient.enabled
        ? {
            gradient: {
              type: gradient.type as "linear" | "radial",
              rotation: gradient.rotation * (Math.PI / 180),
              colorStops: [
                { offset: 0, color: gradient.color1 },
                { offset: 1, color: gradient.color2 },
              ],
            },
            type: cornerStyle === "square" ? "square" : "dot",
          }
        : {
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
  };

  const saveToHistory = useCallback(() => {
    addToHistory({
      qrType,
      value: generateQRValue(),
      preview: "",
      config: {
        fgColor,
        bgColor,
        dotStyle,
        cornerStyle,
        frameType,
        frameText,
        frameColor,
      },
    });
  }, [addToHistory, qrType, generateQRValue, fgColor, bgColor, dotStyle, cornerStyle, frameType, frameText, frameColor]);

  const loadFromHistory = useCallback((item: QRHistoryItem) => {
    setQrType(item.qrType as QRType);
    setFgColor(item.config.fgColor);
    setBgColor(item.config.bgColor);
    setDotStyle(item.config.dotStyle as DotStyle);
    setCornerStyle(item.config.cornerStyle as CornerStyle);
    setFrameType(item.config.frameType as FrameType);
    setFrameText(item.config.frameText);
    setFrameColor(item.config.frameColor);
    toast({
      title: "Loaded!",
      description: "QR configuration restored from history.",
    });
  }, []);

  const applyTemplate = useCallback((template: QRTemplate) => {
    setFgColor(template.config.fgColor);
    setBgColor(template.config.bgColor);
    setDotStyle(template.config.dotStyle);
    setCornerStyle(template.config.cornerStyle);
    setFrameType(template.config.frameType);
    setFrameColor(template.config.frameColor);
    toast({
      title: "Template Applied!",
      description: `${template.name} style applied to your QR code.`,
    });
  }, []);

  const downloadQR = async (format: "png" | "svg" = "png") => {
    const qrCode = createQRCodeInstance(resolution);

    // Save to history on download
    saveToHistory();

    if (format === "svg") {
      // Direct SVG download
      const svgData = await qrCode.getRawData("svg");
      if (svgData && svgData instanceof Blob) {
        const url = URL.createObjectURL(svgData);
        const link = document.createElement("a");
        link.download = `qr-code-${qrType}.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast({
          title: "Downloaded!",
          description: "Your QR code SVG has been saved.",
        });
      }
      return;
    }

    // PNG download with frame
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const qrSize = size[0] * resolution;
    const padding = frameType !== "none" ? 32 * resolution : 0;
    const bannerHeight = (frameType === "banner" || frameType === "scanme") ? 48 * resolution : 0;
    const totalWidth = qrSize + padding * 2;
    const totalHeight = qrSize + padding * 2 + bannerHeight;

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Draw background (or leave transparent)
    if (!transparentBg) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, totalWidth, totalHeight);
    }

    // Draw frame
    if (frameType !== "none") {
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 8 * resolution;
      
      if (frameType === "rounded") {
        roundRect(ctx, 4 * resolution, 4 * resolution, totalWidth - 8 * resolution, totalHeight - bannerHeight - 8 * resolution, 24 * resolution);
        ctx.stroke();
      } else if (frameType === "circle") {
        ctx.beginPath();
        const centerX = totalWidth / 2;
        const centerY = (totalHeight - bannerHeight) / 2;
        const radius = Math.min(centerX, centerY) - 4 * resolution;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeRect(4 * resolution, 4 * resolution, totalWidth - 8 * resolution, totalHeight - bannerHeight - 8 * resolution);
      }
    }

    // Draw banner text
    if (frameType === "scanme") {
      ctx.fillStyle = frameColor;
      ctx.fillRect(0, 0, totalWidth, bannerHeight);
      ctx.fillStyle = transparentBg ? "#ffffff" : bgColor;
      ctx.font = `bold ${24 * resolution}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(frameText || "SCAN ME", totalWidth / 2, bannerHeight / 2);
    } else if (frameType === "banner") {
      ctx.fillStyle = frameColor;
      ctx.fillRect(0, totalHeight - bannerHeight, totalWidth, bannerHeight);
      ctx.fillStyle = transparentBg ? "#ffffff" : bgColor;
      ctx.font = `bold ${24 * resolution}px sans-serif`;
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
          description: `Your QR code has been saved at ${resolution}x resolution.`,
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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onDownloadPNG: () => downloadQR("png"),
    onDownloadSVG: () => downloadQR("svg"),
    onCopyData: copyToClipboard,
    onSetQRType: (type) => setQrType(type),
    inputRef: mainInputRef,
  });

  // Batch mode handlers
  const handleBatchItemsGenerated = useCallback((items: BatchQRItem[]) => {
    setBatchItems(items);
    setShowBatchPreview(true);
  }, []);

  const getBatchConfig = useCallback((): BatchQRConfig => ({
    fgColor,
    bgColor,
    dotStyle,
    cornerStyle,
    size: size[0] * resolution,
    errorLevel,
    gradient: gradient.enabled ? gradient : undefined,
  }), [fgColor, bgColor, dotStyle, cornerStyle, size, resolution, errorLevel, gradient]);

  const qrTypeIcons: Record<QRType, typeof Link> = {
    url: Link,
    text: FileText,
    email: Mail,
    phone: Phone,
    wifi: Wifi,
    vcard: User,
    sms: MessageSquare,
    location: MapPin,
    calendar: Calendar,
    social: Share2,
  };

  const socialPlatforms: { value: SocialData["platform"]; label: string }[] = [
    { value: "instagram", label: "Instagram" },
    { value: "twitter", label: "Twitter/X" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "tiktok", label: "TikTok" },
    { value: "facebook", label: "Facebook" },
    { value: "youtube", label: "YouTube" },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={generatorMode === "single" ? "default" : "outline"}
            onClick={() => { setGeneratorMode("single"); setShowBatchPreview(false); }}
            className="flex-1 border-2 border-foreground font-bold uppercase text-xs"
          >
            Single QR
          </Button>
          <Button
            variant={generatorMode === "batch" ? "default" : "outline"}
            onClick={() => setGeneratorMode("batch")}
            className="flex-1 border-2 border-foreground font-bold uppercase text-xs"
          >
            <Layers2 className="w-4 h-4 mr-1" />
            Batch
          </Button>
          <Button
            variant={generatorMode === "accessibility" ? "default" : "outline"}
            onClick={() => setGeneratorMode("accessibility")}
            className="flex-1 border-2 border-foreground font-bold uppercase text-xs"
          >
            <Accessibility className="w-4 h-4 mr-1" />
            A11y
          </Button>
        </div>

        {generatorMode === "batch" ? (
          <div className="border-4 border-foreground bg-card p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">Batch Generator</h2>
            {showBatchPreview ? (
              <BatchPreview
                items={batchItems}
                onItemsChange={setBatchItems}
                config={getBatchConfig()}
                onClose={() => setShowBatchPreview(false)}
              />
            ) : (
              <BatchGenerator onItemsGenerated={handleBatchItemsGenerated} />
            )}
          </div>
        ) : generatorMode === "accessibility" ? (
          <div className="border-4 border-foreground bg-card p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">Accessibility</h2>
            <AccessibilityOptions
              fgColor={fgColor}
              bgColor={bgColor}
              setFgColor={setFgColor}
              setBgColor={setBgColor}
            />
          </div>
        ) : (
          <>
        <div className="border-4 border-foreground bg-card p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">Select Type</h2>
          <Tabs value={qrType} onValueChange={(v) => setQrType(v as QRType)} className="w-full">
            <TabsList className="grid grid-cols-5 gap-2 h-auto bg-transparent p-0">
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
                    ref={mainInputRef}
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

              <TabsContent value="sms" className="mt-0 space-y-4">
                <div>
                  <Label className="text-sm font-bold uppercase">Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={sms.phone}
                    onChange={(e) => setSms({ ...sms, phone: e.target.value })}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase">Message (Optional)</Label>
                  <Input
                    placeholder="Pre-filled message..."
                    value={sms.message}
                    onChange={(e) => setSms({ ...sms, message: e.target.value })}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
              </TabsContent>

              <TabsContent value="location" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-bold uppercase">Latitude</Label>
                    <Input
                      placeholder="40.7128"
                      value={location.latitude}
                      onChange={(e) => setLocation({ ...location, latitude: e.target.value })}
                      className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold uppercase">Longitude</Label>
                    <Input
                      placeholder="-74.0060"
                      value={location.longitude}
                      onChange={(e) => setLocation({ ...location, longitude: e.target.value })}
                      className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase">Location Label</Label>
                  <Input
                    placeholder="New York City"
                    value={location.label}
                    onChange={(e) => setLocation({ ...location, label: e.target.value })}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="mt-0 space-y-4">
                <div>
                  <Label className="text-sm font-bold uppercase">Event Title</Label>
                  <Input
                    placeholder="Meeting"
                    value={calendar.title}
                    onChange={(e) => setCalendar({ ...calendar, title: e.target.value })}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-bold uppercase">Start Date</Label>
                    <Input
                      type="date"
                      value={calendar.startDate}
                      onChange={(e) => setCalendar({ ...calendar, startDate: e.target.value })}
                      className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold uppercase">Start Time</Label>
                    <Input
                      type="time"
                      value={calendar.startTime}
                      onChange={(e) => setCalendar({ ...calendar, startTime: e.target.value })}
                      className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-bold uppercase">End Date</Label>
                    <Input
                      type="date"
                      value={calendar.endDate}
                      onChange={(e) => setCalendar({ ...calendar, endDate: e.target.value })}
                      className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold uppercase">End Time</Label>
                    <Input
                      type="time"
                      value={calendar.endTime}
                      onChange={(e) => setCalendar({ ...calendar, endTime: e.target.value })}
                      className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase">Location</Label>
                  <Input
                    placeholder="123 Main St"
                    value={calendar.location}
                    onChange={(e) => setCalendar({ ...calendar, location: e.target.value })}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase">Description</Label>
                  <Input
                    placeholder="Event description..."
                    value={calendar.description}
                    onChange={(e) => setCalendar({ ...calendar, description: e.target.value })}
                    className="mt-2 border-2 border-foreground bg-background focus:ring-0"
                  />
                </div>
              </TabsContent>

              <TabsContent value="social" className="mt-0 space-y-4">
                <div>
                  <Label className="text-sm font-bold uppercase">Platform</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {socialPlatforms.map((platform) => (
                      <Button
                        key={platform.value}
                        variant={social.platform === platform.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSocial({ ...social, platform: platform.value })}
                        className="border-2 border-foreground font-bold text-xs"
                      >
                        {platform.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-bold uppercase">Username</Label>
                  <Input
                    placeholder="yourhandle"
                    value={social.username}
                    onChange={(e) => setSocial({ ...social, username: e.target.value })}
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

            <AccordionItem value="logo" className="border-b-2 border-foreground">
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

            <AccordionItem value="advanced-styling" className="border-b-2 border-foreground">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  <span className="font-bold uppercase">Advanced Styling</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-6">
                <GradientPicker gradient={gradient} setGradient={setGradient} />
                <div className="border-t-2 border-foreground pt-4">
                  <ShapeMask shape={shapeMask} setShape={setShapeMask} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="background" className="border-b-2 border-foreground">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  <span className="font-bold uppercase">Background & Badges</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-6">
                <BackgroundImageUploader background={background} setBackground={setBackground} />
                <div className="border-t-2 border-foreground pt-4">
                  <CornerBadge badge={cornerBadge} setBadge={setCornerBadge} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="animation" className="border-b-2 border-foreground">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  <span className="font-bold uppercase">Animation</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <AnimationOptions animation={animation} setAnimation={setAnimation} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="templates" className="border-b-2 border-foreground">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5" />
                  <span className="font-bold uppercase">Templates</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <QRTemplates onApply={applyTemplate} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="export" className="border-none">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  <span className="font-bold uppercase">Export Options</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <ExportOptions
                  errorLevel={errorLevel}
                  setErrorLevel={setErrorLevel}
                  transparentBg={transparentBg}
                  setTransparentBg={setTransparentBg}
                  resolution={resolution}
                  setResolution={setResolution}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
          </>
        )}
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
        <div className="border-4 border-foreground bg-card p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold uppercase tracking-wide">Preview</h2>
            <QRHistory
              history={history}
              onLoad={loadFromHistory}
              onToggleFavorite={toggleFavorite}
              onRemove={removeFromHistory}
              onClear={clearHistory}
            />
          </div>
          
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
              errorLevel={errorLevel}
              transparentBg={transparentBg}
              gradient={gradient}
              background={background}
              cornerBadge={cornerBadge}
              shapeMask={shapeMask}
              animation={animation}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <Button
              onClick={() => downloadQR("png")}
              className="border-2 border-foreground font-bold uppercase py-6 shadow-sm hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              <Download className="w-5 h-5 mr-2" />
              PNG
            </Button>
            <Button
              onClick={() => downloadQR("svg")}
              variant="outline"
              className="border-2 border-foreground font-bold uppercase py-6 shadow-sm hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              <Download className="w-5 h-5 mr-2" />
              SVG
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
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <ShareOptions qrRef={qrRef} qrData={generateQRValue()} />
            <PrintPreview qrRef={qrRef} qrData={generateQRValue()} />
          </div>
          {animation.enabled && (
            <div className="mt-3 text-xs text-muted-foreground border-2 border-foreground p-3 bg-secondary">
              <strong>Animation Preview:</strong> The animation is visible in the preview. Export as PNG/SVG for static versions.
            </div>
          )}
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
