"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Calendar, Filter, MoreHorizontal, Plus, Search, TrendingUp, Users, Phone, Mail, Clock, Target, Eye, Pencil, Trash2, UserPlus, Download, Upload, RefreshCcw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import DashboardLayout from "@/components/dashboard-layout"
import { notificationService } from "@/lib/services/notification"
// @ts-ignore
import { io, Socket } from "socket.io-client"

interface Lead {
  _id: string
  firstName: string
  lastName?: string
  email: string
  phone: string
  countryCode?: string
  packageType?: string
  travelers?: number
  tripType: string[]
  message?: string
  createdAt: string
  updatedAt: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [packageFilter, setPackageFilter] = useState("all")
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  const leadsPerPage = 10
  
  // Stats calculated from leads data
  const stats = [
    {
      title: "Total Leads",
      value: leads.length.toString(),
      icon: Users,
    },
    {
      title: "4 Dham Packages",
      value: leads.filter(lead => lead.packageType === "4dham").length.toString(),
      icon: Target,
    },
    {
      title: "1 Dham Packages",
      value: leads.filter(lead => lead.packageType === "1dham").length.toString(),
      icon: Target,
    },
    {
      title: "Avg. Group Size",
      value: calculateAvgGroupSize(),
      icon: TrendingUp,
    },
  ]
  
  function calculateAvgGroupSize() {
    const leadsWithTravelers = leads.filter(lead => lead.travelers && lead.travelers > 0)
    if (leadsWithTravelers.length === 0) return "0"
    
    const sum = leadsWithTravelers.reduce((acc, lead) => acc + (lead.travelers || 0), 0)
    return (sum / leadsWithTravelers.length).toFixed(1)
  }

  // Function to fetch leads
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://openbacken-production.up.railway.app/api/leads');
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      const data = await response.json();
      setLeads(data);
      setFilteredLeads(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to fetch leads. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to update leads state
  const updateLeads = (newLead: Lead) => {
    setLeads(prevLeads => {
      // Check if lead already exists
      const leadExists = prevLeads.some(lead => lead._id === newLead._id);
      if (leadExists) {
        console.log('Lead already exists, skipping update');
        return prevLeads;
      }

      console.log('Adding new lead to state');
      const updatedLeads = [newLead, ...prevLeads];
      
      // Update filtered leads
      let filtered = [...updatedLeads];
      
      // Apply current filters
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(lead => 
          (lead.firstName?.toLowerCase().includes(term)) || 
          (lead.lastName?.toLowerCase().includes(term)) || 
          (lead.email?.toLowerCase().includes(term)) || 
          (lead.phone?.includes(term))
        );
      }
      
      if (packageFilter !== "all") {
        filtered = filtered.filter(lead => lead.packageType === packageFilter);
      }
      
      setFilteredLeads(filtered);
      return updatedLeads;
    });
  };

  // Function to delete a lead
  const deleteLead = async (leadId: string) => {
    try {
      setIsDeleting(leadId);
      const response = await fetch(`https://openbacken-production.up.railway.app/api/leads/${leadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }

      // Update leads state
      setLeads(prevLeads => {
        const updatedLeads = prevLeads.filter(lead => lead._id !== leadId);
        // Update filtered leads
        let filtered = [...updatedLeads];
        
        // Apply current filters
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(lead => 
            (lead.firstName?.toLowerCase().includes(term)) || 
            (lead.lastName?.toLowerCase().includes(term)) || 
            (lead.email?.toLowerCase().includes(term)) || 
            (lead.phone?.includes(term))
          );
        }
        
        if (packageFilter !== "all") {
          filtered = filtered.filter(lead => lead.packageType === packageFilter);
        }
        
        setFilteredLeads(filtered);
        return updatedLeads;
      });

      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io('https://openbacken-production.up.railway.app/', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      setError(null);
    });

    newSocket.on('connect_error', (error: Error) => {
      console.error('❌ WebSocket connection error:', error);
      setError('Connection error. Please refresh the page.');
      setTimeout(() => {
        if (!newSocket.connected) {
          newSocket.connect();
        }
      }, 5000);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from WebSocket server:', reason);
      if (reason === 'io server disconnect') {
        newSocket.connect();
      }
    });

    // Listen for all events
    newSocket.onAny((eventName, ...args) => {
      console.log('📡 Received event:', eventName, args);
    });

    // Handle new lead event
    newSocket.on('newLead', async (newLead: Lead) => {
      console.log('📩 New lead received:', newLead);
      
      try {
        // Update leads state
        updateLeads(newLead);
        
        // Show notifications
        console.log('🔄 Attempting to show notifications...');
        
        // Show toast notification
        console.log('📢 Showing toast notification...');
        toast({
          title: "New Lead Alert! 🎯",
          description: `${newLead.firstName} ${newLead.lastName || ''} is interested in ${newLead.packageType || 'your packages'}`,
          duration: 5000,
        });
        console.log('✅ Toast notification shown');

        // Show system notification
        console.log('🔔 Attempting to show system notification...');
        await notificationService.notifyNewLead({
          firstName: newLead.firstName,
          lastName: newLead.lastName,
          packageType: newLead.packageType,
          email: newLead.email,
          phone: newLead.phone
        });
        console.log('✅ System notification shown');
      } catch (err) {
        console.error('❌ Failed to process new lead:', err);
        if (err instanceof Error) {
          console.error('Error details:', {
            message: err.message,
            stack: err.stack,
            name: err.name
          });
        }
      }
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.removeAllListeners();
        if (newSocket.connected) {
          newSocket.disconnect();
        }
        setSocket(null);
      }
    };
  }, []);

  // Add effect to log state changes
  useEffect(() => {
    console.log('📊 Leads state updated:', {
      totalLeads: leads.length,
      filteredLeads: filteredLeads.length,
      currentPage,
      searchTerm,
      packageFilter
    });
  }, [leads, filteredLeads, currentPage, searchTerm, packageFilter]);

  // Fetch initial leads on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  // Apply filters when search term or package filter changes
  useEffect(() => {
    let filtered = [...leads];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead => 
        (lead.firstName?.toLowerCase().includes(term)) || 
        (lead.lastName?.toLowerCase().includes(term)) || 
        (lead.email?.toLowerCase().includes(term)) || 
        (lead.phone?.includes(term))
      );
    }
    
    if (packageFilter !== "all") {
      filtered = filtered.filter(lead => lead.packageType === packageFilter);
    }
    
    setFilteredLeads(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [leads, searchTerm, packageFilter]);
  
  const resetFilters = () => {
    setSearchTerm("");
    setPackageFilter("all");
  };

  // Get current leads for pagination
  const indexOfLastLead = currentPage * leadsPerPage
  const indexOfFirstLead = indexOfLastLead - leadsPerPage
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead)
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage)
  
  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead)
    setShowViewModal(true)
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "MMM dd, yyyy")
  }
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "hh:mm a")
  }
  
  const getPackageColor = (packageType?: string) => {
    switch (packageType) {
      case "4dham":
        return "bg-blue-500 text-white"
      case "1dham":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }
  
  const renderPagination = () => {
    if (totalPages <= 1) return null
    
    const pageNumbers = []
    const maxPagesToShow = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}
          
          {pageNumbers.map(number => (
            <PaginationItem key={number}>
              <PaginationLink 
                onClick={() => setCurrentPage(number)}
                isActive={currentPage === number}
              >
                {number}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  return (
     <DashboardLayout>
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Lead Management</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchLeads}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-auto flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={packageFilter}
          onValueChange={setPackageFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Package Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Packages</SelectItem>
            <SelectItem value="4dham">4 Dham</SelectItem>
            <SelectItem value="1dham">1 Dham</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Travelers</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : currentLeads.length > 0 ? (
              currentLeads.map((lead) => (
                <TableRow key={lead._id}>
                  <TableCell className="font-medium">
                    {lead.firstName} {lead.lastName || ''}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center text-xs">
                        <Mail className="mr-1 h-3 w-3" />
                        {lead.email}
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        <Phone className="mr-1 h-3 w-3" />
                        {lead.countryCode && `+${lead.countryCode} `}{lead.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.packageType ? (
                      <Badge variant="outline" className={getPackageColor(lead.packageType)}>
                        {lead.packageType === "4dham" ? "4 Dham" : "1 Dham"}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not specified</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.travelers || <span className="text-muted-foreground text-sm">N/A</span>}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(lead.createdAt)}</div>
                    <div className="text-xs text-muted-foreground">{formatTime(lead.createdAt)}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewLead(lead)}
                        disabled={isDeleting === lead._id}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteLead(lead._id)}
                        disabled={isDeleting === lead._id}
                      >
                        {isDeleting === lead._id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                        <span className="sr-only">Delete lead</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {renderPagination()}

      {/* View Lead Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <div className="text-sm">{selectedLead.firstName}</div>
                </div>
                <div>
                  <Label>Last Name</Label>
                  <div className="text-sm">{selectedLead.lastName || 'N/A'}</div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="text-sm">{selectedLead.email}</div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <div className="text-sm">
                    {selectedLead.countryCode && `+${selectedLead.countryCode} `}{selectedLead.phone}
                  </div>
                </div>
                <div>
                  <Label>Package Type</Label>
                  <div className="text-sm">
                    {selectedLead.packageType ? (
                      <Badge variant="outline" className={getPackageColor(selectedLead.packageType)}>
                        {selectedLead.packageType === "4dham" ? "4 Dham" : "1 Dham"}
                      </Badge>
                    ) : (
                      'Not specified'
                    )}
                  </div>
                </div>
                <div>
                  <Label>Travelers</Label>
                  <div className="text-sm">{selectedLead.travelers || 'N/A'}</div>
                </div>
                <div>
                  <Label>Trip Types</Label>
                  <div className="text-sm">
                    {selectedLead.tripType && selectedLead.tripType.length > 0 
                      ? selectedLead.tripType.join(', ') 
                      : 'None specified'}
                  </div>
                </div>
                <div>
                  <Label>Created At</Label>
                  <div className="text-sm">
                    {formatDate(selectedLead.createdAt)} at {formatTime(selectedLead.createdAt)}
                  </div>
                </div>
              </div>

              {selectedLead.message && (
                <div>
                  <Label>Message</Label>
                  <div className="text-sm mt-1 p-3 bg-muted rounded-md">
                    {selectedLead.message}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  )
}
