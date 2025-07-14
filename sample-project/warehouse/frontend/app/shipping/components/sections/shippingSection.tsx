import { useCallback, useEffect, useState } from 'react';
import { getAllShippings, createShipping, deleteShipping, updateShipping, ShippingDTO, ShippingConnectionDTO, CreateShippingInputDTO, UpdateShippingInputDTO } from '@/src/services/shippingGraph';
import { WarehouseRelationDTO, getAllWarehouseRelations } from '@/src/services/warehouseActivityGraph';
import { getAllInventory, InventoryDTO } from '@/src/services/inventoryGraph';
import { PlusIcon } from '../icons';
import { PaginationControl } from '../paginationControl';
import { ConfirmationModal } from '../modals/confirmationModal';
import { ShippingListContainer } from '../containers/shippingListContainer';
import { AddShippingModal, EditShippingModal } from '../modals/shippingModal';


export function ShippingSection() {
    const [activeTab, setActiveTab] = useState<'DELIVERY' | 'ARRIVED'>('DELIVERY');
    const [data, setData] = useState<ShippingConnectionDTO | null>(null);
    const [connections, setConnections] = useState<WarehouseRelationDTO[]>([]);
    const [inventory, setInventory] = useState<InventoryDTO[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({ startDate: '', endDate: '' });
    const [page, setPage] = useState(1);
    
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [selectedItem, setSelectedItem] = useState<ShippingDTO | null>(null);

    const itemsPerPage = 10;

    const fetchData = useCallback(async (currentPage: number, currentFilters: any, type: 'DELIVERY' | 'ARRIVED') => {
        setLoading(true);
        try {
            const [shippingResult, connectionsResult, inventoryResult] = await Promise.all([
                getAllShippings({ 
                    page: currentPage, 
                    startDate: currentFilters.startDate || undefined,
                    endDate: currentFilters.endDate || undefined,
                    type: type,
                    limit: itemsPerPage
                }),
                getAllWarehouseRelations({ limit: 500 }), // Fetch all connections for dropdown
                getAllInventory({ limit: 500 }) // Fetch all inventory for dropdown
            ]);

            setData(shippingResult);
            setConnections(connectionsResult.relations);
            setInventory(inventoryResult.inventories);
            setError(null);
        } catch (err) {
            setError('Failed to fetch shipping data. You may need to log in again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(page, filters, activeTab);
    }, [page, filters, activeTab, fetchData]);
    
    const refreshData = () => {
        setPage(1);
        fetchData(1, filters, activeTab);
    };

    const handleAdd = async (newItemData: CreateShippingInputDTO) => {
        await createShipping(newItemData);
        setModal(null);
        refreshData();
    };
    
    const handleEdit = async (itemData: UpdateShippingInputDTO) => {
        await updateShipping(itemData);
        setModal(null);
        setSelectedItem(null);
        fetchData(page, filters, activeTab);
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        await deleteShipping(selectedItem.id);
        setModal(null);
        setSelectedItem(null);
        refreshData();
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    };

    return (
        <div>
            {/* Sub-tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('DELIVERY')} className={`${activeTab === 'DELIVERY' ? 'border-blue-500 text-blue-600' : 'border-transparent'} whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm`}>
                        Delivery
                    </button>
                    <button onClick={() => setActiveTab('ARRIVED')} className={`${activeTab === 'ARRIVED' ? 'border-blue-500 text-blue-600' : 'border-transparent'} whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm`}>
                        Arrived
                    </button>
                </nav>
            </div>

            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    <span>to</span>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div className="mt-4 md:mt-0">
                    <button
                        onClick={() => setModal('add')}
                        className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <PlusIcon />
                        Create Delivery
                    </button>
                </div>
            </div>

            {loading && <p className="text-center text-gray-500 py-10">Loading...</p>}
            {error && <p className="text-center text-red-500 py-10">{error}</p>}
            
            {!loading && !error && data && (
                data.shippings.length > 0 ? (
                    <>
                        <ShippingListContainer 
                            shippings={data.shippings}
                            type={activeTab}
                            onEdit={(item: ShippingDTO) => { setSelectedItem(item); setModal('edit'); }}
                            onDelete={(item: ShippingDTO) => { setSelectedItem(item); setModal('delete'); }}
                        />
                        <PaginationControl
                            currentPage={page}
                            totalPages={Math.ceil(data.totalItems / itemsPerPage)}
                            onPageChange={setPage}
                        />
                    </>
                ) : (
                     <p className="text-center text-gray-500 py-10">No {activeTab.toLowerCase()} history found.</p>
                )
            )}
            
            {modal === 'add' && <AddShippingModal connections={connections} inventory={inventory} onClose={() => setModal(null)} onAdd={handleAdd} />}
            {modal === 'edit' && selectedItem && <EditShippingModal shipping={selectedItem} connections={connections} inventory={inventory} onClose={() => setModal(null)} onEdit={handleEdit} />}
            {modal === 'delete' && selectedItem && <ConfirmationModal itemName={`shipping ID ${selectedItem.id}`} onClose={() => setModal(null)} onConfirm={handleDelete} />}
        </div>
    );
}