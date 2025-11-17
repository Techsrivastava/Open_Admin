# Package Management Guide - Trek Vento Admin

## ✅ Backend Integration Status

**Backend URL:** `https://openbacken-production.up.railway.app/api`

All package management endpoints are properly configured and working:
- ✅ Create Package: `POST /packages/create`
- ✅ Get All Packages: `GET /packages`
- ✅ Get Package by ID: `GET /packages/:id`
- ✅ Update Package: `PUT /packages/:id`
- ✅ Delete Package: `DELETE /packages/:id`
- ✅ Get Categories: `GET /categories`

## 📋 Creating a New Package - Step by Step

### Tab 1: Basic Information
**Required Fields:**
- Package Name
- Overview (short description)
- Description (detailed)
- Duration (e.g., "5 days")
- City, State
- Category (select from dropdown)
- Original Price
- Max Participants

**Optional Fields:**
- Offer Price (if there's a discount)
- Advance Payment
- Region
- Start/End Date (seasonal dates)
- Tags (comma-separated)
- Labels (comma-separated)

**Tips:**
- Make the package name clear and descriptive
- Overview appears on package cards - keep it brief (2-3 lines)
- Description can be detailed with full information

### Tab 2: Package Details
**Required Fields:**
- Inclusions (what's included - enter each on new line)
- Exclusions (what's not included - enter each on new line)
- Itinerary (day-by-day plan)

**Itinerary Tips:**
- Click "Add Day" to add more days
- Enter a clear title for each day (e.g., "Arrival at Base Camp")
- Provide detailed description of activities
- Use the delete (X) button to remove days

**Other Details:**
- How to Reach (transport instructions)
- Fitness Required (physical requirements)
- Cancellation Policy (refund rules)
- What to Carry (list of items)
- FAQ (frequently asked questions)

### Tab 3: Dates & Pricing
**Batch Dates:**
- Add multiple batch dates for different groups
- Each batch can have different pricing
- Mark availability status

**Additional Services:**
- Add optional services (e.g., airport transfer)
- Set price for each service
- Mark as optional or mandatory

### Tab 4: Trek Information
**Standard Fields Available:**
- Rail Head (nearest railway station)
- Region
- Airport (nearest airport)
- Base Camp location
- Best Season
- Service From
- Grade (difficulty level)
- Stay type
- Trail Type
- Duration
- Meals
- Maximum Altitude
- Approx Trekking KM
- Fitness Required

**Tips:**
- Select field title from dropdown
- Enter appropriate value
- Add only relevant fields for your package

### Tab 5: Media & Documents
**Images Required:**
- Card Image (main package image - shows on listing)
- Trek Map (route map image)
- Gallery Images (multiple images)

**Documents:**
- Upload PDF brochures, detailed itinerary, etc.

**Image Tips:**
- Use high-quality images (recommended: 1920x1080)
- Keep file sizes reasonable (<2MB per image)
- Card image should be attractive and representative

## ✏️ Editing an Existing Package

1. Navigate to Packages page
2. Click "Edit" button on any package
3. All existing data will be pre-filled
4. Modify any fields as needed
5. Update images if required (existing images are preserved if not changed)
6. Click "Update Package" to save changes

**Important Notes:**
- Existing images will remain if you don't upload new ones
- You can add more gallery images without removing old ones
- Click the X button to remove specific gallery images

## 🔍 Package Listing & Management

**Features:**
- View all packages with pagination
- Search and filter packages
- See package status (Active/Inactive)
- Quick edit and delete options
- Export to CSV
- Import from CSV

**Package Status:**
- ✅ Active: Visible on website
- ❌ Inactive: Hidden from website
- ⭐ Featured: Highlighted on homepage
- 🔥 Trending: Marked as trending

## ⚠️ Common Issues & Solutions

### Error: "Failed to create package"
**Solutions:**
1. Check all required fields are filled
2. Verify images are not too large
3. Check internet connection
4. Try again after refreshing page

### Error: "Files are too large"
**Solutions:**
1. Compress images before uploading
2. Use image optimization tools
3. Keep each image under 2MB

### Error: "Category not found"
**Solutions:**
1. Refresh the page
2. Make sure categories exist in system
3. Contact admin if categories are missing

### Images not uploading
**Solutions:**
1. Check file format (JPG, PNG, WEBP supported)
2. Reduce file size
3. Try uploading one at a time
4. Clear browser cache

### Form validation errors
**Solutions:**
1. Look for red error messages under fields
2. Fill all required fields (marked with *)
3. Check format of dates and numbers
4. Scroll through all tabs to find errors

## 💡 Best Practices

### Content:
- Write clear, engaging package descriptions
- Use bullet points for inclusions/exclusions
- Provide detailed day-wise itinerary
- Include all important information upfront

### Images:
- Use professional, high-quality photos
- Show actual trek locations
- Include variety of shots (landscapes, activities, camps)
- Ensure card image is attention-grabbing

### Pricing:
- Be transparent about what's included
- Clearly mention additional costs
- Add batch dates well in advance
- Keep pricing competitive

### SEO & Visibility:
- Use relevant tags
- Add accurate location information
- Mark popular packages as featured
- Update trending packages regularly

## 🔄 Workflow Recommendations

### For New Packages:
1. Prepare all content in a document first
2. Optimize and prepare all images
3. Fill Basic Info tab completely
4. Add detailed inclusions/exclusions
5. Create day-wise itinerary
6. Upload images
7. Review everything before submitting

### For Updates:
1. Make a list of changes needed
2. Load the edit page
3. Update only necessary fields
4. Double-check changes
5. Save and verify on listing

## 📞 Support

If you encounter persistent issues:
1. Check browser console for errors (F12)
2. Try in incognito mode
3. Clear cache and cookies
4. Contact technical support with error details

## 🚀 Future Enhancements

Planned improvements:
- Auto-save drafts
- Bulk image upload with drag-drop
- Template-based package creation
- Clone existing packages
- Advanced filtering and search
- Real-time validation
- Image editor integration
