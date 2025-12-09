import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  Share2,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  Code,
  Image,
  Link,
  Check,
} from 'lucide-react';

interface ShareOptionsProps {
  qrRef: React.RefObject<HTMLDivElement>;
  qrData: string;
}

export const ShareOptions: React.FC<ShareOptionsProps> = ({ qrRef, qrData }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [embedWidth, setEmbedWidth] = useState('200');
  const [open, setOpen] = useState(false);

  const getQRAsDataURL = async (): Promise<string | null> => {
    if (!qrRef.current) return null;
    const canvas = qrRef.current.querySelector('canvas');
    if (canvas) {
      return canvas.toDataURL('image/png');
    }
    const svg = qrRef.current.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      return URL.createObjectURL(svgBlob);
    }
    return null;
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      toast({
        title: "Not supported",
        description: "Web Share API is not supported on this device",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataURL = await getQRAsDataURL();
      if (dataURL) {
        const response = await fetch(dataURL);
        const blob = await response.blob();
        const file = new File([blob], 'qr-code.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'QR Code',
          text: `Check out this QR code for: ${qrData}`,
          files: [file],
        });
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast({
          title: "Share failed",
          description: "Could not share the QR code",
          variant: "destructive",
        });
      }
    }
  };

  const handleSocialShare = (platform: string) => {
    const text = encodeURIComponent(`Check out this QR code for: ${qrData}`);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(qrData)}`,
      whatsapp: `https://wa.me/?text=${text}`,
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied('link');
      setTimeout(() => setCopied(null), 2000);
      toast({ title: "Link copied to clipboard" });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleCopyImage = async () => {
    try {
      const dataURL = await getQRAsDataURL();
      if (!dataURL) throw new Error('No QR code found');
      
      const response = await fetch(dataURL);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      setCopied('image');
      setTimeout(() => setCopied(null), 2000);
      toast({ title: "Image copied to clipboard" });
    } catch {
      toast({ title: "Failed to copy image", variant: "destructive" });
    }
  };

  const getEmbedCode = () => {
    return `<img src="[QR_DATA_URL]" alt="QR Code" width="${embedWidth}" height="${embedWidth}" />`;
  };

  const handleCopyEmbed = async () => {
    try {
      const dataURL = await getQRAsDataURL();
      const embedCode = `<img src="${dataURL}" alt="QR Code for ${qrData}" width="${embedWidth}" height="${embedWidth}" />`;
      await navigator.clipboard.writeText(embedCode);
      setCopied('embed');
      setTimeout(() => setCopied(null), 2000);
      toast({ title: "Embed code copied" });
    } catch {
      toast({ title: "Failed to copy embed code", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Native Share */}
          {navigator.share && (
            <div>
              <Button onClick={handleNativeShare} className="w-full gap-2">
                <Share2 className="h-4 w-4" />
                Share via Device
              </Button>
            </div>
          )}

          {/* Social Media */}
          <div className="space-y-2">
            <Label>Share on Social Media</Label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSocialShare('twitter')}
                title="Share on Twitter"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSocialShare('facebook')}
                title="Share on Facebook"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSocialShare('linkedin')}
                title="Share on LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSocialShare('whatsapp')}
                title="Share on WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Copy Options */}
          <div className="space-y-2">
            <Label>Quick Copy</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="flex-1 gap-2"
              >
                {copied === 'link' ? <Check className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                Copy Link
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyImage}
                className="flex-1 gap-2"
              >
                {copied === 'image' ? <Check className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                Copy Image
              </Button>
            </div>
          </div>

          {/* Embed Code */}
          <div className="space-y-2">
            <Label>Embed Code</Label>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Width (px)</Label>
                <Input
                  type="number"
                  value={embedWidth}
                  onChange={(e) => setEmbedWidth(e.target.value)}
                  min="50"
                  max="500"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleCopyEmbed}
                className="gap-2"
              >
                {copied === 'embed' ? <Check className="h-4 w-4" /> : <Code className="h-4 w-4" />}
                Copy Embed
              </Button>
            </div>
            <Textarea
              readOnly
              value={getEmbedCode()}
              className="font-mono text-xs h-16"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
