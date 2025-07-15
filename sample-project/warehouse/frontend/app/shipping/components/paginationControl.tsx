import { ChevronLeftIcon, ChevronRightIcon } from "./icons"; // Assuming icons are in the same folder

export function PaginationControl({ currentPage, totalPages, onPageChange }: any) {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
                <ChevronLeftIcon />
                <span className="ml-2">Previous</span>
            </button>
            <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
                <span className="mr-2">Next</span>
                <ChevronRightIcon />
            </button>
        </div>
    );
}
