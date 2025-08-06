import { NextRequest, NextResponse } from 'next/server'
import { getPackages } from '@/api/package-controller'
import { generateCSVContent } from '@/lib/utils/csv-utils'

export async function GET(request: NextRequest) {
  try {
    // Get packages from the backend
    const response = await getPackages()
    
    if (!response.success || !response.data) {
      return NextResponse.json(
        { error: 'Failed to fetch packages' },
        { status: 500 }
      )
    }

    // Generate CSV content
    const csvContent = generateCSVContent(response.data)
    
    if (!csvContent) {
      return NextResponse.json(
        { error: 'No packages to export' },
        { status: 404 }
      )
    }

    // Create response with CSV content
    const filename = `packages_export_${new Date().toISOString().split('T')[0]}.csv`
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('CSV Export Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 