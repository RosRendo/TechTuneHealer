// Canonical status badge palette — single source of truth for the admin console
// (dashboard, bookings, financials, inventory must all reference this map)
export const bookingStatusBadge: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  ACCEPTED: "bg-blue-50 text-blue-800 border-blue-200",
  ARRIVED: "bg-sky-50 text-sky-800 border-sky-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-800 border-indigo-200",
  COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
  REJECTED: "bg-slate-100 text-slate-600 border-slate-200",
};

export const bookingStatusBadgeClass = (status: string, fallback = "bg-slate-100 text-slate-700 border-slate-200") =>
  bookingStatusBadge[status] || fallback;

// Single brand blue for accents, buttons and charts
export const BRAND_BLUE = "#2A65F0";
