import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { CreditCard, FileText, Grid3X3, StickyNote } from 'lucide-react';

export type PrintTemplate = 'business-card' | 'poster' | 'grid' | 'sticker';

export interface PrintConfig {
  template: PrintTemplate;
  title: string;
  subtitle: string;
  gridSize: '2x2' | '3x3' | '4x4';
  paperSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
}

interface PrintTemplatesProps {
  config: PrintConfig;
  onChange: (config: PrintConfig) => void;
}

export const PrintTemplates: React.FC<PrintTemplatesProps> = ({ config, onChange }) => {
  const templates: { value: PrintTemplate; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'business-card',
      label: 'Business Card',
      icon: <CreditCard className="h-5 w-5" />,
      description: '3.5" x 2" standard size',
    },
    {
      value: 'poster',
      label: 'A4 Poster',
      icon: <FileText className="h-5 w-5" />,
      description: 'Large centered QR',
    },
    {
      value: 'grid',
      label: 'Grid Layout',
      icon: <Grid3X3 className="h-5 w-5" />,
      description: 'Multiple QRs per page',
    },
    {
      value: 'sticker',
      label: 'Sticker Sheet',
      icon: <StickyNote className="h-5 w-5" />,
      description: 'Small labels',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Template</Label>
        <RadioGroup
          value={config.template}
          onValueChange={(value) => onChange({ ...config, template: value as PrintTemplate })}
          className="grid grid-cols-2 gap-2"
        >
          {templates.map((template) => (
            <div key={template.value}>
              <RadioGroupItem
                value={template.value}
                id={template.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={template.value}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                {template.icon}
                <span className="text-sm font-medium mt-1">{template.label}</span>
                <span className="text-xs text-muted-foreground">{template.description}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {(config.template === 'business-card' || config.template === 'poster') && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="print-title">Title</Label>
            <Input
              id="print-title"
              value={config.title}
              onChange={(e) => onChange({ ...config, title: e.target.value })}
              placeholder="Your Name / Company"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="print-subtitle">Subtitle</Label>
            <Input
              id="print-subtitle"
              value={config.subtitle}
              onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
              placeholder="Scan to visit website"
            />
          </div>
        </div>
      )}

      {config.template === 'grid' && (
        <div className="space-y-2">
          <Label>Grid Size</Label>
          <RadioGroup
            value={config.gridSize}
            onValueChange={(value) => onChange({ ...config, gridSize: value as '2x2' | '3x3' | '4x4' })}
            className="flex gap-2"
          >
            {['2x2', '3x3', '4x4'].map((size) => (
              <div key={size} className="flex items-center space-x-1">
                <RadioGroupItem value={size} id={`grid-${size}`} />
                <Label htmlFor={`grid-${size}`} className="cursor-pointer">{size}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Paper Size</Label>
          <RadioGroup
            value={config.paperSize}
            onValueChange={(value) => onChange({ ...config, paperSize: value as 'a4' | 'letter' })}
            className="flex gap-2"
          >
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="a4" id="paper-a4" />
              <Label htmlFor="paper-a4" className="cursor-pointer">A4</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="letter" id="paper-letter" />
              <Label htmlFor="paper-letter" className="cursor-pointer">Letter</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Orientation</Label>
          <RadioGroup
            value={config.orientation}
            onValueChange={(value) => onChange({ ...config, orientation: value as 'portrait' | 'landscape' })}
            className="flex gap-2"
          >
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="portrait" id="orient-portrait" />
              <Label htmlFor="orient-portrait" className="cursor-pointer">Portrait</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="landscape" id="orient-landscape" />
              <Label htmlFor="orient-landscape" className="cursor-pointer">Landscape</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};
