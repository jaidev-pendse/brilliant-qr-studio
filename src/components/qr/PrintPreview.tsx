import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PrintTemplates, PrintConfig, PrintTemplate } from './PrintTemplates';
import { Printer, Download, Image } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import { getPaperDimensions, getHighResQRDataURL, formatFileName, BUSINESS_CARD_SIZE, TABLE_TENT_SIZE, BADGE_SIZE, LABEL_SIZE } from '@/lib/printUtils';

interface PrintPreviewProps {
  qrRef: React.RefObject<HTMLDivElement>;
  qrData: string;
}

export const PrintPreview: React.FC<PrintPreviewProps> = ({ qrRef, qrData }) => {
  const [open, setOpen] = useState(false);
  const [qrDataURL, setQrDataURL] = useState<string | null>(null);
  const [config, setConfig] = useState<PrintConfig>({
    template: 'business-card',
    title: '',
    subtitle: 'Scan to connect',
    description: '',
    gridSize: '2x2',
    paperSize: 'a4',
    orientation: 'portrait',
    qrSize: 50,
    qrPosition: 'left',
    showCropMarks: false,
    showBleed: false,
    brutalistStyle: true,
    backgroundColor: '#ffffff',
    borderStyle: 'solid',
  });
  const printRef = useRef<HTMLDivElement>(null);

  // Capture QR code when dialog opens
  useEffect(() => {
    if (open && qrRef.current) {
      const captureQR = async () => {
        const dataURL = await getHighResQRDataURL(qrRef, 3);
        setQrDataURL(dataURL);
      };
      captureQR();
    }
  }, [open, qrRef]);

  const paper = getPaperDimensions(config.paperSize, config.orientation);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      if (!qrDataURL) {
        toast({ title: "Failed to get QR code", variant: "destructive" });
        return;
      }

      const pdf = new jsPDF({
        orientation: config.orientation,
        unit: 'mm',
        format: config.paperSize,
      });

      const pageWidth = paper.width;
      const pageHeight = paper.height;
      const isBrutalist = config.brutalistStyle;

      // Helper to draw crop marks
      const drawCropMarks = (x: number, y: number, w: number, h: number) => {
        if (!config.showCropMarks) return;
        const len = 5;
        const off = 3;
        pdf.setDrawColor(0);
        pdf.setLineWidth(0.25);
        
        // Corners
        [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([cx, cy], i) => {
          const xDir = i % 2 === 0 ? -1 : 1;
          const yDir = i < 2 ? -1 : 1;
          pdf.line(cx + xDir * off, cy, cx + xDir * (off + len), cy);
          pdf.line(cx, cy + yDir * off, cx, cy + yDir * (off + len));
        });
      };

      switch (config.template) {
        case 'business-card': {
          const card = BUSINESS_CARD_SIZE;
          const x = (pageWidth - card.width) / 2;
          const y = (pageHeight - card.height) / 2;
          
          drawCropMarks(x, y, card.width, card.height);
          
          // Border
          pdf.setDrawColor(0);
          pdf.setLineWidth(isBrutalist ? 1.5 : 0.5);
          pdf.rect(x, y, card.width, card.height);
          
          // QR code
          const qrSize = card.height * (config.qrSize / 100);
          let qrX = x + 5;
          if (config.qrPosition === 'center') qrX = x + (card.width - qrSize) / 2;
          if (config.qrPosition === 'right') qrX = x + card.width - qrSize - 5;
          const qrY = y + (card.height - qrSize) / 2;
          
          pdf.addImage(qrDataURL, 'PNG', qrX, qrY, qrSize, qrSize);
          
          // Text
          if (config.qrPosition !== 'center') {
            const textX = config.qrPosition === 'left' ? qrX + qrSize + 5 : x + 5;
            pdf.setFontSize(isBrutalist ? 12 : 11);
            pdf.setFont('helvetica', 'bold');
            if (config.title) {
              pdf.text(isBrutalist ? config.title.toUpperCase() : config.title, textX, y + 18);
            }
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            if (config.subtitle) {
              pdf.text(config.subtitle, textX, y + 26);
            }
          }
          break;
        }

        case 'poster': {
          const qrSize = Math.min(pageWidth, pageHeight) * 0.5;
          const x = (pageWidth - qrSize) / 2;
          const y = 50;
          
          if (isBrutalist) {
            // Brutalist frame
            pdf.setDrawColor(0);
            pdf.setLineWidth(3);
            pdf.rect(x - 10, y - 10, qrSize + 20, qrSize + 20);
          }
          
          pdf.addImage(qrDataURL, 'PNG', x, y, qrSize, qrSize);
          
          pdf.setFontSize(isBrutalist ? 32 : 24);
          pdf.setFont('helvetica', 'bold');
          if (config.title) {
            const title = isBrutalist ? config.title.toUpperCase() : config.title;
            pdf.text(title, pageWidth / 2, y + qrSize + 30, { align: 'center' });
          }
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'normal');
          if (config.subtitle) {
            pdf.text(config.subtitle, pageWidth / 2, y + qrSize + 42, { align: 'center' });
          }
          if (config.description) {
            pdf.setFontSize(11);
            pdf.text(config.description, pageWidth / 2, y + qrSize + 54, { align: 'center' });
          }
          break;
        }

        case 'table-tent': {
          const tent = TABLE_TENT_SIZE;
          const x = (pageWidth - tent.width) / 2;
          
          // Front panel
          const y1 = 20;
          pdf.setDrawColor(0);
          pdf.setLineWidth(isBrutalist ? 1.5 : 0.5);
          pdf.rect(x, y1, tent.width, tent.height);
          
          drawCropMarks(x, y1, tent.width, tent.height);
          
          // Add fold line indicator
          pdf.setLineDashPattern([2, 2], 0);
          pdf.line(x, y1 + tent.height, x + tent.width, y1 + tent.height);
          pdf.setLineDashPattern([], 0);
          
          const qrSize = tent.width * 0.7;
          pdf.addImage(qrDataURL, 'PNG', x + (tent.width - qrSize) / 2, y1 + 15, qrSize, qrSize);
          
          pdf.setFontSize(isBrutalist ? 16 : 14);
          pdf.setFont('helvetica', 'bold');
          if (config.title) {
            const title = isBrutalist ? config.title.toUpperCase() : config.title;
            pdf.text(title, x + tent.width / 2, y1 + qrSize + 30, { align: 'center' });
          }
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          if (config.subtitle) {
            pdf.text(config.subtitle, x + tent.width / 2, y1 + qrSize + 40, { align: 'center' });
          }
          
          // Back panel (mirrored for folding)
          const y2 = y1 + tent.height + 5;
          pdf.rect(x, y2, tent.width, tent.height);
          pdf.addImage(qrDataURL, 'PNG', x + (tent.width - qrSize) / 2, y2 + 15, qrSize, qrSize);
          if (config.title) {
            const title = isBrutalist ? config.title.toUpperCase() : config.title;
            pdf.text(title, x + tent.width / 2, y2 + qrSize + 30, { align: 'center' });
          }
          if (config.subtitle) {
            pdf.text(config.subtitle, x + tent.width / 2, y2 + qrSize + 40, { align: 'center' });
          }
          break;
        }

        case 'badge': {
          const badge = BADGE_SIZE;
          const x = (pageWidth - badge.width) / 2;
          const y = (pageHeight - badge.height) / 2;
          
          drawCropMarks(x, y, badge.width, badge.height);
          
          pdf.setDrawColor(0);
          pdf.setLineWidth(isBrutalist ? 1.5 : 0.5);
          pdf.rect(x, y, badge.width, badge.height);
          
          // Lanyard hole indicator
          pdf.setFillColor(255, 255, 255);
          pdf.circle(x + badge.width / 2, y + 5, 2, 'FD');
          
          const qrSize = badge.height * 0.5;
          let qrX = x + 5;
          if (config.qrPosition === 'center') qrX = x + (badge.width - qrSize) / 2;
          if (config.qrPosition === 'right') qrX = x + badge.width - qrSize - 5;
          
          pdf.addImage(qrDataURL, 'PNG', qrX, y + 12, qrSize, qrSize);
          
          if (config.qrPosition !== 'center') {
            const textX = config.qrPosition === 'left' ? qrX + qrSize + 5 : x + 5;
            pdf.setFontSize(isBrutalist ? 11 : 10);
            pdf.setFont('helvetica', 'bold');
            if (config.title) {
              pdf.text(isBrutalist ? config.title.toUpperCase() : config.title, textX, y + 22);
            }
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            if (config.subtitle) {
              pdf.text(config.subtitle, textX, y + 30);
            }
          }
          break;
        }

        case 'product-label': {
          const label = LABEL_SIZE;
          // 4x6 grid of labels
          const cols = 3;
          const rows = 7;
          const gapX = (pageWidth - cols * label.width) / (cols + 1);
          const gapY = (pageHeight - rows * label.height) / (rows + 1);
          
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const x = gapX + col * (label.width + gapX);
              const y = gapY + row * (label.height + gapY);
              
              pdf.setDrawColor(200);
              pdf.setLineWidth(0.25);
              pdf.rect(x, y, label.width, label.height);
              
              const qrSize = label.height * 0.7;
              let qrX = x + 2;
              if (config.qrPosition === 'center') qrX = x + (label.width - qrSize) / 2;
              if (config.qrPosition === 'right') qrX = x + label.width - qrSize - 2;
              
              pdf.addImage(qrDataURL, 'PNG', qrX, y + (label.height - qrSize) / 2, qrSize, qrSize);
              
              if (config.qrPosition !== 'center' && config.title) {
                const textX = config.qrPosition === 'left' ? qrX + qrSize + 2 : x + 2;
                pdf.setFontSize(6);
                pdf.setFont('helvetica', 'bold');
                pdf.text(config.title.substring(0, 15), textX, y + label.height / 2);
              }
            }
          }
          break;
        }

        case 'grid': {
          const gridMap = { '2x2': 2, '3x3': 3, '4x4': 4 };
          const cols = gridMap[config.gridSize];
          const rows = cols;
          const margin = 15;
          const cellWidth = (pageWidth - margin * 2) / cols;
          const cellHeight = (pageHeight - margin * 2) / rows;
          const qrSize = Math.min(cellWidth, cellHeight) * 0.8;

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const x = margin + col * cellWidth + (cellWidth - qrSize) / 2;
              const y = margin + row * cellHeight + (cellHeight - qrSize) / 2;
              
              if (isBrutalist) {
                pdf.setDrawColor(0);
                pdf.setLineWidth(1);
                pdf.rect(x - 3, y - 3, qrSize + 6, qrSize + 6);
              }
              
              pdf.addImage(qrDataURL, 'PNG', x, y, qrSize, qrSize);
            }
          }
          break;
        }

        case 'sticker': {
          const cols = 5;
          const rows = 8;
          const margin = 8;
          const cellWidth = (pageWidth - margin * 2) / cols;
          const cellHeight = (pageHeight - margin * 2) / rows;
          const qrSize = Math.min(cellWidth, cellHeight) * 0.85;

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const x = margin + col * cellWidth + (cellWidth - qrSize) / 2;
              const y = margin + row * cellHeight + (cellHeight - qrSize) / 2;
              pdf.addImage(qrDataURL, 'PNG', x, y, qrSize, qrSize);
            }
          }
          break;
        }

        case 'mini-cards': {
          // 2x4 grid of wallet-sized cards
          const cardW = 85;
          const cardH = 55;
          const cols = 2;
          const rows = 4;
          const gapX = (pageWidth - cols * cardW) / (cols + 1);
          const gapY = (pageHeight - rows * cardH) / (rows + 1);

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const x = gapX + col * (cardW + gapX);
              const y = gapY + row * (cardH + gapY);
              
              drawCropMarks(x, y, cardW, cardH);
              
              pdf.setDrawColor(0);
              pdf.setLineWidth(isBrutalist ? 1 : 0.5);
              pdf.rect(x, y, cardW, cardH);
              
              const qrSize = cardH * 0.7;
              pdf.addImage(qrDataURL, 'PNG', x + 5, y + (cardH - qrSize) / 2, qrSize, qrSize);
              
              const textX = x + qrSize + 10;
              pdf.setFontSize(isBrutalist ? 10 : 9);
              pdf.setFont('helvetica', 'bold');
              if (config.title) {
                pdf.text(isBrutalist ? config.title.toUpperCase() : config.title, textX, y + 20);
              }
              pdf.setFontSize(7);
              pdf.setFont('helvetica', 'normal');
              if (config.subtitle) {
                pdf.text(config.subtitle, textX, y + 28);
              }
            }
          }
          break;
        }
      }

      pdf.save(formatFileName(config.template, 'pdf'));
      toast({ title: "PDF downloaded successfully" });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ title: "Failed to generate PDF", variant: "destructive" });
    }
  };

  const handleDownloadPNG = async () => {
    if (!qrDataURL) {
      toast({ title: "Failed to get QR code", variant: "destructive" });
      return;
    }

    const link = document.createElement('a');
    link.download = formatFileName(config.template, 'png');
    link.href = qrDataURL;
    link.click();
    toast({ title: "PNG downloaded successfully" });
  };

  const renderPreview = () => {
    const aspectRatio = paper.width / paper.height;
    const previewHeight = 320;
    const previewWidth = previewHeight * aspectRatio;
    const isBrutalist = config.brutalistStyle;

    const previewStyles: React.CSSProperties = {
      width: `${previewWidth}px`,
      height: `${previewHeight}px`,
      border: isBrutalist ? '3px solid hsl(var(--foreground))' : '1px solid hsl(var(--border))',
      backgroundColor: 'white',
      position: 'relative',
      margin: '0 auto',
      overflow: 'hidden',
    };

    const QRImage = ({ size = 48, className = "" }: { size?: number; className?: string }) => (
      qrDataURL ? (
        <img src={qrDataURL} alt="QR Preview" className={className} style={{ width: size, height: size, imageRendering: 'pixelated' }} />
      ) : (
        <div className={`bg-muted flex items-center justify-center text-xs font-bold ${className}`} style={{ width: size, height: size }}>QR</div>
      )
    );

    switch (config.template) {
      case 'business-card': {
        return (
          <div style={previewStyles} className="flex items-center justify-center">
            <div 
              className={`border-foreground p-3 flex items-center gap-3 ${isBrutalist ? 'border-[3px]' : 'border'}`} 
              style={{ width: '75%', height: '40%' }}
            >
              {config.qrPosition === 'right' && (
                <div className="flex-1 text-left">
                  <div className={`font-bold text-sm text-foreground ${isBrutalist ? 'uppercase tracking-wide' : ''}`}>
                    {config.title || 'Your Name'}
                  </div>
                  <div className="text-xs text-muted-foreground">{config.subtitle}</div>
                </div>
              )}
              <QRImage size={config.qrPosition === 'center' ? 56 : 48} />
              {config.qrPosition === 'left' && (
                <div className="flex-1 text-left">
                  <div className={`font-bold text-sm text-foreground ${isBrutalist ? 'uppercase tracking-wide' : ''}`}>
                    {config.title || 'Your Name'}
                  </div>
                  <div className="text-xs text-muted-foreground">{config.subtitle}</div>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'poster': {
        return (
          <div style={previewStyles} className="flex flex-col items-center justify-center p-4">
            <div className={isBrutalist ? 'border-[3px] border-foreground p-2' : ''}>
              <QRImage size={100} />
            </div>
            <div className={`font-bold text-base text-foreground mt-3 ${isBrutalist ? 'uppercase tracking-wider' : ''}`}>
              {config.title || 'Title'}
            </div>
            <div className="text-xs text-muted-foreground">{config.subtitle}</div>
            {config.description && (
              <div className="text-[10px] text-muted-foreground mt-1">{config.description}</div>
            )}
          </div>
        );
      }

      case 'table-tent': {
        return (
          <div style={previewStyles} className="flex flex-col items-center justify-start p-2">
            <div className={`border-foreground p-2 text-center ${isBrutalist ? 'border-[2px]' : 'border'}`} style={{ width: '60%' }}>
              <QRImage size={60} className="mx-auto" />
              <div className={`font-bold text-[10px] text-foreground mt-1 ${isBrutalist ? 'uppercase' : ''}`}>
                {config.title || 'Title'}
              </div>
              <div className="text-[8px] text-muted-foreground">{config.subtitle}</div>
            </div>
            <div className="w-[60%] border-t-2 border-dashed border-muted-foreground my-1" />
            <div className={`border-foreground p-2 text-center ${isBrutalist ? 'border-[2px]' : 'border'}`} style={{ width: '60%' }}>
              <QRImage size={60} className="mx-auto" />
              <div className={`font-bold text-[10px] text-foreground mt-1 ${isBrutalist ? 'uppercase' : ''}`}>
                {config.title || 'Title'}
              </div>
            </div>
          </div>
        );
      }

      case 'badge': {
        return (
          <div style={previewStyles} className="flex items-center justify-center">
            <div className={`border-foreground p-2 ${isBrutalist ? 'border-[2px]' : 'border'}`} style={{ width: '50%', height: '35%' }}>
              <div className="w-3 h-3 rounded-full border border-foreground mx-auto mb-1" />
              <div className="flex items-center gap-2">
                {config.qrPosition === 'left' && <QRImage size={36} />}
                <div className="flex-1 text-left">
                  <div className={`font-bold text-[10px] text-foreground ${isBrutalist ? 'uppercase' : ''}`}>
                    {config.title || 'Name'}
                  </div>
                  <div className="text-[8px] text-muted-foreground">{config.subtitle}</div>
                </div>
                {config.qrPosition === 'right' && <QRImage size={36} />}
              </div>
            </div>
          </div>
        );
      }

      case 'product-label': {
        return (
          <div 
            style={{ 
              ...previewStyles, 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(7, 1fr)',
              padding: '8px',
              gap: '4px',
            }}
          >
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} className="border border-muted flex items-center gap-1 p-0.5">
                <QRImage size={16} />
                {config.qrPosition !== 'center' && (
                  <span className="text-[4px] font-bold truncate">{config.title || 'Label'}</span>
                )}
              </div>
            ))}
          </div>
        );
      }

      case 'grid': {
        const gridMap = { '2x2': 2, '3x3': 3, '4x4': 4 };
        const cols = gridMap[config.gridSize];
        return (
          <div 
            style={{ 
              ...previewStyles, 
              display: 'grid', 
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              padding: '12px',
              gap: '8px',
            }}
          >
            {Array.from({ length: cols * cols }).map((_, i) => (
              <div key={i} className={`flex items-center justify-center aspect-square ${isBrutalist ? 'border-2 border-foreground' : ''}`}>
                <QRImage size={Math.floor(previewWidth / cols) - 24} />
              </div>
            ))}
          </div>
        );
      }

      case 'sticker': {
        return (
          <div 
            style={{ 
              ...previewStyles, 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)',
              gridTemplateRows: 'repeat(8, 1fr)',
              padding: '6px',
              gap: '3px',
            }}
          >
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="flex items-center justify-center">
                <QRImage size={24} />
              </div>
            ))}
          </div>
        );
      }

      case 'mini-cards': {
        return (
          <div 
            style={{ 
              ...previewStyles, 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridTemplateRows: 'repeat(4, 1fr)',
              padding: '8px',
              gap: '6px',
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`flex items-center gap-1 p-1 ${isBrutalist ? 'border-2 border-foreground' : 'border border-muted'}`}>
                <QRImage size={28} />
                <div className="flex-1">
                  <div className={`text-[6px] font-bold ${isBrutalist ? 'uppercase' : ''}`}>{config.title || 'Name'}</div>
                  <div className="text-[5px] text-muted-foreground">{config.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        );
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex-1 border-2 border-foreground font-bold uppercase py-6 shadow-sm hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
        >
          <Printer className="w-5 h-5 mr-2" />
          Print
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase tracking-wider">Print Templates</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-[1fr,1.2fr] gap-6 overflow-hidden">
          <ScrollArea className="h-[60vh] pr-4">
            <PrintTemplates config={config} onChange={setConfig} qrPreview={qrDataURL} />
          </ScrollArea>
          
          <div className="space-y-3">
            <div className="text-sm font-bold uppercase tracking-wider">Preview</div>
            <div ref={printRef} className="bg-muted/30 p-4 rounded-lg border-2 border-dashed border-border">
              {renderPreview()}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {config.paperSize.toUpperCase()} • {config.orientation} • {config.template.replace('-', ' ')}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 flex-wrap">
          <Button variant="outline" onClick={handleDownloadPNG} className="gap-2 border-2 border-foreground font-bold uppercase">
            <Image className="h-4 w-4" />
            PNG
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2 border-2 border-foreground font-bold uppercase">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownloadPDF} className="gap-2 font-bold uppercase">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
