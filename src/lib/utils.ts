import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const maxFileSize = 5 * 1024 * 1024 // 5 mb
export const allowedFileTypes: string[] = ["image/jpeg", "image/png", "image/webp"];

export const validEngines = ["petrol", "diesel", "electric", "hybrid"] as const;
export const validSegments = ["sedan", "suv"] as const;

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);

  const day = date.getDate(); // day
  const month = date.toLocaleString('default', { month: 'short' }); // short month name
  const year = date.getFullYear(); // year

  return `${day} ${month}, ${year}`;
}
