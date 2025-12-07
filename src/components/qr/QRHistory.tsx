import { Star, Trash2, History, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { QRHistoryItem } from "@/hooks/useQRHistory";

interface QRHistoryProps {
  history: QRHistoryItem[];
  onLoad: (item: QRHistoryItem) => void;
  onToggleFavorite: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const QRHistory = ({ history, onLoad, onToggleFavorite, onRemove, onClear }: QRHistoryProps) => {
  const favorites = history.filter((item) => item.isFavorite);
  const recent = history.filter((item) => !item.isFavorite);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const HistoryItem = ({ item }: { item: QRHistoryItem }) => (
    <div className="p-3 border-2 border-foreground bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-3">
        <div 
          className="w-12 h-12 flex-shrink-0 border border-foreground bg-background"
          style={{ backgroundColor: item.config.bgColor }}
        >
          <div 
            className="w-full h-full flex items-center justify-center text-xs font-bold uppercase"
            style={{ color: item.config.fgColor }}
          >
            {item.qrType.slice(0, 2)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm uppercase truncate">{item.qrType}</p>
          <p className="text-xs text-muted-foreground truncate">{item.value.slice(0, 30)}...</p>
          <p className="text-xs text-muted-foreground mt-1">{formatDate(item.timestamp)}</p>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id);
            }}
          >
            <Star className={`h-4 w-4 ${item.isFavorite ? "fill-foreground" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-2 border border-foreground text-xs font-bold"
        onClick={() => onLoad(item)}
      >
        Load This QR
      </Button>
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="border-2 border-foreground font-bold uppercase gap-2"
        >
          <History className="w-4 h-4" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent className="border-l-4 border-foreground w-[350px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="font-bold uppercase tracking-wide">QR History</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-bold uppercase">No History Yet</p>
              <p className="text-sm mt-2">Your generated QR codes will appear here</p>
            </div>
          ) : (
            <div className="space-y-6 pr-4">
              {favorites.length > 0 && (
                <div>
                  <h3 className="font-bold uppercase text-sm mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 fill-foreground" />
                    Favorites
                  </h3>
                  <div className="space-y-2">
                    {favorites.map((item) => (
                      <HistoryItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {recent.length > 0 && (
                <div>
                  <h3 className="font-bold uppercase text-sm mb-3">Recent</h3>
                  <div className="space-y-2">
                    {recent.map((item) => (
                      <HistoryItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {history.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full border border-foreground text-xs font-bold uppercase mt-4"
                  onClick={onClear}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All History
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
