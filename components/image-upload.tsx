import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ImageUploadProps {
  value?: string | File;
  onChange: (file: File) => void;
  label?: string;
  error?: string;
}

export function ImageUpload({ value, onChange, label = "Cover Image", error }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Image
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          {(preview || (typeof value === 'string' && value)) && (
            <div className="relative w-full max-w-md">
              <img
                src={preview || value as string}
                alt="Cover preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
} 