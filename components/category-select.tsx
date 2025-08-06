"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { getCategories, type Category } from "@/api/package-controller"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

interface CategorySelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  disabled?: boolean
}

export function CategorySelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label = "Category",
  placeholder = "Select category",
  disabled = false,
}: CategorySelectProps<TFieldValues, TName>) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const result = await getCategories()
        if (result.success && result.data) {
          setCategories(result.data.data || [])
        } else {
          toast({
            title: "Warning",
            description: "Failed to load categories. Using default options.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [toast])

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled || isLoading}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading categories..." : placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                // Fallback options if API fails
                <>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="Beach">Beach</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                  <SelectItem value="Nature">Nature</SelectItem>
                  <SelectItem value="Pilgrimage">Pilgrimage</SelectItem>
                  <SelectItem value="Wildlife">Wildlife</SelectItem>
                  <SelectItem value="Trek">Trek</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

