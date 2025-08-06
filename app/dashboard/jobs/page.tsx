"use client"

import * as React from "react"
import { useState, useEffect } from "react"
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
import { MoreHorizontal, Plus, Search, RefreshCw, Briefcase, FileText, CheckCircle2, XCircle, Clock3, AlertCircle } from 'lucide-react'
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import axios from "axios"

// Interfaces
interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  status: "Active" | "Closed";
  createdAt: string;
  updatedAt: string;
}

interface Application {
  _id: string;
  job: Job;
  name: string;
  email: string;
  phone?: string;
  coverLetter?: string;
  resumeUrl: string;
  status: "Pending" | "Reviewed" | "Accepted" | "Rejected";
  createdAt: string;
  updatedAt: string;
}

// Zod schemas
const jobFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().min(1, "Requirements are required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["Full-time", "Part-time", "Contract", "Internship"]),
  status: z.enum(["Active", "Closed"]),
});

const applicationFormSchema = z.object({
  job: z.string().min(1, "Job is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  coverLetter: z.string().optional(),
  resume: z.any().refine((file) => file instanceof File, "Resume is required"),
});

type JobFormValues = z.infer<typeof jobFormSchema>;
type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

// API service functions
const API_BASE_URL = 'https://openbacken-production.up.railway.app/api/v1';

const getAllJobs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/jobs`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

const createJob = async (jobData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/jobs`, jobData);
    return response.data;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

const updateJob = async (id: string, jobData: any) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/jobs/${id}`, jobData);
    return response.data;
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
};

const deleteJob = async (id: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/jobs/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
};

const getAllApplications = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/applications/admin/all`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw error;
  }
};

const updateApplicationStatus = async (id: string, status: string) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/applications/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusProps = () => {
    switch (status) {
      case "Accepted":
        return { variant: "default" as const, icon: CheckCircle2 };
      case "Rejected":
        return { variant: "destructive" as const, icon: XCircle };
      case "Reviewed":
        return { variant: "secondary" as const, icon: Clock3 };
      case "Pending":
      default:
        return { variant: "outline" as const, icon: AlertCircle };
    }
  };

  const { variant, icon: Icon } = getStatusProps();

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      <span>{status}</span>
    </Badge>
  );
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [isViewApplicationModalOpen, setIsViewApplicationModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const jobForm = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      location: "",
      type: "Full-time",
      status: "Active",
    },
  });

  const applicationForm = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      job: "",
      name: "",
      email: "",
      phone: "",
      coverLetter: "",
      resume: undefined,
    },
  });

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobsData = await getAllJobs();
      setJobs(jobsData);
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const applicationsData = await getAllApplications();
      setApplications(applicationsData);
    } catch (error) {
      console.error("Error loading applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    }
  };

  const handleAddJob = async (data: JobFormValues) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('requirements', data.requirements);
      formData.append('location', data.location);
      formData.append('type', data.type);
      formData.append('status', data.status);
      formData.append('resource_type', 'raw');

      await createJob(formData);
      toast({
        title: "Success",
        description: "Job created successfully",
      });
      setIsAddJobModalOpen(false);
      jobForm.reset();
      loadJobs();
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive",
      });
    }
  };

  const handleEditJob = async (data: JobFormValues) => {
    if (!selectedJob) return;
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('requirements', data.requirements);
      formData.append('location', data.location);
      formData.append('type', data.type);
      formData.append('status', data.status);
      formData.append('resource_type', 'raw');

      await updateJob(selectedJob._id, formData);
      toast({
        title: "Success",
        description: "Job updated successfully",
      });
      setIsEditJobModalOpen(false);
      jobForm.reset();
      loadJobs();
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(id);
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
      loadJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateApplicationStatus(id, status);
      toast({
        title: "Success",
        description: "Application status updated successfully",
      });
      loadApplications();
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const handleViewResume = (resumeUrl: string) => {
    if (!resumeUrl) {
      toast({
        title: "Error",
        description: "Resume URL not found",
        variant: "destructive",
      });
      return;
    }

    try {
      window.open(resumeUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsViewApplicationModalOpen(true);
  };

  // Filter jobs based on search query
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Jobs & Applications</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadJobs}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="jobs">
          <TabsList className="mb-4">
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Dialog open={isAddJobModalOpen} onOpenChange={setIsAddJobModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Job</DialogTitle>
                  </DialogHeader>
                  <Form {...jobForm}>
                    <form onSubmit={jobForm.handleSubmit(handleAddJob)} className="space-y-4">
                      <FormField
                        control={jobForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter job title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={jobForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter job description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={jobForm.control}
                        name="requirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Requirements (one per line)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter job requirements" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={jobForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter job location" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={jobForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Full-time">Full-time</SelectItem>
                                <SelectItem value="Part-time">Part-time</SelectItem>
                                <SelectItem value="Contract">Contract</SelectItem>
                                <SelectItem value="Internship">Internship</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={jobForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={jobForm.control}
                        name="resume"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>Resume</FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    onChange(file);
                                  }
                                }}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        Create Job
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted</TableHead>
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
                  ) : filteredJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No jobs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobs.map((job) => (
                      <TableRow key={job._id}>
                        <TableCell>{job.title}</TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell>{job.type}</TableCell>
                        <TableCell>
                          <Badge variant={job.status === "Active" ? "default" : "secondary"}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(job.createdAt), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedJob(job);
                                  jobForm.reset({
                                    title: job.title,
                                    description: job.description,
                                    requirements: job.requirements.join('\n'),
                                    location: job.location,
                                    type: job.type,
                                    status: job.status,
                                  });
                                  setIsEditJobModalOpen(true);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteJob(job._id)}
                                className="text-red-600"
                              >
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
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((application) => (
                      <TableRow key={application._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{application.name}</div>
                            <div className="text-sm text-muted-foreground">{application.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{application.job.title}</TableCell>
                        <TableCell>{format(new Date(application.createdAt), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <Select
                            value={application.status}
                            onValueChange={(value) => handleStatusChange(application._id, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue>
                                <StatusBadge status={application.status} />
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Reviewed">Reviewed</SelectItem>
                              <SelectItem value="Accepted">Accepted</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(application)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleViewResume(application.resumeUrl)}
                                className="cursor-pointer"
                              >
                                View Resume
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
          </TabsContent>
        </Tabs>

        {/* Edit Job Modal */}
        <Dialog open={isEditJobModalOpen} onOpenChange={setIsEditJobModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
            </DialogHeader>
            <Form {...jobForm}>
              <form onSubmit={jobForm.handleSubmit(handleEditJob)} className="space-y-4">
                <FormField
                  control={jobForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter job title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={jobForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter job description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={jobForm.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements (one per line)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter job requirements" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={jobForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter job location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={jobForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={jobForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={jobForm.control}
                  name="resume"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Resume</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onChange(file);
                            }
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Update Job
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* View Application Modal */}
        <Dialog open={isViewApplicationModalOpen} onOpenChange={setIsViewApplicationModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Applicant Information</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedApplication.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedApplication.email}</p>
                      {selectedApplication.phone && (
                        <p><span className="font-medium">Phone:</span> {selectedApplication.phone}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Job Information</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Position:</span> {selectedApplication.job.title}</p>
                      <p><span className="font-medium">Location:</span> {selectedApplication.job.location}</p>
                      <p><span className="font-medium">Type:</span> {selectedApplication.job.type}</p>
                    </div>
                  </div>
                </div>
                {selectedApplication.coverLetter && (
                  <div>
                    <h3 className="font-medium">Cover Letter</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{selectedApplication.coverLetter}</p>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => handleViewResume(selectedApplication.resumeUrl)}>
                    View Resume
                  </Button>
                  <Button onClick={() => setIsViewApplicationModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 