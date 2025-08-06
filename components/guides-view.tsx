"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Filter, MoreHorizontal, Plus, Search } from "lucide-react"
import DashboardLayout from "./dashboard-layout"

const guides = [
  {
    id: "G001",
    name: "Rajesh Joshi",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "RJ",
    specialization: "Trekking, Mountaineering",
    experience: "12 years",
    languages: "Hindi, English, Garhwali",
    status: "Active",
    rating: 4.8,
  },
  {
    id: "G002",
    name: "Priya Nair",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "PN",
    specialization: "Beach Tours, Cultural",
    experience: "8 years",
    languages: "Hindi, English, Malayalam",
    status: "Active",
    rating: 4.7,
  },
  {
    id: "G003",
    name: "Mohan Singh",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "MS",
    specialization: "Trekking, Wildlife",
    experience: "10 years",
    languages: "Hindi, English, Kumaoni",
    status: "Active",
    rating: 4.9,
  },
  {
    id: "G004",
    name: "Anita Sharma",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "AS",
    specialization: "Heritage Tours, Cultural",
    experience: "7 years",
    languages: "Hindi, English, Rajasthani",
    status: "Active",
    rating: 4.6,
  },
  {
    id: "G005",
    name: "Vikram Rawat",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "VR",
    specialization: "Pilgrimage, Trekking",
    experience: "15 years",
    languages: "Hindi, English, Garhwali",
    status: "Active",
    rating: 4.9,
  },
  {
    id: "G006",
    name: "Sunita Gupta",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "SG",
    specialization: "Cultural Tours, Food Tours",
    experience: "6 years",
    languages: "Hindi, English, Bengali",
    status: "Inactive",
    rating: 4.5,
  },
  {
    id: "G007",
    name: "Karan Mehta",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "KM",
    specialization: "Adventure, Water Sports",
    experience: "9 years",
    languages: "Hindi, English, Marathi",
    status: "Active",
    rating: 4.7,
  },
]

export default function GuidesView() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredGuides = guides.filter(
    (guide) =>
      guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.languages.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Tour Guides</h2>
          <Button>
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
                <TableRow key={guide.id}>
                  <TableCell className="font-medium">{guide.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={guide.avatar} alt={guide.name} />
                        <AvatarFallback>{guide.initials}</AvatarFallback>
                      </Avatar>
                      {guide.name}
                    </div>
                  </TableCell>
                  <TableCell>{guide.specialization}</TableCell>
                  <TableCell>{guide.experience}</TableCell>
                  <TableCell>{guide.languages}</TableCell>
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Assign Tour</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}

