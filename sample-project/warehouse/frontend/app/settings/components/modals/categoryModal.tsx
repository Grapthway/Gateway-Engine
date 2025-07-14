import { useState } from 'react';

export function AddCategoryModal({ onClose, onAdd }: any) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!name) return;
        setLoading(true);
        setError('');
        try {
            await onAdd(name, description);
        } catch (err: any) {
            setError(err.message || 'Failed to add category.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Category</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" placeholder="Category Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex items-center justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? 'Adding...' : 'Add'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function EditCategoryModal({ category, onClose, onEdit }: any) {
    const [name, setName] = useState(category.name);
    const [description, setDescription] = useState(category.description || '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!name) return;
        setLoading(true);
        setError('');
        try {
            await onEdit({ id: category.id, name, description });
        } catch (err: any) {
            setError(err.message || 'Failed to update category.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Category</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" placeholder="Category Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex items-center justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}