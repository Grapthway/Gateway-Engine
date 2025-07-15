export function ConfirmationModal({ itemName, onClose, onConfirm }: any) {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-6 border w-full max-w-sm shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-medium text-gray-900">Confirm Action</h3>
                <p className="mt-2 text-sm text-gray-600">
                    Are you sure you want to delete this {itemName}? This action cannot be undone.
                </p>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
