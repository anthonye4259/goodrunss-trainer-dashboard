"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"

type ImportType = "clients" | "sessions" | "payments"

interface CSVImportProps {
  type: ImportType
  onImportComplete?: () => void
}

export function CSVImport({ type, onImportComplete }: CSVImportProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const typeConfig = {
    clients: {
      title: "Import Clients",
      description: "Upload a CSV file with your existing client data",
      icon: FileSpreadsheet,
      sampleFields: ["name", "email", "phone", "location", "notes"],
      endpoint: "/api/import/clients",
    },
    sessions: {
      title: "Import Sessions",
      description: "Upload a CSV file with your past session history",
      icon: FileSpreadsheet,
      sampleFields: ["client_email", "date", "time", "duration", "type", "notes"],
      endpoint: "/api/import/sessions",
    },
    payments: {
      title: "Import Payments",
      description: "Upload a CSV file with your payment history",
      icon: FileSpreadsheet,
      sampleFields: ["client_email", "amount", "date", "status", "description"],
      endpoint: "/api/import/payments",
    },
  }

  const config = typeConfig[type]

  const downloadTemplate = () => {
    const headers = config.sampleFields.join(",")
    const sampleRow = config.sampleFields.map(() => "").join(",")
    const csv = `${headers}\n${sampleRow}`
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type}_import_template.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Template downloaded!",
      description: `Fill in the CSV template and upload it back.`,
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file (.csv)",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(config.endpoint, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Import failed")
      }

      setImportResult({
        success: data.imported,
        failed: data.failed || 0,
        errors: data.errors || [],
      })

      toast({
        title: "Import complete!",
        description: `Successfully imported ${data.imported} ${type}.`,
      })

      if (onImportComplete) {
        onImportComplete()
      }
    } catch (error: any) {
      console.error("Import error:", error)
      toast({
        title: "Import failed",
        description: error.message || "Could not import CSV. Please check the format.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <config.icon className="h-5 w-5 text-primary" />
          {config.title}
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Download */}
        <div className="space-y-2">
          <Label>Step 1: Download Template</Label>
          <Button variant="outline" onClick={downloadTemplate} className="w-full gap-2">
            <Download className="h-4 w-4" />
            Download CSV Template
          </Button>
          <p className="text-xs text-muted-foreground">
            Required fields: {config.sampleFields.join(", ")}
          </p>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label>Step 2: Upload Filled CSV</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload CSV File
              </>
            )}
          </Button>
        </div>

        {/* Import Results */}
        {importResult && (
          <div className="space-y-2 p-4 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Import Complete
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-green-600">✅ Successfully imported: {importResult.success}</p>
              {importResult.failed > 0 && (
                <p className="text-destructive">❌ Failed: {importResult.failed}</p>
              )}
            </div>
            {importResult.errors.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Errors:</p>
                {importResult.errors.slice(0, 3).map((error, i) => (
                  <p key={i} className="text-xs text-destructive flex items-start gap-1">
                    <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    {error}
                  </p>
                ))}
                {importResult.errors.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{importResult.errors.length - 3} more errors
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p className="font-medium">💡 Tips:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Make sure email addresses are valid</li>
            <li>Dates should be in YYYY-MM-DD format</li>
            <li>Don't include extra columns not in template</li>
            <li>Save your file as CSV (not Excel format)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

