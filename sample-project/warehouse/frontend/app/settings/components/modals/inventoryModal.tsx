import { useState } from "react";

export function AddInventoryModal({ categories, onClose, onAdd }: any) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!name || !price || !quantity || !categoryId) return;
        setLoading(true);
        setError('');
        try {
            await onAdd({ name, price: parseFloat(price), quantity: parseInt(quantity), categoryId, description });
        } catch (err: any) {
            setError(err.message || 'Failed to add item.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Inventory Item</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" placeholder="Item Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} required min="0" step="1" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                        <option value="" disabled>Select a category</option>
                        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex items-center justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? 'Adding...' : 'Add Item'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function EditInventoryModal({ item, categories, onClose, onEdit }: any) {
    const [name, setName] = useState(item.name);
    const [price, setPrice] = useState(item.price.toString());
    const [quantity, setQuantity] = useState(item.quantity.toString());
    const [categoryId, setCategoryId] = useState(item.categoryId);
    const [description, setDescription] = useState(item.description || '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!name || !price || !quantity || !categoryId) return;
        setLoading(true);
        setError('');
        try {
            await onEdit({ id: item.id, name, price: parseFloat(price), quantity: parseInt(quantity), categoryId, description });
        } catch (err: any) {
            setError(err.message || 'Failed to update item.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Inventory Item</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" placeholder="Item Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} required min="0" step="1" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                        <option value="" disabled>Select a category</option>
                        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
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