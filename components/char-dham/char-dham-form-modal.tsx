"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CharDhamFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData: any
}

export default function CharDhamFormModal({ isOpen, onClose, onSubmit, initialData }: CharDhamFormModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    overview: "",
    difficulty: "Easy",
    duration: "",
    maxAltitude: "",
    bestTime: "",
    cardImage: "",
    gallery: [] as string[],
    trekMap: "",
    pdfFiles: [] as string[],
    trekInfo: {
      title: "",
      description: "",
      data: {
        distance: "",
        elevation: "",
        duration: "",
        difficulty: "",
        bestTime: "",
        groupSize: ""
      }
    },
    inclusions: [] as string[],
    exclusions: [] as string[],
    whatToCarry: [] as string[],
    fitnessRequired: [] as string[],
    additionalServices: [] as string[],
    pricing: {
      offerPrice: 0,
      originalPrice: 0,
      bookingPrice: 0
    },
    itinerary: [] as string[],
    status: "Draft" as "Draft" | "Published" | "Archived"
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      // Reset form when adding new package
      setFormData({
        title: "",
        overview: "",
        difficulty: "Easy",
        duration: "",
        maxAltitude: "",
        bestTime: "",
        cardImage: "",
        gallery: [],
        trekMap: "",
        pdfFiles: [],
        trekInfo: {
          title: "",
          description: "",
          data: {
            distance: "",
            elevation: "",
            duration: "",
            difficulty: "",
            bestTime: "",
            groupSize: ""
          }
        },
        inclusions: [],
        exclusions: [],
        whatToCarry: [],
        fitnessRequired: [],
        additionalServices: [],
        pricing: {
          offerPrice: 0,
          originalPrice: 0,
          bookingPrice: 0
        },
        itinerary: [],
        status: "Draft"
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Package" : "Add New Package"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Challenging">Challenging</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="overview">Overview</Label>
            <Textarea
              id="overview"
              value={formData.overview}
              onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAltitude">Max Altitude</Label>
              <Input
                id="maxAltitude"
                value={formData.maxAltitude}
                onChange={(e) => setFormData({ ...formData, maxAltitude: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bestTime">Best Time</Label>
              <Input
                id="bestTime"
                value={formData.bestTime}
                onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardImage">Card Image URL</Label>
            <Input
              id="cardImage"
              value={formData.cardImage}
              onChange={(e) => setFormData({ ...formData, cardImage: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offerPrice">Offer Price</Label>
              <Input
                id="offerPrice"
                type="number"
                value={formData.pricing.offerPrice}
                onChange={(e) => setFormData({
                  ...formData,
                  pricing: { ...formData.pricing, offerPrice: Number(e.target.value) }
                })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price</Label>
              <Input
                id="originalPrice"
                type="number"
                value={formData.pricing.originalPrice}
                onChange={(e) => setFormData({
                  ...formData,
                  pricing: { ...formData.pricing, originalPrice: Number(e.target.value) }
                })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookingPrice">Booking Price</Label>
              <Input
                id="bookingPrice"
                type="number"
                value={formData.pricing.bookingPrice}
                onChange={(e) => setFormData({
                  ...formData,
                  pricing: { ...formData.pricing, bookingPrice: Number(e.target.value) }
                })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update Package" : "Create Package"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 