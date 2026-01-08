import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  FileText, 
  Grid3X3, 
  StickyNote, 
  Tent, 
  BadgeCheck, 
  Tag,
  LayoutGrid
} from 'lucide-react';
import { PrintTemplateCard } from './PrintTemplateCard';

export type PrintTemplate = 
  | 'business-card' 
  | 'poster' 
  | 'grid' 
  | 'sticker' 
  | 'table-tent' 
  | 'badge' 
  | 'product-label'
  | 'mini-cards';

export type QRPosition = 'left' | 'center' | 'right';

export interface PrintConfig {
  template: PrintTemplate;
  title: string;
  subtitle: string;
  description: string;
  gridSize: '2x2' | '3x3' | '4x4';
  paperSize: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  qrSize: number; // 20-80 as percentage
  qrPosition: QRPosition;
  showCropMarks: boolean;
  showBleed: boolean;
  brutalistStyle: boolean;
  backgroundColor: string;
  borderStyle: 'none' | 'solid' | 'double' | 'dashed';
}

interface PrintTemplatesProps {
  config: PrintConfig;
  onChange: (config: PrintConfig) => void;
  qrPreview?: string | null;
}

const templates: { 
  value: PrintTemplate; 
  label: string; 
  icon: React.ReactNode; 
  description: string;
  category: 'marketing' | 'professional' | 'utility';
}[] = [
  {
    value: 'business-card',
    label: 'Business Card',
    icon: <CreditCard className="h-5 w-5" />,
    description: '3.5" × 2" standard',
    category: 'professional',
  },
  {
    value: 'poster',
    label: 'Poster',
    icon: <FileText className="h-5 w-5" />,
    description: 'Large centered QR',
    category: 'marketing',
  },
  {
    value: 'table-tent',
    label: 'Table Tent',
    icon: <Tent className="h-5 w-5" />,
    description: 'Foldable stand',
    category: 'marketing',
  },
  {
    value: 'badge',
    label: 'Badge',
    icon: <BadgeCheck className="h-5 w-5" />,
    description: 'Event badge/ID',
    category: 'professional',
  },
  {
    value: 'product-label',
    label: 'Product Label',
    icon: <Tag className="h-5 w-5" />,
    description: 'Small adhesive',
    category: 'marketing',
  },
  {
    value: 'grid',
    label: 'Grid Layout',
    icon: <Grid3X3 className="h-5 w-5" />,
    description: 'Multiple per page',
    category: 'utility',
  },
  {
    value: 'sticker',
    label: 'Sticker Sheet',
    icon: <StickyNote className="h-5 w-5" />,
    description: '40 labels/page',
    category: 'utility',
  },
  {
    value: 'mini-cards',
    label: 'Mini Cards',
    icon: <LayoutGrid className="h-5 w-5" />,
    description: '8 wallet cards',
    category: 'utility',
  },
];

export const PrintTemplates: React.FC<PrintTemplatesProps> = ({ config, onChange, qrPreview }) => {
  const showTextFields = ['business-card', 'poster', 'table-tent', 'badge', 'product-label'].includes(config.template);
  const showPositionControl = ['business-card', 'badge', 'product-label'].includes(config.template);
  const showGridSize = config.template === 'grid';

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-bold uppercase tracking-wider">Template</Label>
        <div className="grid grid-cols-2 gap-2">
          {templates.map((template) => (
            <PrintTemplateCard
              key={template.value}
              value={template.value}
              label={template.label}
              description={template.description}
              icon={template.icon}
              isSelected={config.template === template.value}
              onClick={() => onChange({ ...config, template: template.value })}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Text Fields */}
      {showTextFields && (
        <div className="space-y-3">
          <Label className="text-sm font-bold uppercase tracking-wider">Content</Label>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="print-title" className="text-xs text-muted-foreground">Title</Label>
              <Input
                id="print-title"
                value={config.title}
                onChange={(e) => onChange({ ...config, title: e.target.value })}
                placeholder="Your Name / Company"
                className="border-2 border-foreground"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="print-subtitle" className="text-xs text-muted-foreground">Subtitle</Label>
              <Input
                id="print-subtitle"
                value={config.subtitle}
                onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
                placeholder="Scan to visit website"
                className="border-2 border-foreground"
              />
            </div>
            {config.template === 'poster' && (
              <div className="space-y-1">
                <Label htmlFor="print-description" className="text-xs text-muted-foreground">Description</Label>
                <Input
                  id="print-description"
                  value={config.description}
                  onChange={(e) => onChange({ ...config, description: e.target.value })}
                  placeholder="Additional information..."
                  className="border-2 border-foreground"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Position */}
      {showPositionControl && (
        <div className="space-y-2">
          <Label className="text-sm font-bold uppercase tracking-wider">QR Position</Label>
          <RadioGroup
            value={config.qrPosition}
            onValueChange={(value) => onChange({ ...config, qrPosition: value as QRPosition })}
            className="flex gap-1"
          >
            {(['left', 'center', 'right'] as const).map((pos) => (
              <div key={pos} className="flex-1">
                <RadioGroupItem value={pos} id={`pos-${pos}`} className="peer sr-only" />
                <Label
                  htmlFor={`pos-${pos}`}
                  className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer text-xs font-bold uppercase"
                >
                  {pos}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* QR Size Slider */}
      {showTextFields && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold uppercase tracking-wider">QR Size</Label>
            <span className="text-xs text-muted-foreground">{config.qrSize}%</span>
          </div>
          <Slider
            value={[config.qrSize]}
            min={20}
            max={80}
            step={5}
            onValueChange={([value]) => onChange({ ...config, qrSize: value })}
            className="py-2"
          />
        </div>
      )}

      {/* Grid Size */}
      {showGridSize && (
        <div className="space-y-2">
          <Label className="text-sm font-bold uppercase tracking-wider">Grid Size</Label>
          <RadioGroup
            value={config.gridSize}
            onValueChange={(value) => onChange({ ...config, gridSize: value as '2x2' | '3x3' | '4x4' })}
            className="flex gap-2"
          >
            {(['2x2', '3x3', '4x4'] as const).map((size) => (
              <div key={size} className="flex items-center space-x-1">
                <RadioGroupItem value={size} id={`grid-${size}`} />
                <Label htmlFor={`grid-${size}`} className="cursor-pointer font-medium">{size}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      <Separator />

      {/* Paper Settings */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider">Paper Size</Label>
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
          <Label className="text-xs font-bold uppercase tracking-wider">Orientation</Label>
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

      <Separator />

      {/* Print Options */}
      <div className="space-y-3">
        <Label className="text-sm font-bold uppercase tracking-wider">Print Options</Label>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="crop-marks" className="text-sm cursor-pointer">Crop Marks</Label>
            <p className="text-xs text-muted-foreground">Add cutting guides</p>
          </div>
          <Switch
            id="crop-marks"
            checked={config.showCropMarks}
            onCheckedChange={(checked) => onChange({ ...config, showCropMarks: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="bleed" className="text-sm cursor-pointer">Bleed Area</Label>
            <p className="text-xs text-muted-foreground">3mm print bleed</p>
          </div>
          <Switch
            id="bleed"
            checked={config.showBleed}
            onCheckedChange={(checked) => onChange({ ...config, showBleed: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="brutalist" className="text-sm cursor-pointer">Brutalist Style</Label>
            <p className="text-xs text-muted-foreground">Bold borders, uppercase</p>
          </div>
          <Switch
            id="brutalist"
            checked={config.brutalistStyle}
            onCheckedChange={(checked) => onChange({ ...config, brutalistStyle: checked })}
          />
        </div>
      </div>
    </div>
  );
};
