import { DateRange } from "react-day-picker"
import { addDays, format, isWithinInterval, parse, startOfDay } from "date-fns"

export const formatDate = (date: Date): string => {
  return format(date, "LLL dd, y")
}

export const parseDate = (dateString: string): Date => {
  return parse(dateString, "LLL dd, y", new Date())
}

export const isDateInRange = (date: Date, range: DateRange): boolean => {
  if (!range.from || !range.to) return false
  return isWithinInterval(startOfDay(date), {
    start: startOfDay(range.from),
    end: startOfDay(range.to),
  })
}

export const getPresetDateRanges = () => {
  const today = new Date()
  
  return [
    {
      label: "Today",
      range: {
        from: today,
        to: today,
      },
    },
    {
      label: "Last 7 days",
      range: {
        from: addDays(today, -7),
        to: today,
      },
    },
    {
      label: "Last 30 days",
      range: {
        from: addDays(today, -30),
        to: today,
      },
    },
    {
      label: "Last 90 days",
      range: {
        from: addDays(today, -90),
        to: today,
      },
    },
  ]
}

export const filterByDateRange = <T extends { lastBooking: string }>(
  items: T[],
  dateRange: DateRange | undefined
): T[] => {
  if (!dateRange?.from || !dateRange?.to) return items

  return items.filter((item) => {
    const bookingDate = parseDate(item.lastBooking)
    return isDateInRange(bookingDate, dateRange)
  })
} 