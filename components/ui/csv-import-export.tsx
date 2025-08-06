"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { exportPackagesToCSV, importPackagesFromCSV } from "@/api/package-controller"
import { downloadCSV, parseCSVContent, validateCSVData, generateCSVContent } from "@/lib/utils/csv-utils"
import type { CSVImportResult } from "@/lib/utils/csv-utils"

interface CSVImportExportProps {
  packages: any[]
  onImportSuccess: () => void
}

export default function CSVImportExport({ packages, onImportSuccess }: CSVImportExportProps) {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      // Generate CSV content from packages
      const csvContent = generateCSVContent(packages)
      
      if (csvContent) {
        downloadCSV(csvContent, `packages_export_${new Date().toISOString().split('T')[0]}.csv`)
        toast({
          title: "Export Successful",
          description: `Exported ${packages.length} packages to CSV`,
        })
      } else {
        toast({
          title: "Export Failed",
          description: "No packages to export",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export packages",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      setSelectedFile(file)
      setImportResult(null)
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file",
        variant: "destructive",
      })
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      })
      return
    }

    try {
      setIsImporting(true)
      
      // Read and validate the file
      const text = await selectedFile.text()
      const csvData = parseCSVContent(text)
      const validation = validateCSVData(csvData)
      
      setImportResult(validation)
      
      if (validation.failed > 0) {
        toast({
          title: "Validation Errors",
          description: `${validation.failed} rows have errors. Please fix them before importing.`,
          variant: "destructive",
        })
        return
      }

      // Import to backend
      const response = await importPackagesFromCSV(selectedFile)
      
      if (response.success) {
        toast({
          title: "Import Successful",
          description: response.data?.message || `Imported ${validation.successful} packages successfully`,
        })
        onImportSuccess()
        setSelectedFile(null)
        setImportResult(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        toast({
          title: "Import Failed",
          description: response.message || "Failed to import packages",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Import Failed",
        description: "Failed to import packages",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        Name: "Sample Package",
        Description: "This is a sample package description",
        Overview: "This is a sample package overview",
        Duration: "3 Days",
        "Original Price": "8000",
        "Offer Price": "7200",
        "Advance Payment": "3000",
        City: "Manali",
        State: "Himachal Pradesh",
        Region: "Northern India",
        Category: "Adventure",
        "Max Participants": "15",
        "Is Active": "Yes",
        "Is Featured": "Yes",
        "Start Date": "2024-01-15",
        "End Date": "2024-01-18",
        "Trip Type": "Trek",
        Season: "Winter",
        Rating: "4.5",
        Views: "100",
        "Bookings Count": "25",
        Tags: "adventure,trek,manali",
        Labels: "popular,trending",
        "Standout Reason": "Best value for money",
        "Is New": "Yes",
        "Is Trending": "No",
        "Trending Score": "0"
      }
    ]
    
    const csvContent = generateCSVContent(templateData)
    downloadCSV(csvContent, "packages_template.csv")
    
    toast({
      title: "Template Downloaded",
      description: "CSV template downloaded successfully",
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CSV Import/Export
          </CardTitle>
          <CardDescription>
            Export packages to CSV or import packages from a CSV file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Export Packages</h3>
            <div className="flex gap-2">
              <Button
                onClick={handleExport}
                disabled={isExporting || packages.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : `Export ${packages.length} Packages`}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Download Template
              </Button>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Import Packages</h3>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="flex-1"
                placeholder="Select CSV file"
              />
              <Button
                onClick={handleImport}
                disabled={isImporting || !selectedFile}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isImporting ? "Importing..." : "Import"}
              </Button>
            </div>
          </div>

          {/* File Info */}
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{selectedFile.name}</span>
              <Badge variant="secondary">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </Badge>
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Import Results</h4>
                <div className="flex gap-2">
                  <Badge variant={importResult.failed === 0 ? "default" : "destructive"}>
                    {importResult.successful} Successful
                  </Badge>
                  {importResult.failed > 0 && (
                    <Badge variant="destructive">
                      {importResult.failed} Failed
                    </Badge>
                  )}
                </div>
              </div>
              
              <Progress 
                value={(importResult.successful / importResult.total) * 100} 
                className="h-2"
              />

              {/* Error Details */}
              {importResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <div key={index} className="text-xs">
                          Row {error.row}: {error.field} - {error.message}
                        </div>
                      ))}
                      {importResult.errors.length > 5 && (
                        <div className="text-xs">
                          ... and {importResult.errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 