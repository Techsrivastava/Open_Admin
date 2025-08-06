import { PackageFormValues } from "@/lib/validations/package"

export interface CSVPackageData {
  Name: string
  Description: string
  Overview: string
  Duration?: string
  "Original Price"?: string
  "Offer Price"?: string
  "Advance Payment"?: string
  City?: string
  State?: string
  Region?: string
  Category?: string
  "Max Participants"?: string
  "Is Active"?: string
  "Is Featured"?: string
  "Start Date"?: string
  "End Date"?: string
  "Trip Type"?: string
  Season?: string
  Rating?: string
  Views?: string
  "Bookings Count"?: string
  Tags?: string
  Labels?: string
  "Standout Reason"?: string
  "Is New"?: string
  "Is Trending"?: string
  "Trending Score"?: string
}

export interface CSVImportResult {
  total: number
  successful: number
  failed: number
  errors: Array<{
    row: number
    field: string
    message: string
  }>
}

// Convert package data to CSV format
export const packageToCSV = (packageData: any): CSVPackageData => {
  return {
    Name: packageData.name || "",
    Description: packageData.description || "",
    Overview: packageData.overview || "",
    Duration: packageData.duration || "",
    "Original Price": packageData.originalPrice || "",
    "Offer Price": packageData.offerPrice || "",
    "Advance Payment": packageData.advancePayment || "",
    City: packageData.city || "",
    State: packageData.state || "",
    Region: packageData.region || "",
    Category: packageData.category?.name || packageData.category || "",
    "Max Participants": packageData.maxParticipants || "",
    "Is Active": packageData.isActive ? "Yes" : "No",
    "Is Featured": packageData.isFeatured ? "Yes" : "No",
    "Start Date": packageData.startDate || "",
    "End Date": packageData.endDate || "",
    "Trip Type": packageData.tripType || "",
    Season: packageData.season || "",
    Rating: packageData.rating?.toString() || "",
    Views: packageData.views?.toString() || "",
    "Bookings Count": packageData.bookingsCount?.toString() || "",
    Tags: Array.isArray(packageData.tags) ? packageData.tags.join(", ") : packageData.tags || "",
    Labels: Array.isArray(packageData.labels) ? packageData.labels.join(", ") : packageData.labels || "",
    "Standout Reason": packageData.standoutReason || "",
    "Is New": packageData.isNew ? "Yes" : "No",
    "Is Trending": packageData.isTrending ? "Yes" : "No",
    "Trending Score": packageData.trendingScore?.toString() || "",
  }
}

// Convert CSV data to package format
export const csvToPackage = (csvData: CSVPackageData): Partial<PackageFormValues> => {
  return {
    name: csvData.Name,
    description: csvData.Description,
    overview: csvData.Overview,
    duration: csvData.Duration || "",
    originalPrice: csvData["Original Price"] || "",
    offerPrice: csvData["Offer Price"] || "",
    advancePayment: csvData["Advance Payment"] || "",
    city: csvData.City || "",
    state: csvData.State || "",
    region: csvData.Region || "",
    category: csvData.Category || "",
    maxParticipants: csvData["Max Participants"] || "",
    isActive: csvData["Is Active"]?.toLowerCase() === "yes",
    isFeatured: csvData["Is Featured"]?.toLowerCase() === "yes",
    startDate: csvData["Start Date"] || "",
    endDate: csvData["End Date"] || "",
    season: csvData.Season || "",
    rating: csvData.Rating ? parseFloat(csvData.Rating) : 0,
    views: csvData.Views ? parseInt(csvData.Views) : 0,
    bookingsCount: csvData["Bookings Count"] ? parseInt(csvData["Bookings Count"]) : 0,
    tags: csvData.Tags ? csvData.Tags.split(",").map(tag => tag.trim()) : [],
    labels: csvData.Labels ? csvData.Labels.split(",").map(label => label.trim()) : [],
    standoutReason: csvData["Standout Reason"] || "",
    isNew: csvData["Is New"]?.toLowerCase() === "yes",
    isTrending: csvData["Is Trending"]?.toLowerCase() === "yes",
    trendingScore: csvData["Trending Score"] ? parseFloat(csvData["Trending Score"]) : 0,
    // Default values for required arrays
    inclusions: [],
    exclusions: [],
    itinerary: [],
    howToReach: [],
    fitnessRequired: [],
    cancellationPolicy: [],
    whatToCarry: [],
    trekInfo: [],
    batchDates: [],
    additionalServices: [],
    faq: [],
    images: {
      cardImage: "",
      trekMap: "",
      gallery: []
    },
    pdf: [],
    assignedGuides: [],
    moreLikeThis: [],
  }
}

// Generate CSV content from packages array
export const generateCSVContent = (packages: any[]): string => {
  if (packages.length === 0) return ""

  // Get headers from the first package
  const headers = Object.keys(packageToCSV(packages[0]))
  
  // Create CSV header row
  const csvRows = [headers.join(",")]
  
  // Add data rows
  packages.forEach(pkg => {
    const csvData = packageToCSV(pkg)
    const row = headers.map(header => {
      const value = csvData[header as keyof CSVPackageData] || ""
      // Escape quotes and wrap in quotes if contains comma
      const escapedValue = String(value).replace(/"/g, '""')
      return escapedValue.includes(",") ? `"${escapedValue}"` : escapedValue
    })
    csvRows.push(row.join(","))
  })
  
  return csvRows.join("\n")
}

// Parse CSV content to array of objects
export const parseCSVContent = (csvContent: string): CSVPackageData[] => {
  const lines = csvContent.trim().split("\n")
  if (lines.length < 2) return []
  
  const headers = lines[0].split(",").map(h => h.trim())
  const data: CSVPackageData[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const values = parseCSVLine(line)
    
    if (values.length === headers.length) {
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ""
      })
      data.push(row as CSVPackageData)
    }
  }
  
  return data
}

// Parse a single CSV line, handling quoted values
export const parseCSVLine = (line: string): string[] => {
  const values: string[] = []
  let current = ""
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  
  // Add the last field
  values.push(current.trim())
  
  return values
}

// Validate CSV data
export const validateCSVData = (csvData: CSVPackageData[]): CSVImportResult => {
  const result: CSVImportResult = {
    total: csvData.length,
    successful: 0,
    failed: 0,
    errors: []
  }
  
  csvData.forEach((row, index) => {
    const rowNumber = index + 2 // +2 because index is 0-based and we skip header
    
    // Check required fields
    if (!row.Name?.trim()) {
      result.errors.push({
        row: rowNumber,
        field: "Name",
        message: "Name is required"
      })
    }
    
    if (!row.Description?.trim()) {
      result.errors.push({
        row: rowNumber,
        field: "Description",
        message: "Description is required"
      })
    }
    
    if (!row.Overview?.trim()) {
      result.errors.push({
        row: rowNumber,
        field: "Overview",
        message: "Overview is required"
      })
    }
    
    // Check boolean fields
    const booleanFields = ["Is Active", "Is Featured", "Is New", "Is Trending"]
    booleanFields.forEach(field => {
      const value = row[field as keyof CSVPackageData]
      if (value && !["yes", "no"].includes(value.toLowerCase())) {
        result.errors.push({
          row: rowNumber,
          field,
          message: `${field} must be "Yes" or "No"`
        })
      }
    })
    
    // Check numeric fields
    const numericFields = ["Rating", "Views", "Bookings Count", "Trending Score"]
    numericFields.forEach(field => {
      const value = row[field as keyof CSVPackageData]
      if (value && isNaN(parseFloat(value))) {
        result.errors.push({
          row: rowNumber,
          field,
          message: `${field} must be a number`
        })
      }
    })
    
    if (result.errors.filter(e => e.row === rowNumber).length === 0) {
      result.successful++
    } else {
      result.failed++
    }
  })
  
  return result
}

// Download CSV file
export const downloadCSV = (csvContent: string, filename: string = "packages.csv") => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
} 