import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, CheckSquare, Square, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import QRCodeStyling from "qr-code-styling";
import { BatchQRItem, BatchQRConfig, generateBatchZip, downloadZip } from "@/lib/batchExport";

interface BatchPreviewProps {
  items: BatchQRItem[];
  onItemsChange: (items: BatchQRItem[]) => void;
  config: BatchQRConfig;
  onClose: () => void;
}

export const BatchPreview = ({ items, onItemsChange, config, onClose }: BatchPreviewProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleItem = useCallback(
    (id: string) => {
      onItemsChange(
        items.map((item) =>
          item.id === id ? { ...item, selected: !item.selected } : item
        )
      );
    },
    [items, onItemsChange]
  );

  const selectAll = () => {
    onItemsChange(items.map((item) => ({ ...item, selected: true })));
  };

  const deselectAll = () => {
    onItemsChange(items.map((item) => ({ ...item, selected: false })));
  };

  const removeSelected = () => {
    onItemsChange(items.filter((item) => !item.selected));
  };

  const selectedCount = items.filter((item) => item.selected).length;

  const handleExport = useCallback(async () => {
    if (selectedCount === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setProgress(0);

    try {
      const blob = await generateBatchZip(items, config, (current, total) => {
        setProgress(Math.round((current / total) * 100));
      });

      await downloadZip(blob, `qr-codes-batch-${Date.now()}.zip`);

      toast({
        title: "Export complete",
        description: `${selectedCount} QR codes exported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  }, [items, config, selectedCount]);

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={selectAll}
          className="border-2 border-foreground font-bold uppercase text-xs"
        >
          <CheckSquare className="w-3 h-3 mr-1" />
          All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={deselectAll}
          className="border-2 border-foreground font-bold uppercase text-xs"
        >
          <Square className="w-3 h-3 mr-1" />
          None
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={removeSelected}
          className="border-2 border-foreground font-bold uppercase text-xs"
          disabled={selectedCount === 0}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Remove
        </Button>
        <span className="ml-auto text-sm font-bold">
          {selectedCount} / {items.length} selected
        </span>
      </div>

      {/* Preview Grid */}
      <ScrollArea className="h-[300px] border-2 border-foreground p-3">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {items.map((item) => (
            <BatchItemPreview
              key={item.id}
              item={item}
              config={config}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Export Section */}
      {isExporting && (
        <div className="space-y-2">
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-center font-bold">
            Generating... {progress}%
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1 border-2 border-foreground font-bold uppercase"
        >
          Back
        </Button>
        <Button
          onClick={handleExport}
          disabled={isExporting || selectedCount === 0}
          className="flex-1 bg-foreground text-background font-bold uppercase hover:bg-foreground/90"
        >
          <Download className="w-4 h-4 mr-2" />
          Download ZIP
        </Button>
      </div>
    </div>
  );
};

interface BatchItemPreviewProps {
  item: BatchQRItem;
  config: BatchQRConfig;
  onToggle: () => void;
}

const BatchItemPreview = ({ item, config, onToggle }: BatchItemPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Generate preview on mount
  useState(() => {
    const qr = new QRCodeStyling({
      width: 80,
      height: 80,
      data: item.data,
      dotsOptions: { color: config.fgColor },
      backgroundOptions: { color: config.bgColor },
    });

    qr.getRawData("png").then((blob) => {
      if (blob instanceof Blob) {
        setPreviewUrl(URL.createObjectURL(blob));
      }
    });
  });

  return (
    <div
      onClick={onToggle}
      className={`relative cursor-pointer border-2 p-2 transition-all ${
        item.selected
          ? "border-foreground bg-muted"
          : "border-muted-foreground/30 opacity-50"
      }`}
    >
      <Checkbox
        checked={item.selected}
        className="absolute top-1 right-1 z-10"
        onClick={(e) => e.stopPropagation()}
        onCheckedChange={() => onToggle()}
      />
      <div className="aspect-square bg-background flex items-center justify-center mb-1">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={item.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-8 h-8 border-2 border-foreground animate-pulse" />
        )}
      </div>
      <p className="text-[10px] font-mono truncate text-center" title={item.data}>
        {item.name}
      </p>
    </div>
  );
};
