"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Filter, MoreHorizontal, Mountain, Plus, Search } from "lucide-react"
import DashboardLayout from "./dashboard-layout"

const treks = [
  {
    id: "TRK001",
    name: "Valley of Flowers Trek",
    duration: "6 days",
    difficulty: "Moderate",
    altitude: "3,858 m",
    region: "Uttarakhand",
    price: "₹18,750",
    season: "Jul-Sep",
    status: "Active",
  },
  {
    id: "TRK002",
    name: "Kedarnath Trek",
    duration: "7 days",
    difficulty: "Moderate-Difficult",
    altitude: "3,583 m",
    region: "Uttarakhand",
    price: "₹32,000",
    season: "May-Jun, Sep-Oct",
    status: "Active",
  },
  {
    id: "TRK003",
    name: "Roopkund Trek",
    duration: "8 days",
    difficulty: "Difficult",
    altitude: "4,785 m",
    region: "Uttarakhand",
    price: "₹28,500",
    season: "May-Jun, Sep-Oct",
    status: "Active",
  },
  {
    id: "TRK004",
    name: "Hampta Pass Trek",
    duration: "5 days",
    difficulty: "Moderate",
    altitude: "4,270 m",
    region: "Himachal Pradesh",
    price: "₹19,500",
    season: "Jun-Sep",
    status: "Active",
  },
  {
    id: "TRK005",
    name: "Chadar Trek",
    duration: "9 days",
    difficulty: "Difficult",
    altitude: "3,850 m",
    region: "Ladakh",
    price: "₹45,000",
    season: "Jan-Feb",
    status: "Inactive",
  },
  {
    id: "TRK006",
    name: "Goechala Trek",
    duration: "11 days",
    difficulty: "Difficult",
    altitude: "4,940 m",
    region: "Sikkim",
    price: "₹38,500",
    season: "Apr-May, Sep-Nov",
    status: "Active",
  },
  {
    id: "TRK007",
    name: "Sandakphu Trek",
    duration: "7 days",
    difficulty: "Moderate",
    altitude: "3,636 m",
    region: "West Bengal",
    price: "₹22,000",
    season: "Mar-May, Oct-Dec",
    status: "Active",
  },
]

export default function TreksView() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTreks = treks.filter(
    (trek) =>
      trek.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trek.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trek.difficulty.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Trek Packages</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Trek
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center space-x-2 md:w-2/3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search treks..."
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
                <TableHead>Trek ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Max Altitude</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Season</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTreks.map((trek) => (
                <TableRow key={trek.id}>
                  <TableCell className="font-medium">{trek.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4 text-blue-500" />
                      {trek.name}
                    </div>
                  </TableCell>
                  <TableCell>{trek.duration}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        trek.difficulty === "Easy"
                          ? "bg-green-500 text-white"
                          : trek.difficulty === "Moderate"
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                      }
                    >
                      {trek.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>{trek.altitude}</TableCell>
                  <TableCell>{trek.region}</TableCell>
                  <TableCell>{trek.price}</TableCell>
                  <TableCell>{trek.season}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={trek.status === "Active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
                    >
                      {trek.status}
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Assign Guide</DropdownMenuItem>
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

