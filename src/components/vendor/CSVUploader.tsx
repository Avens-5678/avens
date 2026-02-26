import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreateInventoryItem } from "@/hooks/useVendorInventory";
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParsedRow {
  name: string;
  description: string;
  quantity: number;
  price_per_day: number;
  category: string;
  image_url: string;
}

const CSVUploader = () => {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: createItem } = useCreateInventoryItem();
  const { toast } = useToast();

  const downloadTemplate = () => {
    const headers = "name,description,quantity,price_per_day,category,image_url";
    const sample = 'LED Stage Light,Professional 200W LED light,10,500,Lighting,https://example.com/light.jpg';
    const csv = `${headers}\n${sample}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      setErrors(["CSV must have a header row and at least one data row."]);
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredHeaders = ["name"];
    const missing = requiredHeaders.filter((h) => !headers.includes(h));
    if (missing.length) {
      setErrors([`Missing required columns: ${missing.join(", ")}`]);
      return;
    }

    const rows: ParsedRow[] = [];
    const rowErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length < headers.length) {
        rowErrors.push(`Row ${i}: not enough columns`);
        continue;
      }

      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });

      if (!row.name) {
        rowErrors.push(`Row ${i}: name is required`);
        continue;
      }

      rows.push({
        name: row.name,
        description: row.description || "",
        quantity: parseInt(row.quantity) || 1,
        price_per_day: parseFloat(row.price_per_day) || 0,
        category: row.category || "General",
        image_url: row.image_url || "",
      });
    }

    setParsedRows(rows);
    setErrors(rowErrors);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      parseCSV(ev.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    setUploadedCount(0);
    let count = 0;

    for (const row of parsedRows) {
      try {
        await createItem({
          name: row.name,
          description: row.description,
          quantity: row.quantity,
          price_per_day: row.price_per_day,
          image_url: row.image_url || undefined,
        });
        count++;
        setUploadedCount(count);
      } catch {
        // Error toast handled by the hook
      }
    }

    setIsUploading(false);
    toast({
      title: "CSV Import Complete",
      description: `${count} of ${parsedRows.length} items imported successfully.`,
    });
    setParsedRows([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          CSV Bulk Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Select CSV File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {errors.length > 0 && (
          <div className="space-y-1">
            {errors.map((err, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {err}
              </div>
            ))}
          </div>
        )}

        {parsedRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {parsedRows.length} items ready to import
              </span>
              <Button onClick={handleUploadAll} disabled={isUploading} size="sm">
                {isUploading ? (
                  <>Importing {uploadedCount}/{parsedRows.length}...</>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Import All
                  </>
                )}
              </Button>
            </div>

            <div className="max-h-48 overflow-auto rounded border">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Qty</th>
                    <th className="p-2 text-left">₹/day</th>
                    <th className="p-2 text-left">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{row.name}</td>
                      <td className="p-2">{row.quantity}</td>
                      <td className="p-2">{row.price_per_day}</td>
                      <td className="p-2">
                        <Badge variant="secondary">{row.category}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CSVUploader;
