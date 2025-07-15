import { WarehouseRelationDTO } from "@/src/services/warehouseActivityGraph";
import { TrashIcon } from "../icons";

export function ConnectionContainer({ connections, onDelete }: { connections: WarehouseRelationDTO[], onDelete: (item: WarehouseRelationDTO) => void }) {
    return (
        <div className="bg-white shadow overflow-hidden rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
                {connections.map((conn) => (
                    <li key={conn.id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex-1 truncate">
                            <p className="font-medium text-gray-900 truncate">{conn.partnerEmail}</p>
                            <p className="text-sm text-gray-500">Status: <span className="font-semibold text-green-600">{conn.status}</span></p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            <button onClick={() => onDelete(conn)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50">
                                <TrashIcon />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}