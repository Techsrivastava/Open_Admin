"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/image-upload";
import { toast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import "react-quill/dist/quill.snow.css";
import Quill from 'quill';



const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  coverImage: z.any().refine((file) => file instanceof File || typeof file === 'string', {
    message: "Cover image is required",
  }),
  author: z.string().min(1, "Author is required"),
  tags: z.string().min(1, "Tags are required"),
  metaTitle: z.string().min(1, "Meta title is required"),
  metaDescription: z.string().min(1, "Meta description is required"),
  isPublished: z.boolean().default(false),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

const API_BASE_URL = 'https://trippybackend-production.up.railway.app/api/v1';

// Configure ReactQuill modules
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ],
  
  clipboard: {
    matchVisual: false
  }
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'script',
  'indent',
  'direction',
  'color', 'background',
  'font',
  'align',
  'blockquote', 'code-block',
  'link', 'image', 'video'
];

const ReactQuill = dynamic(() => import("react-quill").then(mod => mod.default), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

export default function CreateBlogPage() {
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      coverImage: null,
      author: "",
      tags: "",
      metaTitle: "",
      metaDescription: "",
      isPublished: false,
    },
  });

  const handleAddBlog = async (data: BlogFormValues) => {
    try {
      const formData = new FormData();
      
      // Handle all form fields
      Object.keys(data).forEach(key => {
        if (key === 'coverImage') {
          if (data[key] instanceof File) {
            formData.append('coverImage', data[key]);
          } else if (typeof data[key] === 'string' && data[key]) {
            formData.append('coverImage', data[key]);
          }
        } else if (key === 'tags') {
          const tagsValue = typeof data[key] === 'string' 
            ? data[key].split(',').map((tag: string) => tag.trim())
            : data[key];
          formData.append('tags', JSON.stringify(tagsValue));
        } else {
          formData.append(key, data[key]);
        }
      });

      await axios.post(`${API_BASE_URL}/blogs`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast({ title: "Success", description: "Blog created successfully" });
      router.push("/dashboard/blogs");
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || error.message, 
        variant: "destructive" 
      });
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Add New Blog</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAddBlog)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter blog title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter author name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

            <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <div className="bg-white rounded-md border overflow-hidden">
                    <ReactQuill 
                      theme="snow" 
                      value={field.value} 
                      onChange={field.onChange}
                      modules={modules}
                      formats={formats}
                      className="min-h-[800px]"
                      style={{
    minHeight: "800px",
    maxHeight: "1000000px",
    overflowY: "auto"
  }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter blog excerpt" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Cover Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={value}
                      onChange={(file) => {
                        if (file instanceof File) {
                          onChange(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setPreviewImage(reader.result as string);
                          reader.readAsDataURL(file);
                        } else {
                          onChange(file);
                          setPreviewImage(file);
                        }
                      }}
                      error={form.formState.errors.coverImage?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (comma-separated)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., travel, adventure" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meta title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meta description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row items-center justify-between rounded-lg border p-2 mt-2 gap-2">
                <div className="space-y-0.5">
                  <FormLabel>Published</FormLabel>
                  <div className="text-xs text-muted-foreground">Make this blog visible to the public</div>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-2">Create Blog</Button>
        </form>
      </Form>
    </div>
  );
}    