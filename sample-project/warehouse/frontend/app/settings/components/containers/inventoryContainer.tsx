import { InventoryDTO } from "@/src/services/inventoryGraph";
import { PencilIcon, TrashIcon } from "../icons";

export function InventoryContainer({ items, onEdit, onDelete }: any) {
    return (
        <div className="bg-white shadow overflow-hidden rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
                {items.map((item: InventoryDTO) => (
                    <li key={item.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div className="flex-1 truncate">
                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity} | Price: ${item.price.toFixed(2)}</p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
                            <button onClick={() => onEdit(item)} className="text-gray-400 hover:text-blue-500">
                                <PencilIcon />
                            </button>
                            <button onClick={() => onDelete(item)} className="text-gray-400 hover:text-red-500">
                                <TrashIcon />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}