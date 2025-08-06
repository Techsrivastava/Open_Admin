"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import DashboardLayout from "@/components/dashboard-layout"
import { toast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Search, RefreshCw, FileText, Eye, Edit, Trash, Upload } from 'lucide-react'
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import axios from "axios"
import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"
import { ImageUpload } from "@/components/image-upload"

// Interfaces
interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Zod schemas
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

// API service functions
const API_BASE_URL = 'https://openbacken-production.up.railway.app/api/v1';

const getAllBlogs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/blogs/admin/all`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
};

const createBlog = async (blogData: any) => {
  try {
    const formData = new FormData();
    
    // Log the incoming data for debugging
    console.log('Creating blog with data:', blogData);
    
    // Append all text fields
    Object.keys(blogData).forEach(key => {
      if (key === 'coverImage' && blogData[key] instanceof File) {
        formData.append('coverImage', blogData[key]);
      } else if (key === 'tags') {
        // Handle tags whether it's a string or array
        const tagsValue = typeof blogData[key] === 'string' 
          ? blogData[key].split(',').map((tag: string) => tag.trim())
          : blogData[key];
        formData.append('tags', JSON.stringify(tagsValue));
      } else if (key !== 'coverImage') {
        formData.append(key, blogData[key]);
      }
    });

    // Log the FormData contents for debugging
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    const response = await axios.post(`${API_BASE_URL}/blogs`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating blog:", error.response?.data || error.message);
    throw error;
  }
};

const updateBlog = async (id: string, blogData: any) => {
  try {
    const formData = new FormData();
    
    // Append all text fields
    Object.keys(blogData).forEach(key => {
      if (key === 'coverImage' && blogData[key] instanceof File) {
        formData.append('coverImage', blogData[key]);
      } else if (key === 'tags' && Array.isArray(blogData[key])) {
        formData.append('tags', JSON.stringify(blogData[key]));
      } else if (key !== 'coverImage') {
        formData.append(key, blogData[key]);
      }
    });

    const response = await axios.put(`${API_BASE_URL}/blogs/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating blog:", error);
    throw error;
  }
};

const deleteBlog = async (id: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/blogs/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw error;
  }
};

const ReactQuill = dynamic(() => import("react-quill").then(mod => mod.default), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddBlogModalOpen, setIsAddBlogModalOpen] = useState(false);
  const [isEditBlogModalOpen, setIsEditBlogModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const blogsData = await getAllBlogs();
      setBlogs(blogsData);
    } catch (error) {
      console.error("Error loading blogs:", error);
      toast({
        title: "Error",
        description: "Failed to load blogs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlog = async (data: BlogFormValues) => {
    try {
      setLoading(true);
      console.log('Form data before submission:', data);
      
      // Validate required fields
      if (!data.title || !data.content || !data.excerpt || !data.author || !data.tags) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Validate cover image
      if (!data.coverImage) {
        toast({
          title: "Validation Error",
          description: "Please upload a cover image",
          variant: "destructive",
        });
        return;
      }

      // Create FormData
      const formData = new FormData();
      
      // Add all text fields
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('excerpt', data.excerpt);
      formData.append('author', data.author);
      formData.append('metaTitle', data.metaTitle);
      formData.append('metaDescription', data.metaDescription);
      formData.append('isPublished', String(data.isPublished));
      
      // Handle tags
      const tags = typeof data.tags === 'string' 
        ? data.tags.split(',').map(tag => tag.trim())
        : data.tags;
      formData.append('tags', JSON.stringify(tags));
      
      // Handle cover image
      if (data.coverImage instanceof File) {
        formData.append('coverImage', data.coverImage);
      }

      // Log FormData contents
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await axios.post(`${API_BASE_URL}/blogs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      toast({
        title: "Success",
        description: "Blog created successfully",
      });
      blogForm.reset();
      loadBlogs();
    } catch (error: any) {
      console.error("Error creating blog:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create blog",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlog = async (data: BlogFormValues) => {
    if (!selectedBlog) return;
    try {
      const formData = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()),
      };
      await updateBlog(selectedBlog._id, formData);
      toast({
        title: "Success",
        description: "Blog updated successfully",
      });
      setIsEditBlogModalOpen(false);
      blogForm.reset();
      loadBlogs();
    } catch (error) {
      console.error("Error updating blog:", error);
      toast({
        title: "Error",
        description: "Failed to update blog",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await deleteBlog(id);
      toast({
        title: "Success",
        description: "Blog deleted successfully",
      });
      loadBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const file = e.target.files?.[0];
    if (file) {
      field.onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter blogs based on search query
  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderCoverImageField = (field: any) => (
    <FormItem>
      <FormLabel>Cover Image</FormLabel>
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
              onChange={(e) => handleImageChange(e, field)}
            />
          </div>
          {(previewImage || field.value) && (
            <div className="relative w-full max-w-md">
              <img
                src={previewImage || field.value}
                alt="Cover preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Blog Management</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadBlogs}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button onClick={() => window.location.href = "/dashboard/blogs/create"}>
              <Plus className="mr-2 h-4 w-4" /> Add Blog
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredBlogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No blogs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBlogs.map((blog) => (
                  <TableRow key={blog._id}>
                    <TableCell>{blog.title}</TableCell>
                    <TableCell>{blog.author}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={blog.isPublished ? "default" : "secondary"}>
                        {blog.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(blog.createdAt), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => window.open(`/blogs/${blog.slug}`, '_blank')}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.location.href = `/dashboard/blogs/edit/${blog._id}`}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteBlog(blog._id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
} 