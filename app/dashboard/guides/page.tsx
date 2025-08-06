"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Filter, MoreHorizontal, Plus, Search } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useGuides } from "@/contexts/guides-context"
import { usePackages } from "@/contexts/packages-context"
import GuideFormModal from "@/components/guides/guide-form-modal"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function GuidesPage() {
  const { guides, loading, error, fetchGuides, createGuide, updateGuide, deleteGuide, assignPackage, removePackage } = useGuides()
  const { packages, fetchPackages } = usePackages()
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedGuide, setSelectedGuide] = useState<any>(null)
  const [selectedPackageId, setSelectedPackageId] = useState<string>("")
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [currentGuideId, setCurrentGuideId] = useState<string>("")

  useEffect(() => {
    fetchGuides()
    fetchPackages()
  }, [fetchGuides, fetchPackages])

  const filteredGuides = guides.filter(
    (guide) =>
      guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.specialization.join(", ").toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.languages.join(", ").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateGuide = async (data: any) => {
    await createGuide(data)
    setIsFormModalOpen(false)
  }

  const handleUpdateGuide = async (data: any) => {
    if (selectedGuide) {
      await updateGuide(selectedGuide.guideId, data)
      setIsFormModalOpen(false)
      setSelectedGuide(null)
    }
  }

  const handleDeleteGuide = async (id: string) => {
    if (confirm("Are you sure you want to delete this guide?")) {
      await deleteGuide(id)
    }
  }

  const handleAssignPackage = async (guideId: string) => {
    setCurrentGuideId(guideId)
    setIsAssignDialogOpen(true)
  }

  const handlePackageSelect = async () => {
    if (selectedPackageId && currentGuideId) {
      await assignPackage(currentGuideId, selectedPackageId)
      setIsAssignDialogOpen(false)
      setSelectedPackageId("")
      setCurrentGuideId("")
    }
  }

  const handleRemovePackage = async (guideId: string) => {
    const packageId = prompt("Enter package ID to remove:")
    if (packageId) {
      await removePackage(guideId, packageId)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Tour Guides</h2>
          <Button onClick={() => setIsFormModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Guide
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center space-x-2 md:w-2/3">
            <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search guides..."
              className="w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
              </div>
            </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-8">{error}</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guide ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Languages</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuides.map((guide) => (
                  <TableRow key={guide.guideId}>
                    <TableCell className="font-medium">{guide.guideId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={guide.avatar} alt={guide.name} />
                          <AvatarFallback>{guide.initials}</AvatarFallback>
                        </Avatar>
                          {guide.name}
                        </div>
                      </TableCell>
                    <TableCell>{guide.specialization.join(", ")}</TableCell>
                      <TableCell>{guide.experience}</TableCell>
                    <TableCell>{guide.languages.join(", ")}</TableCell>
                    <TableCell>{guide.rating}/5.0</TableCell>
                      <TableCell>
                      <Badge
                        variant="outline"
                        className={guide.status === "Active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
                      >
                          {guide.status}
                        </Badge>
                      </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedGuide(guide)
                            setIsFormModalOpen(true)
                            }}>
                              Edit
                            </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignPackage(guide.guideId)}>
                            Assign Package
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemovePackage(guide.guideId)}>
                            Remove Package
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteGuide(guide.guideId)}
                          >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <GuideFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedGuide(null)
        }}
        onSubmit={selectedGuide ? handleUpdateGuide : handleCreateGuide}
        initialData={selectedGuide}
      />

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Package</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a package" />
              </SelectTrigger>
              <SelectContent>
                {packages.map((pkg) => (
                  <SelectItem key={pkg._id} value={pkg._id}>
                    {pkg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePackageSelect} disabled={!selectedPackageId}>
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

