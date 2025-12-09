import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { PrintTemplates, PrintConfig } from './PrintTemplates';
import { Printer, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';

interface PrintPreviewProps {
  qrRef: React.RefObject<HTMLDivElement>;
  qrData: string;
}

export const PrintPreview: React.FC<PrintPreviewProps> = ({ qrRef, qrData }) => {
  const [open, setOpen] = React.useState(false);
  const [config, setConfig] = React.useState<PrintConfig>({
    template: 'business-card',
    title: '',
    subtitle: 'Scan to visit',
    gridSize: '2x2',
    paperSize: 'a4',
    orientation: 'portrait',
  });
  const printRef = useRef<HTMLDivElement>(null);

  const getQRAsDataURL = async (): Promise<string | null> => {
    if (!qrRef.current) return null;
    const canvas = qrRef.current.querySelector('canvas');
    if (canvas) {
      return canvas.toDataURL('image/png');
    }
    return null;
  };

  const getPaperDimensions = () => {
    const dimensions = {
      a4: { width: 210, height: 297 },
      letter: { width: 215.9, height: 279.4 },
    };
    const paper = dimensions[config.paperSize];
    return config.orientation === 'landscape'
      ? { width: paper.height, height: paper.width }
      : paper;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const dataURL = await getQRAsDataURL();
      if (!dataURL) {
        toast({ title: "Failed to get QR code", variant: "destructive" });
        return;
      }

      const paper = getPaperDimensions();
      const pdf = new jsPDF({
        orientation: config.orientation,
        unit: 'mm',
        format: config.paperSize,
      });

      const pageWidth = paper.width;
      const pageHeight = paper.height;

      switch (config.template) {
        case 'business-card': {
          // Business card: 88.9mm x 50.8mm (3.5" x 2")
          const cardWidth = 88.9;
          const cardHeight = 50.8;
          const x = (pageWidth - cardWidth) / 2;
          const y = (pageHeight - cardHeight) / 2;
          
          // Draw card border
          pdf.setDrawColor(0);
          pdf.setLineWidth(0.5);
          pdf.rect(x, y, cardWidth, cardHeight);
          
          // Add QR code
          const qrSize = 35;
          pdf.addImage(dataURL, 'PNG', x + 5, y + (cardHeight - qrSize) / 2, qrSize, qrSize);
          
          // Add text
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          if (config.title) {
            pdf.text(config.title, x + qrSize + 10, y + 20);
          }
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          if (config.subtitle) {
            pdf.text(config.subtitle, x + qrSize + 10, y + 30);
          }
          break;
        }

        case 'poster': {
          const qrSize = Math.min(pageWidth, pageHeight) * 0.6;
          const x = (pageWidth - qrSize) / 2;
          const y = 40;
          
          pdf.addImage(dataURL, 'PNG', x, y, qrSize, qrSize);
          
          pdf.setFontSize(24);
          pdf.setFont('helvetica', 'bold');
          if (config.title) {
            pdf.text(config.title, pageWidth / 2, y + qrSize + 20, { align: 'center' });
          }
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'normal');
          if (config.subtitle) {
            pdf.text(config.subtitle, pageWidth / 2, y + qrSize + 30, { align: 'center' });
          }
          break;
        }

        case 'grid': {
          const gridMap = { '2x2': 2, '3x3': 3, '4x4': 4 };
          const cols = gridMap[config.gridSize];
          const rows = cols;
          const margin = 10;
          const cellWidth = (pageWidth - margin * 2) / cols;
          const cellHeight = (pageHeight - margin * 2) / rows;
          const qrSize = Math.min(cellWidth, cellHeight) * 0.8;

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const x = margin + col * cellWidth + (cellWidth - qrSize) / 2;
              const y = margin + row * cellHeight + (cellHeight - qrSize) / 2;
              pdf.addImage(dataURL, 'PNG', x, y, qrSize, qrSize);
            }
          }
          break;
        }

        case 'sticker': {
          // Sticker sheet: 5 columns x 8 rows
          const cols = 5;
          const rows = 8;
          const margin = 5;
          const cellWidth = (pageWidth - margin * 2) / cols;
          const cellHeight = (pageHeight - margin * 2) / rows;
          const qrSize = Math.min(cellWidth, cellHeight) * 0.85;

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const x = margin + col * cellWidth + (cellWidth - qrSize) / 2;
              const y = margin + row * cellHeight + (cellHeight - qrSize) / 2;
              pdf.addImage(dataURL, 'PNG', x, y, qrSize, qrSize);
            }
          }
          break;
        }
      }

      pdf.save(`qr-${config.template}.pdf`);
      toast({ title: "PDF downloaded successfully" });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ title: "Failed to generate PDF", variant: "destructive" });
    }
  };

  const renderPreview = () => {
    const paper = getPaperDimensions();
    const aspectRatio = paper.width / paper.height;
    const previewHeight = 300;
    const previewWidth = previewHeight * aspectRatio;

    const previewStyles: React.CSSProperties = {
      width: `${previewWidth}px`,
      height: `${previewHeight}px`,
      border: '1px solid hsl(var(--border))',
      backgroundColor: 'white',
      position: 'relative',
      margin: '0 auto',
    };

    switch (config.template) {
      case 'business-card': {
        return (
          <div style={previewStyles} className="flex items-center justify-center">
            <div className="border border-foreground p-2 flex items-center gap-3" style={{ width: '70%', height: '40%' }}>
              <div className="w-16 h-16 bg-muted flex items-center justify-center text-xs">QR</div>
              <div className="text-left">
                <div className="font-bold text-sm text-foreground">{config.title || 'Your Name'}</div>
                <div className="text-xs text-muted-foreground">{config.subtitle}</div>
              </div>
            </div>
          </div>
        );
      }

      case 'poster': {
        return (
          <div style={previewStyles} className="flex flex-col items-center justify-center p-4">
            <div className="w-32 h-32 bg-muted flex items-center justify-center text-xs mb-2">QR</div>
            <div className="font-bold text-sm text-foreground">{config.title || 'Title'}</div>
            <div className="text-xs text-muted-foreground">{config.subtitle}</div>
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
              padding: '8px',
              gap: '4px',
            }}
          >
            {Array.from({ length: cols * cols }).map((_, i) => (
              <div key={i} className="bg-muted flex items-center justify-center text-xs aspect-square">QR</div>
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
              padding: '4px',
              gap: '2px',
            }}
          >
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="bg-muted flex items-center justify-center" style={{ fontSize: '6px' }}>QR</div>
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Print Templates</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <PrintTemplates config={config} onChange={setConfig} />
          </div>
          
          <div className="space-y-3">
            <div className="text-sm font-medium">Preview</div>
            <div ref={printRef} className="bg-muted/30 p-4 rounded-lg">
              {renderPreview()}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
