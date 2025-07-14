import { ShippingDTO } from "@/src/services/shippingGraph";
import { PencilIcon, TrashIcon } from "../icons";

export function ShippingListContainer({ shippings, type, onEdit, onDelete }: { shippings: ShippingDTO[], type: 'DELIVERY' | 'ARRIVED', onEdit: (item: ShippingDTO) => void, onDelete: (item: ShippingDTO) => void }) {
    return (
        <div className="bg-white shadow overflow-hidden rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
                {shippings.map((ship) => (
                    <li key={ship.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div className="flex-1 truncate">
                            <p className="font-medium text-gray-900 truncate">ID: {ship.id}</p>
                            <p className="text-sm text-gray-500">To: {ship.recipientName} | Status: {ship.status}</p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
                            {type === 'DELIVERY' && (
                                <>
                                    <button onClick={() => onEdit(ship)} className="text-gray-400 hover:text-blue-500">
                                        <PencilIcon />
                                    </button>
                                    <button onClick={() => onDelete(ship)} className="text-gray-400 hover:text-red-500">
                                        <TrashIcon />
                                    </button>
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}