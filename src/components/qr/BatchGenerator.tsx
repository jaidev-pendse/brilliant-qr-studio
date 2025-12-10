import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, FileSpreadsheet, List, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { BatchQRItem } from "@/lib/batchExport";

interface BatchGeneratorProps {
  onItemsGenerated: (items: BatchQRItem[]) => void;
}

export const BatchGenerator = ({ onItemsGenerated }: BatchGeneratorProps) => {
  const [textInput, setTextInput] = useState("");
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);

  const handleTextParse = useCallback(() => {
    const lines = textInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      toast({
        title: "No data",
        description: "Please enter at least one value.",
        variant: "destructive",
      });
      return;
    }

    const items: BatchQRItem[] = lines.map((line, index) => ({
      id: `item-${index}`,
      data: line,
      name: line.slice(0, 30),
      selected: true,
    }));

    onItemsGenerated(items);
    toast({
      title: "Items parsed",
      description: `${items.length} QR codes ready to generate.`,
    });
  }, [textInput, onItemsGenerated]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length === 0) {
            toast({
              title: "Empty file",
              description: "The CSV file appears to be empty.",
              variant: "destructive",
            });
            return;
          }

          const columns = results.meta.fields || [];
          setCsvColumns(columns);
          setCsvData(results.data as Record<string, string>[]);
          setSelectedColumn(columns[0] || "");
          
          toast({
            title: "File loaded",
            description: `Found ${results.data.length} rows with ${columns.length} columns.`,
          });
        },
        error: (error) => {
          toast({
            title: "Parse error",
            description: error.message,
            variant: "destructive",
          });
        },
      });

      // Reset input
      event.target.value = "";
    },
    []
  );

  const handleCsvGenerate = useCallback(() => {
    if (!selectedColumn || csvData.length === 0) {
      toast({
        title: "No column selected",
        description: "Please select a column to use for QR codes.",
        variant: "destructive",
      });
      return;
    }

    const items: BatchQRItem[] = csvData
      .map((row, index) => ({
        id: `csv-${index}`,
        data: row[selectedColumn] || "",
        name: (row[selectedColumn] || `item-${index}`).slice(0, 30),
        selected: true,
      }))
      .filter((item) => item.data.length > 0);

    if (items.length === 0) {
      toast({
        title: "No valid data",
        description: "The selected column has no valid values.",
        variant: "destructive",
      });
      return;
    }

    onItemsGenerated(items);
    toast({
      title: "Items ready",
      description: `${items.length} QR codes ready to generate.`,
    });
  }, [csvData, selectedColumn, onItemsGenerated]);

  const clearCsv = () => {
    setCsvColumns([]);
    setCsvData([]);
    setSelectedColumn("");
  };

  return (
    <div className="space-y-6">
      {/* Text Input Mode */}
      <div className="space-y-3">
        <Label className="font-bold uppercase text-sm flex items-center gap-2">
          <List className="w-4 h-4" />
          Paste Values (one per line)
        </Label>
        <Textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="https://example1.com&#10;https://example2.com&#10;https://example3.com"
          className="min-h-[120px] font-mono text-sm border-2 border-foreground"
        />
        <Button
          onClick={handleTextParse}
          className="w-full border-2 border-foreground font-bold uppercase"
          variant="outline"
          disabled={!textInput.trim()}
        >
          Parse Text Input
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t-2 border-foreground" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 font-bold text-muted-foreground">or</span>
        </div>
      </div>

      {/* CSV Upload Mode */}
      <div className="space-y-3">
        <Label className="font-bold uppercase text-sm flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          Upload CSV/Excel File
        </Label>

        {csvColumns.length === 0 ? (
          <div className="border-2 border-dashed border-foreground p-6 text-center">
            <Input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <Label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-8 h-8" />
              <span className="font-bold uppercase text-sm">
                Click to upload CSV
              </span>
              <span className="text-xs text-muted-foreground">
                Supports .csv and .txt files
              </span>
            </Label>
          </div>
        ) : (
          <div className="border-2 border-foreground p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">
                {csvData.length} rows loaded
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCsv}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold">
                Select Column for QR Data
              </Label>
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
                className="w-full p-2 border-2 border-foreground bg-background text-foreground font-mono text-sm"
              >
                {csvColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleCsvGenerate}
              className="w-full border-2 border-foreground font-bold uppercase"
              variant="outline"
            >
              Generate from CSV
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
