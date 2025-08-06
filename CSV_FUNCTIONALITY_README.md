# 📊 Package CSV Export & Import Guide

This guide explains how to use the CSV export and import functionality for packages in the Trippy Backend API.

## 🚀 API Endpoints

### Export Packages to CSV
```
GET /api/packages/export/csv
```

**Response:** Downloads a CSV file with all package data

### Import Packages from CSV
```
POST /api/packages/import/csv
Content-Type: multipart/form-data
```

**Request Body:**
- `csvFile`: CSV file to upload

**Response:**
```json
{
  "success": true,
  "message": "Import completed. 5 successful, 0 failed",
  "results": {
    "total": 5,
    "successful": 5,
    "failed": 0,
    "errors": []
  }
}
```

## 📋 CSV Format

### Required Fields
- `Name`: Package name
- `Description`: Package description
- `Overview`: Package overview

### Optional Fields
- `Duration`: Package duration (e.g., "2 Days")
- `Original Price`: Original price
- `Offer Price`: Offer price
- `Advance Payment`: Advance payment amount
- `City`: City name
- `State`: State name
- `Region`: Region name
- `Category`: Category name (must exist in database)
- `Max Participants`: Maximum participants
- `Is Active`: "Yes" or "No"
- `Is Featured`: "Yes" or "No"
- `Start Date`: Start date
- `End Date`: End date
- `Trip Type`: "Bike", "Trek", "Backpack", "4x4"
- `Season`: Season name
- `Rating`: Numeric rating
- `Views`: Number of views
- `Bookings Count`: Number of bookings
- `Tags`: Comma-separated tags
- `Labels`: Comma-separated labels
- `Standout Reason`: Standout reason text
- `Is New`: "Yes" or "No"
- `Is Trending`: "Yes" or "No"
- `Trending Score`: Numeric trending score

## 📝 CSV Example

```csv
Name,Description,Overview,Duration,Original Price,Offer Price,Advance Payment,City,State,Region,Category,Max Participants,Is Active,Is Featured,Start Date,End Date,Trip Type,Season,Rating,Views,Bookings Count,Tags,Labels,Standout Reason,Is New,Is Trending,Trending Score
"Manali Trek Package","Amazing trek in Manali","Experience the beauty of Manali","3 Days","8000","7200","3000","Manali","Himachal Pradesh","Northern India","Adventure","15","Yes","Yes","2024-01-15","2024-01-18","Trek","Winter","4.5","100","25","adventure,trek,manali","popular,trending","Best value for money","Yes","No","0"
"Goa Beach Package","Relaxing beach vacation","Enjoy the beaches of Goa","4 Days","12000","10800","4000","Goa","Goa","Western India","Leisure","20","Yes","No","2024-02-01","2024-02-05","Backpack","Spring","4.8","150","30","beach,leisure,goa","new","Amazing beach experience","No","Yes","85"
```

## 🔧 Usage Examples

### Using cURL

#### Export Packages
```bash
curl -X GET "http://localhost:5000/api/packages/export/csv" \
  -H "Content-Type: application/json" \
  --output packages_export.csv
```

#### Import Packages
```bash
curl -X POST "http://localhost:5000/api/packages/import/csv" \
  -F "csvFile=@packages_import.csv"
```

### Using JavaScript/Fetch

#### Export Packages
```javascript
const response = await fetch('http://localhost:5000/api/packages/export/csv');
if (response.ok) {
  const csvContent = await response.text();
  // Save or process the CSV content
  console.log('CSV exported successfully');
}
```

#### Import Packages
```javascript
const formData = new FormData();
formData.append('csvFile', csvFile); // csvFile is a File object

const response = await fetch('http://localhost:5000/api/packages/import/csv', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Import result:', result);
```

## ⚠️ Important Notes

1. **Category Validation**: The import process validates that categories exist in the database. Make sure categories are created before importing packages.

2. **Required Fields**: Name, Description, and Overview are required fields. Import will fail for rows missing these fields.

3. **Boolean Fields**: Use "Yes" or "No" for boolean fields (Is Active, Is Featured, Is New, Is Trending).

4. **Arrays**: Tags and Labels should be comma-separated values.

5. **Quotes**: Text fields containing commas should be wrapped in double quotes.

6. **Error Handling**: The import process provides detailed error messages for failed rows.

## 🧪 Testing

Run the test script to verify the functionality:

```bash
node test-csv-export-import.js
```

This will:
1. Export existing packages to CSV
2. Create a test CSV file
3. Import the test data
4. Show results

## 📊 Export Features

- **All Package Data**: Exports all package fields including relationships
- **Populated References**: Category, Vendor, and Guide names are included
- **Formatted Dates**: Dates are exported in ISO format
- **Quoted Text**: Text fields with commas are properly quoted
- **Downloadable**: Sets proper headers for file download

## 📥 Import Features

- **Validation**: Validates required fields and category existence
- **Error Reporting**: Provides detailed error messages for failed rows
- **Batch Processing**: Processes multiple rows in a single request
- **Flexible Format**: Handles various CSV formats and encodings
- **Progress Tracking**: Reports success/failure counts

## 🔄 Workflow

1. **Export**: Use the export endpoint to get current package data
2. **Edit**: Modify the CSV file as needed
3. **Validate**: Ensure all required fields are present
4. **Import**: Upload the modified CSV file
5. **Review**: Check the import results for any errors

## 🎯 Frontend Integration

The CSV functionality is integrated into the packages page with:

- **Export Button**: Downloads all packages as CSV
- **Template Download**: Provides a sample CSV template
- **File Upload**: Drag-and-drop or click to select CSV files
- **Validation**: Real-time validation before import
- **Progress Tracking**: Shows import progress and results
- **Error Display**: Detailed error messages for failed imports

## 🛠️ Technical Implementation

### Backend API
- **Export**: Generates CSV with proper headers and data formatting
- **Import**: Parses CSV, validates data, and creates packages
- **Error Handling**: Comprehensive error reporting for validation failures

### Frontend Components
- **CSVImportExport**: Main component for import/export functionality
- **Validation**: Client-side validation before server upload
- **Progress**: Real-time progress tracking and status updates

### Utilities
- **CSV Utils**: Helper functions for CSV parsing and generation
- **Validation**: Data validation and error reporting
- **Download**: Browser-compatible file download functionality

This functionality makes it easy to bulk manage package data through CSV files, which is useful for data migration, backups, and bulk updates. 