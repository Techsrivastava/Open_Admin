const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:3000/api';

async function testCSVExportImport() {
  console.log('🧪 Testing CSV Export & Import Functionality\n');

  try {
    // Step 1: Export existing packages
    console.log('📤 Step 1: Exporting existing packages...');
    const exportResponse = await axios.get(`${API_URL}/packages/export/csv`, {
      responseType: 'stream'
    });
    
    const exportFilename = `packages_export_${new Date().toISOString().split('T')[0]}.csv`;
    const writer = fs.createWriteStream(exportFilename);
    exportResponse.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    console.log(`✅ Export successful: ${exportFilename}`);
    console.log(`📊 File size: ${(fs.statSync(exportFilename).size / 1024).toFixed(2)} KB\n`);

    // Step 2: Create test CSV data
    console.log('📝 Step 2: Creating test CSV data...');
    const testCSVData = `Name,Description,Overview,Duration,Original Price,Offer Price,Advance Payment,City,State,Region,Category,Max Participants,Is Active,Is Featured,Start Date,End Date,Trip Type,Season,Rating,Views,Bookings Count,Tags,Labels,Standout Reason,Is New,Is Trending,Trending Score
"Test Trek Package","A test trek package for validation","Experience the beauty of test mountains","2 Days","5000","4500","2000","Test City","Test State","Test Region","Adventure","10","Yes","No","2024-06-01","2024-06-03","Trek","Summer","4.0","50","10","test,trek,adventure","new","Great test package","Yes","No","0"
"Test Beach Package","A test beach package for validation","Relax at test beaches","3 Days","8000","7200","3000","Test Beach City","Test Beach State","Test Beach Region","Leisure","15","Yes","Yes","2024-07-01","2024-07-04","Backpack","Monsoon","4.5","75","15","test,beach,leisure","popular","Amazing test beach experience","No","Yes","75"`;

    const testFilename = 'test_packages_import.csv';
    fs.writeFileSync(testFilename, testCSVData);
    console.log(`✅ Test CSV created: ${testFilename}\n`);

    // Step 3: Import test data
    console.log('📥 Step 3: Importing test CSV data...');
    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream(testFilename));

    const importResponse = await axios.post(`${API_URL}/packages/import/csv`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    console.log('📊 Import Results:');
    console.log(`   Success: ${importResponse.data.success}`);
    console.log(`   Message: ${importResponse.data.message}`);
    
    if (importResponse.data.results) {
      console.log(`   Total: ${importResponse.data.results.total}`);
      console.log(`   Successful: ${importResponse.data.results.successful}`);
      console.log(`   Failed: ${importResponse.data.results.failed}`);
      
      if (importResponse.data.results.errors && importResponse.data.results.errors.length > 0) {
        console.log('   Errors:');
        importResponse.data.results.errors.forEach((error, index) => {
          console.log(`     ${index + 1}. Row ${error.row}: ${error.field} - ${error.message}`);
        });
      }
    }

    console.log('\n✅ Test completed successfully!');

    // Cleanup test files
    if (fs.existsSync(testFilename)) {
      fs.unlinkSync(testFilename);
      console.log(`🗑️  Cleaned up: ${testFilename}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testCSVExportImport(); 