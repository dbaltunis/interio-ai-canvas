import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ImportStatus {
  format: string;
  status: "pending" | "uploading" | "running" | "done" | "error";
  uploadProgress?: string;
  result?: {
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
  };
  error?: string;
}

const IMPORT_FILES = [
  { format: "dateks_pricelist_2023", file: "/import-data/CSV_DATEKS_Pricelist_2023.csv", label: "DATEKS Pricelist 2023 (~1,799 fabrics)" },
  { format: "dateks_expo_2024", file: "/import-data/CSV_DATEKS_Expo_2024.csv", label: "DATEKS Expo 2024 (~2,359 fabrics)" },
  { format: "cnv_trimmings", file: "/import-data/CSV_Triming_CNV.csv", label: "CNV Trimmings (14 items)" },
  { format: "eurofirany", file: "/import-data/CSV_EUROFIRANY_All_Collections.csv", label: "EUROFIRANY All Collections (233 fabrics)" },
  { format: "iks_forma", file: "/import-data/CSV_IKS_FORMA_Full_Catalog.csv", label: "IKS FORMA Hardware (181 items)" },
];

const CHUNK_SIZE = 200;
const SMALL_FILE_THRESHOLD = 100;

function splitCsvIntoChunks(csvData: string, chunkSize: number): string[] {
  const lines = csvData.split("\n");
  const header = lines[0];
  const dataLines = lines.slice(1).filter(l => l.trim());

  if (dataLines.length <= chunkSize) {
    return [csvData];
  }

  const chunks: string[] = [];
  for (let i = 0; i < dataLines.length; i += chunkSize) {
    const chunkLines = dataLines.slice(i, i + chunkSize);
    // First chunk gets header, subsequent chunks are data only
    if (i === 0) {
      chunks.push([header, ...chunkLines].join("\n"));
    } else {
      chunks.push(chunkLines.join("\n"));
    }
  }
  return chunks;
}

export const LaelLibraryImport = () => {
  const [statuses, setStatuses] = useState<ImportStatus[]>(
    IMPORT_FILES.map(f => ({ format: f.format, status: "pending" }))
  );
  const [running, setRunning] = useState(false);

  const updateStatus = (idx: number, update: Partial<ImportStatus>) => {
    setStatuses(prev => prev.map((s, i) => i === idx ? { ...s, ...update } : s));
  };

  const runImport = async () => {
    setRunning(true);

    for (let i = 0; i < IMPORT_FILES.length; i++) {
      const { format, file } = IMPORT_FILES[i];

      try {
        // Fetch CSV from public folder
        updateStatus(i, { status: "uploading", uploadProgress: "Fetching file..." });
        const resp = await fetch(file);
        if (!resp.ok) throw new Error(`Failed to fetch ${file}: ${resp.status}`);
        const csvData = await resp.text();
        const lineCount = csvData.split("\n").filter(l => l.trim()).length;

        console.log(`[Import] ${format}: ${lineCount} lines`);

        if (lineCount <= SMALL_FILE_THRESHOLD) {
          // Small file: send directly
          updateStatus(i, { status: "running", uploadProgress: undefined });
          const { data, error } = await supabase.functions.invoke("import-client-library", {
            body: { format, csv_data: csvData },
          });
          if (error) throw error;
          updateStatus(i, { status: "done", result: data });
        } else {
          // Large file: chunked upload then import
          const chunks = splitCsvIntoChunks(csvData, CHUNK_SIZE);
          console.log(`[Import] ${format}: splitting into ${chunks.length} chunks`);

          for (let c = 0; c < chunks.length; c++) {
            updateStatus(i, {
              status: "uploading",
              uploadProgress: `Uploading chunk ${c + 1} of ${chunks.length}...`,
            });

            const { error } = await supabase.functions.invoke("import-client-library", {
              body: {
                action: "upload",
                format,
                csv_data: chunks[c],
                append: c > 0,
              },
            });
            if (error) throw new Error(`Upload chunk ${c + 1} failed: ${error.message}`);
          }

          // Now trigger the actual import from storage
          updateStatus(i, { status: "running", uploadProgress: undefined });
          const { data, error } = await supabase.functions.invoke("import-client-library", {
            body: { format },
          });
          if (error) throw error;
          updateStatus(i, { status: "done", result: data });
        }
      } catch (err: any) {
        updateStatus(i, { status: "error", error: err.message, uploadProgress: undefined });
      }
    }

    setRunning(false);
  };

  const totalCreated = statuses.reduce((sum, s) => sum + (s.result?.created || 0), 0);
  const totalUpdated = statuses.reduce((sum, s) => sum + (s.result?.updated || 0), 0);
  const totalErrors = statuses.reduce((sum, s) => sum + (s.result?.errors?.length || 0), 0);
  const doneCount = statuses.filter(s => s.status === "done" || s.status === "error").length;
  const progress = (doneCount / statuses.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Laela Library Import
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Import DATEKS fabrics and CNV trimmings for account baltunis+laela@curtainscalculator.com
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {statuses.map((s, i) => (
          <div key={s.format} className="flex items-center gap-3 p-3 rounded-lg border">
            {s.status === "pending" && <div className="h-5 w-5 rounded-full border-2 border-muted" />}
            {(s.status === "uploading" || s.status === "running") && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            {s.status === "done" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {s.status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
            <div className="flex-1">
              <div className="font-medium text-sm">{IMPORT_FILES[i].label}</div>
              {s.uploadProgress && (
                <div className="text-xs text-primary">{s.uploadProgress}</div>
              )}
              {s.status === "running" && (
                <div className="text-xs text-primary">Processing import...</div>
              )}
              {s.result && (
                <div className="text-xs text-muted-foreground">
                  Created: {s.result.created} | Updated: {s.result.updated}
                  {s.result.errors.length > 0 && ` | Errors: ${s.result.errors.length}`}
                </div>
              )}
              {s.error && <div className="text-xs text-destructive">{s.error}</div>}
            </div>
          </div>
        ))}

        {running && <Progress value={progress} className="h-2" />}

        {!running && statuses.some(s => s.status === "done") && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Import Complete: {totalCreated} created, {totalUpdated} updated
              {totalErrors > 0 && `, ${totalErrors} errors`}
            </p>
          </div>
        )}

        <Button onClick={runImport} disabled={running} className="w-full">
          {running ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : statuses.some(s => s.status === "done") ? (
            "Re-run Import"
          ) : (
            "Start Import"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
