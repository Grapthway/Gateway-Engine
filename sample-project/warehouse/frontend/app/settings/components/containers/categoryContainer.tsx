import { CategoryDTO } from "@/src/services/categoryGraph";
import { PencilIcon, TrashIcon } from "../icons";

export function CategoryContainer({ categories, onEdit, onDelete }: any) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category: CategoryDTO) => (
                <div key={category.id} className="bg-white p-4 rounded-lg shadow flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-800 truncate">{category.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 truncate">{category.description || 'No description'}</p>
                    </div>
                    <div className="mt-4 flex justify-end items-center space-x-3">
                        <button onClick={() => onEdit(category)} className="text-gray-400 hover:text-blue-500">
                            <PencilIcon />
                        </button>
                        <button onClick={() => onDelete(category)} className="text-gray-400 hover:text-red-500">
                            <TrashIcon />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}