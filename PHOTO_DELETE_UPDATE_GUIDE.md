# Photo Delete & Update Feature Guide

## Frontend Changes Made

### 1. Added State for Tracking Deleted Images
```typescript
const [deletedImages, setDeletedImages] = useState<{
  cardImage?: string
  trekMap?: string
  gallery?: string[]
}>({
  cardImage: undefined,
  trekMap: undefined,
  gallery: []
})
```

### 2. Updated Image Removal Functions
```typescript
const removeExistingGalleryImage = (index: number) => {
  const imageToDelete = existingImages.gallery?.[index]
  if (imageToDelete) {
    // Add to deleted images list
    setDeletedImages(prev => ({
      ...prev,
      gallery: [...(prev.gallery || []), imageToDelete]
    }))
    // Remove from existing images
    setExistingImages(prev => ({ 
      ...prev, 
      gallery: prev.gallery?.filter((_, i) => i !== index) || [] 
    }))
  }
}

const removeExistingCardImage = () => {
  if (existingImages.cardImage) {
    setDeletedImages(prev => ({
      ...prev,
      cardImage: existingImages.cardImage
    }))
    setExistingImages(prev => ({ ...prev, cardImage: undefined }))
  }
}

const removeExistingTrekMap = () => {
  if (existingImages.trekMap) {
    setDeletedImages(prev => ({
      ...prev,
      trekMap: existingImages.trekMap
    }))
    setExistingImages(prev => ({ ...prev, trekMap: undefined }))
  }
}
```

### 3. Updated Form Submission
```typescript
// Send deleted images for backend cleanup
if (deletedImages.cardImage || deletedImages.trekMap || (deletedImages.gallery && deletedImages.gallery.length > 0)) {
  formData.append("deletedImages", JSON.stringify(deletedImages))
}
```

## Backend Changes Required (Open_Backen/controllers/packageController.js)

### 1. Update Package Controller to Handle Deleted Images

Add this function to extract S3 key from URL (already exists):
```javascript
function getS3KeyFromUrl(url) {
  const match = url.match(/trippy-india-uploads\/(.*)$/);
  return match ? match[1] : null;
}
```

### 2. Add Image Deletion Logic in updatePackage Function

```javascript
export const updatePackage = async (req, res) => {
  try {
    const { _id } = req.body;
    
    // Handle deleted images cleanup
    if (req.body.deletedImages) {
      const deletedImages = JSON.parse(req.body.deletedImages);
      
      // Delete card image from S3
      if (deletedImages.cardImage) {
        const cardImageKey = getS3KeyFromUrl(deletedImages.cardImage);
        if (cardImageKey) {
          await s3.deleteObject({
            Bucket: BUCKET_NAME,
            Key: cardImageKey
          }).promise();
          console.log(`🗑️ Deleted card image: ${cardImageKey}`);
        }
      }
      
      // Delete trek map from S3
      if (deletedImages.trekMap) {
        const trekMapKey = getS3KeyFromUrl(deletedImages.trekMap);
        if (trekMapKey) {
          await s3.deleteObject({
            Bucket: BUCKET_NAME,
            Key: trekMapKey
          }).promise();
          console.log(`🗑️ Deleted trek map: ${trekMapKey}`);
        }
      }
      
      // Delete gallery images from S3
      if (deletedImages.gallery && deletedImages.gallery.length > 0) {
        for (const galleryImage of deletedImages.gallery) {
          const galleryKey = getS3KeyFromUrl(galleryImage);
          if (galleryKey) {
            await s3.deleteObject({
              Bucket: BUCKET_NAME,
              Key: galleryKey
            }).promise();
            console.log(`🗑️ Deleted gallery image: ${galleryKey}`);
          }
        }
      }
    }
    
    // Continue with existing update logic...
    // Handle new image uploads
    // Update package in database
    
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update package' 
    });
  }
}
```

### 3. Complete Backend Implementation Example

```javascript
export const updatePackage = async (req, res) => {
  try {
    console.log("\n=== Starting Package Update ===");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    
    const { _id } = req.body;
    
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Package ID is required"
      });
    }

    // Find existing package
    const existingPackage = await Package.findById(_id);
    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found"
      });
    }

    // Handle deleted images cleanup
    if (req.body.deletedImages) {
      const deletedImages = JSON.parse(req.body.deletedImages);
      console.log("🗑️ Processing deleted images:", deletedImages);
      
      // Delete card image from S3
      if (deletedImages.cardImage) {
        const cardImageKey = getS3KeyFromUrl(deletedImages.cardImage);
        if (cardImageKey) {
          try {
            await s3.deleteObject({
              Bucket: BUCKET_NAME,
              Key: cardImageKey
            }).promise();
            console.log(`✅ Deleted card image: ${cardImageKey}`);
          } catch (s3Error) {
            console.error(`❌ Failed to delete card image: ${cardImageKey}`, s3Error);
          }
        }
      }
      
      // Delete trek map from S3
      if (deletedImages.trekMap) {
        const trekMapKey = getS3KeyFromUrl(deletedImages.trekMap);
        if (trekMapKey) {
          try {
            await s3.deleteObject({
              Bucket: BUCKET_NAME,
              Key: trekMapKey
            }).promise();
            console.log(`✅ Deleted trek map: ${trekMapKey}`);
          } catch (s3Error) {
            console.error(`❌ Failed to delete trek map: ${trekMapKey}`, s3Error);
          }
        }
      }
      
      // Delete gallery images from S3
      if (deletedImages.gallery && deletedImages.gallery.length > 0) {
        for (const galleryImage of deletedImages.gallery) {
          const galleryKey = getS3KeyFromUrl(galleryImage);
          if (galleryKey) {
            try {
              await s3.deleteObject({
                Bucket: BUCKET_NAME,
                Key: galleryKey
              }).promise();
              console.log(`✅ Deleted gallery image: ${galleryKey}`);
            } catch (s3Error) {
              console.error(`❌ Failed to delete gallery image: ${galleryKey}`, s3Error);
            }
          }
        }
      }
    }

    // Continue with existing update logic for new images and package data...
    // [Rest of your existing updatePackage logic]
    
  } catch (error) {
    console.error('❌ Error updating package:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update package',
      error: error.message 
    });
  }
}
```

## How It Works

1. **Frontend**: When user clicks delete button on existing images, the image URL is added to `deletedImages` state
2. **Frontend**: On form submission, `deletedImages` is sent to backend as JSON string
3. **Backend**: Extracts S3 keys from image URLs and deletes them from S3 bucket
4. **Backend**: Updates package with new images and removes deleted image references

## Benefits

- ✅ **Proper Cleanup**: Old images are deleted from S3, preventing storage bloat
- ✅ **Cost Optimization**: Reduces S3 storage costs by removing unused images
- ✅ **Better UX**: Users can see immediate feedback when deleting images
- ✅ **Tracking**: All deleted images are properly tracked and cleaned up
- ✅ **Error Handling**: Individual image deletion errors don't break the entire update

## Testing

1. Edit a package with existing images
2. Delete some existing images using the X button
3. Add new images
4. Submit the form
5. Check S3 bucket to confirm old images are deleted
6. Verify new images are uploaded and package is updated
