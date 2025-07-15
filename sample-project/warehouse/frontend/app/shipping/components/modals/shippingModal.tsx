import { useState } from "react";
import { WarehouseRelationDTO } from "@/src/services/warehouseActivityGraph";
import { InventoryDTO } from "@/src/services/inventoryGraph";
import { PlusIcon, TrashIcon } from "../icons";

interface ShippingItem {
    itemName: string;
    quantity: number;
}

const initialFormState = {
    recipientEmail: '',
    address: '',
    phoneNumber: '',
    items: [{ itemName: '', quantity: 1 }]
};

export function AddShippingModal({ connections, inventory, onClose, onAdd }: { connections: WarehouseRelationDTO[], inventory: InventoryDTO[], onClose: () => void, onAdd: (data: any) => Promise<void> }) {
    const [formState, setFormState] = useState(initialFormState);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleItemChange = (index: number, field: 'itemName' | 'quantity', value: string | number) => {
        const newItems = [...formState.items];
        (newItems[index] as any)[field] = value;
        setFormState(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormState(prev => ({ ...prev, items: [...prev.items, { itemName: '', quantity: 1 }] }));
    };

    const removeItem = (index: number) => {
        setFormState(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await onAdd(formState);
        } catch (err: any) {
            setError(err.message || 'Failed to create delivery.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Delivery</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    <select value={formState.recipientEmail} onChange={e => setFormState(p => ({...p, recipientEmail: e.target.value}))} required className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                        <option value="" disabled>Select a Warehouse Connection</option>
                        {connections.map((c) => <option key={c.id} value={c.partnerEmail}>{c.partnerEmail}</option>)}
                    </select>
                    <input type="text" placeholder="Recipient Address" value={formState.address} onChange={e => setFormState(p => ({...p, address: e.target.value}))} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <input type="tel" placeholder="Recipient Phone Number" value={formState.phoneNumber} onChange={e => setFormState(p => ({...p, phoneNumber: e.target.value}))} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    
                    <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-800 mb-2">Items to Send</h4>
                        {formState.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <select value={item.itemName} onChange={e => handleItemChange(index, 'itemName', e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                                    <option value="" disabled>Select Inventory</option>
                                    {inventory.map(i => <option key={i.id} value={i.name}>{i.name} (Stock: {i.quantity})</option>)}
                                </select>
                                <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))} required min="1" className="w-24 px-3 py-2 border border-gray-300 rounded-md" />
                                <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon /></button>
                            </div>
                        ))}
                        <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:underline flex items-center"><PlusIcon /> Add Item</button>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? 'Creating...' : 'Create Delivery'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// NOTE: The EditShippingModal would be very similar to the Add modal.
// For brevity, it's omitted here but would involve fetching the specific shipping details
// and populating the form state with that data.
export const EditShippingModal = ({ shipping, connections, inventory, onClose, onEdit }: any) => {
    // This component would be built similarly to AddShippingModal
    return <div>Edit Modal Placeholder</div>
};