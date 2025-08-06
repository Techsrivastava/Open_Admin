import { NextRequest, NextResponse } from 'next/server'
import { createPackage } from '@/api/package-controller'
import { parseCSVContent, validateCSVData, csvToPackage } from '@/lib/utils/csv-utils'
import { getCategories } from '@/api/package-controller'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const csvFile = formData.get('csvFile') as File
    
    if (!csvFile) {
      return NextResponse.json(
        { error: 'No CSV file provided' },
        { status: 400 }
      )
    }

    // Read and parse CSV content
    const text = await csvFile.text()
    const csvData = parseCSVContent(text)
    
    if (csvData.length === 0) {
      return NextResponse.json(
        { error: 'Invalid CSV format or empty file' },
        { status: 400 }
      )
    }

    // Validate CSV data
    const validation = validateCSVData(csvData)
    
    if (validation.failed > 0) {
      return NextResponse.json({
        success: false,
        message: `Validation failed. ${validation.failed} rows have errors.`,
        results: validation
      }, { status: 400 })
    }

    // Get categories for validation
    const categoriesResponse = await getCategories()
    const categories = categoriesResponse.success ? categoriesResponse.data : []
    const categoryNames = categories.map((cat: any) => cat.name.toLowerCase())

    // Process each row
    const results = {
      total: csvData.length,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ row: number; field: string; message: string }>
    }

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i]
      const rowNumber = i + 2 // +2 because index is 0-based and we skip header
      
      try {
        // Validate category exists
        if (row.Category && !categoryNames.includes(row.Category.toLowerCase())) {
          results.errors.push({
            row: rowNumber,
            field: 'Category',
            message: `Category "${row.Category}" does not exist in the database`
          })
          results.failed++
          continue
        }

        // Convert CSV data to package format
        const packageData = csvToPackage(row)
        
        // Create FormData for the package
        const formData = new FormData()
        
        // Add all package fields
        Object.entries(packageData).forEach(([key, value]) => {
          if (key !== 'images' && key !== 'pdf') {
            if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value))
            } else if (typeof value === 'object') {
              formData.append(key, JSON.stringify(value))
            } else {
              formData.append(key, value.toString())
            }
          }
        })

        // Create package
        const response = await createPackage(formData)
        
        if (response.success) {
          results.successful++
        } else {
          results.errors.push({
            row: rowNumber,
            field: 'General',
            message: response.message || 'Failed to create package'
          })
          results.failed++
        }
      } catch (error) {
        results.errors.push({
          row: rowNumber,
          field: 'General',
          message: 'Unexpected error processing row'
        })
        results.failed++
      }
    }

    return NextResponse.json({
      success: results.failed === 0,
      message: `Import completed. ${results.successful} successful, ${results.failed} failed`,
      results
    })

  } catch (error) {
    console.error('CSV Import Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 