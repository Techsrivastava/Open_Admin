"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { useEffect, useState, useRef } from "react";

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

const API_BASE_URL = 'https://openbacken-production.up.railway.app/api/v1';

const ReactQuill = dynamic(() => import("react-quill").then(mod => mod.default), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  const blogForm = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      coverImage: "",
      author: "",
      tags: "",
      metaTitle: "",
      metaDescription: "",
      isPublished: false,
    },
  });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { id } = params;
        const res = await axios.get(`${API_BASE_URL}/blogs/${id}`);
        const blog = res.data.data;
        blogForm.reset({
          title: blog.title,
          content: blog.content,
          excerpt: blog.excerpt,
          coverImage: blog.coverImage,
          author: blog.author,
          tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags,
          metaTitle: blog.metaTitle,
          metaDescription: blog.metaDescription,
          isPublished: blog.isPublished,
        });
        setPreviewImage(blog.coverImage);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load blog.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
    // eslint-disable-next-line
  }, [params.id]);

  const handleEditBlog = async (data: BlogFormValues) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'coverImage' && data[key] instanceof File) {
          formData.append('coverImage', data[key]);
        } else if (key === 'tags') {
          const tagsValue = typeof data[key] === 'string' 
            ? data[key].split(',').map((tag: string) => tag.trim())
            : data[key];
          formData.append('tags', JSON.stringify(tagsValue));
        } else if (key !== 'coverImage') {
          formData.append(key, data[key]);
        }
      });
      await axios.put(`${API_BASE_URL}/blogs/${params.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast({ title: "Success", description: "Blog updated successfully" });
      router.push("/dashboard/blogs");
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || error.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Blog</h2>
      <Form {...blogForm}>
        <form onSubmit={blogForm.handleSubmit(handleEditBlog)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={blogForm.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter blog title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={blogForm.control} name="author" render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input placeholder="Enter author name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={blogForm.control} name="content" render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <div className="bg-white rounded-md border overflow-hidden">
                  <ReactQuill theme="snow" value={field.value} onChange={field.onChange} className="min-h-[180px]" modules={{ toolbar: [[{ header: [1, 2, 3, false] }], ["bold", "italic", "underline", "strike"], [{ list: "ordered" }, { list: "bullet" }], ["blockquote", "code-block"], ["link", "image"], ["clean"]] }} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={blogForm.control} name="excerpt" render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter blog excerpt" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={blogForm.control} name="coverImage" render={({ field: { onChange, value, ...field } }) => (
              <ImageUpload value={value} onChange={(file) => {
                onChange(file);
                if (file instanceof File) {
                  const reader = new FileReader();
                  reader.onloadend = () => setPreviewImage(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} error={blogForm.formState.errors.coverImage?.message} />
            )} />
          </div>
          <FormField control={blogForm.control} name="tags" render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., travel, adventure" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={blogForm.control} name="metaTitle" render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter meta title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={blogForm.control} name="metaDescription" render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Description</FormLabel>
                <FormControl>
                  <Input placeholder="Enter meta description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={blogForm.control} name="isPublished" render={({ field }) => (
            <FormItem className="flex flex-col sm:flex-row items-center justify-between rounded-lg border p-2 mt-2 gap-2">
              <div className="space-y-0.5">
                <FormLabel>Published</FormLabel>
                <div className="text-xs text-muted-foreground">Make this blog visible to the public</div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )} />
          <Button type="submit" className="w-full mt-2">Update Blog</Button>
        </form>
      </Form>
    </div>
  );
} 