import type { PaginationInfo } from "../types/movie";

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  pagination,
  onPageChange,
}: PaginationProps) {
  const { currentPage, totalPages, totalItems } = pagination;

  const getVisiblePages = (isMobile = false) => {
    if (isMobile) {
      // On mobile, show only current page and adjacent pages with dots
      const pages = [];
      if (currentPage > 1) pages.push(currentPage - 1);

      // Don't include current page if it's the last page (to avoid duplicate 386)
      if (currentPage < totalPages) {
        pages.push(currentPage);
      }

      if (currentPage < totalPages - 1) pages.push(currentPage + 1);

      // Add dots after page numbers if not on last pages
      if (currentPage < totalPages - 1) {
        pages.push("...");
      }

      return pages;
    }

    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...");
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-medium">
            {(currentPage - 1) * pagination.itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(currentPage * pagination.itemsPerPage, totalItems)}
          </span>{" "}
          of <span className="font-medium">{totalItems}</span> movies
        </div>

        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {getVisiblePages(false).map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <span className="px-3 py-2 text-sm text-gray-500">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Last Page Number Button */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {totalPages}
          </button>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden items-center justify-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {getVisiblePages(true).map((page, index) => (
            <div key={index}>
              {page === "..." ? (
                <span className="px-2 py-1 text-xs text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    currentPage === page
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Last Page Number Button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {totalPages}
        </button>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
