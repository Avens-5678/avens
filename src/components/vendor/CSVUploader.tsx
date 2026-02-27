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
  short_description: string;
  quantity: number;
  price_value: number;
  pricing_unit: string;
  category: string;
  image_url: string;
  address: string;
}

const VALID_PRICING_UNITS = ["Per Hour", "Per Day", "Per Week", "Per Event", "Fixed Price", "Per Sq.Ft", "Per Sq.M"];

const CSVUploader = () => {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: createItem } = useCreateInventoryItem();
  const { toast } = useToast();

  const downloadTemplate = () => {
    const headers = "name,short_description,description,quantity,price_value,pricing_unit,category,address,image_url";
    const sample = '"LED Stage Light","Professional 200W LED","High-quality LED stage light for events",10,500,Per Day,Event Production Equipment,"Warehouse 5, HITEC City",https://example.com/light.jpg';
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

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
    const requiredHeaders = ["name"];
    const missing = requiredHeaders.filter((h) => !headers.includes(h));
    if (missing.length) {
      setErrors([`Missing required columns: ${missing.join(", ")}`]);
      return;
    }

    const rows: ParsedRow[] = [];
    const rowErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Basic CSV parsing that handles quoted fields
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const char of lines[i]) {
        if (char === '"') { inQuotes = !inQuotes; continue; }
        if (char === ',' && !inQuotes) { values.push(current.trim()); current = ""; continue; }
        current += char;
      }
      values.push(current.trim());

      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });

      if (!row.name) {
        rowErrors.push(`Row ${i}: name is required`);
        continue;
      }

      const pricingUnit = row.pricing_unit || "Per Day";

      rows.push({
        name: row.name,
        short_description: row.short_description || "",
        description: row.description || "",
        quantity: parseInt(row.quantity) || 1,
        price_value: parseFloat(row.price_value) || parseFloat(row.price_per_day) || 0,
        pricing_unit: VALID_PRICING_UNITS.includes(pricingUnit) ? pricingUnit : "Per Day",
        category: row.category || "General",
        image_url: row.image_url || "",
        address: row.address || "",
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
          short_description: row.short_description || undefined,
          quantity: row.quantity,
          price_value: row.price_value || undefined,
          pricing_unit: row.pricing_unit || undefined,
          image_url: row.image_url || undefined,
          address: row.address || undefined,
          categories: row.category ? [row.category] : [],
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

        <p className="text-xs text-muted-foreground">
          Template columns: name, short_description, description, quantity, price_value, pricing_unit (Per Hour/Per Day/Per Week/Per Event/Fixed Price/Per Sq.Ft/Per Sq.M), category, address, image_url
        </p>

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
                    <th className="p-2 text-left">Price</th>
                    <th className="p-2 text-left">Unit</th>
                    <th className="p-2 text-left">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{row.name}</td>
                      <td className="p-2">{row.quantity}</td>
                      <td className="p-2">₹{row.price_value}</td>
                      <td className="p-2 text-xs">{row.pricing_unit}</td>
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
