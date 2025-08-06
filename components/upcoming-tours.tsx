"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, MapPin, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { getPackages, Package } from "@/app/api/package-controller"

const upcomingTours = [
  {
    id: "T-1001",
    name: "Char Dham Yatra",
    startDate: "Mar 20, 2025",
    duration: "12 days",
    location: "Uttarakhand",
    participants: 24,
    guide: "Rajesh Joshi",
    type: "pilgrimage",
  },
  {
    id: "T-1002",
    name: "Valley of Flowers Trek",
    startDate: "Mar 22, 2025",
    duration: "6 days",
    location: "Uttarakhand",
    participants: 12,
    guide: "Mohan Singh",
    type: "trek",
  },
  {
    id: "T-1003",
    name: "Goa Beach Package",
    startDate: "Mar 25, 2025",
    duration: "5 days",
    location: "Goa",
    participants: 18,
    guide: "Priya Nair",
    type: "domestic",
  },
  {
    id: "T-1004",
    name: "Kedarnath Trek",
    startDate: "Mar 28, 2025",
    duration: "7 days",
    location: "Uttarakhand",
    participants: 15,
    guide: "Vikram Rawat",
    type: "trek",
  },
  {
    id: "T-1005",
    name: "Rajasthan Heritage Tour",
    startDate: "Mar 30, 2025",
    duration: "8 days",
    location: "Rajasthan",
    participants: 20,
    guide: "Anita Sharma",
    type: "domestic",
  },
]

export function UpcomingTours() {
  const [tours, setTours] = useState<Package[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPackages()
      .then((res) => {
        if (res.success && res.data) setTours(res.data)
        else setTours(null)
      })
      .catch(() => setTours(null))
      .finally(() => setLoading(false))
  }, [])

  const displayTours = tours && tours.length > 0 ? tours : upcomingTours

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : (
          displayTours.map((tour: any) => (
            <Card key={tour._id || tour.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{tour.name}</h4>
                    <Badge
                      variant="outline"
                      className={
                        tour.type === "trek"
                          ? "bg-blue-500 text-white"
                          : tour.type === "pilgrimage"
                            ? "bg-orange-500 text-white"
                            : "bg-green-500 text-white"
                      }
                    >
                      {tour.type || "tour"}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    {tour.startDate || tour.start_date || "-"} 2 {tour.duration || "-"}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    {tour.location || "-"}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="mr-1 h-4 w-4" />
                      {tour.participants || "-"} participants
                    </div>
                    <div>Guide: {tour.guide || "-"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  )
}

