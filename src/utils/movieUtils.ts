/**
 * Utility functions for movie data formatting
 */

/**
 * Formats runtime in minutes to a human-readable string
 * @param minutes - Runtime in minutes
 * @returns Formatted string like "2h 30m" or "45m"
 */
export const formatRuntime = (minutes: number | null): string => {
  if (!minutes || typeof minutes !== "number" || minutes <= 0) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

/**
 * Extracts year from a date string
 * @param dateString - Date string in format "YYYY-MM-DD"
 * @returns Year as string or "N/A"
 */
export const formatDate = (dateString: string | null): string | number => {
  if (!dateString) return "N/A";
  return new Date(dateString).getFullYear();
};

/**
 * Returns appropriate Tailwind color class based on rating
 * @param rating - Movie rating (0-10)
 * @returns Tailwind CSS class string
 */
export const getRatingColor = (rating: number | null): string => {
  if (!rating) return "bg-gray-500";
  if (rating >= 8) return "bg-green-500";
  if (rating >= 7) return "bg-yellow-500";
  if (rating >= 6) return "bg-orange-500";
  return "bg-red-500";
};
