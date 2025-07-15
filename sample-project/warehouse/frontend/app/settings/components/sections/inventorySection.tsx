import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllInventory, createInventory, deleteInventory, updateInventory, InventoryDTO, InventoryConnectionDTO, CreateInventoryDTO, UpdateInventoryDTO } from '@/src/services/inventoryGraph';
import { CategoryDTO, getAllCategories } from '@/src/services/categoryGraph';
import { PlusIcon } from '../icons';
import { InventoryContainer } from '../containers/inventoryContainer';
import { PaginationControl } from '../paginationControl';
import { AddInventoryModal, EditInventoryModal } from '../modals/inventoryModal';
import { ConfirmationModal } from '../modals/confirmationModal';




export function InventorySection() {
    const [invData, setInvData] = useState<InventoryConnectionDTO | null>(null);
    const [catData, setCatData] = useState<CategoryDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        searchTerm: '',
        categoryId: '',
        sortBy: 'NAME' as 'NAME' | 'QUANTITY',
        sortOrder: 'ASC' as 'ASC' | 'DESC',
    });
    const [page, setPage] = useState(1);
    
    // Modal states
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventoryDTO | null>(null);

    const itemsPerPage = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 8, []);

    const fetchData = useCallback(async (currentPage: number, currentFilters: any) => {
        setLoading(true);
        try {
            const [invResult, catResult] = await Promise.all([
                getAllInventory({ 
                    page: currentPage,
                    search: currentFilters.searchTerm.length > 2 ? currentFilters.searchTerm : undefined,
                    categoryId: currentFilters.categoryId || undefined,
                    sortBy: currentFilters.sortBy,
                    sortOrder: currentFilters.sortOrder,
                    limit: itemsPerPage
                }),
                getAllCategories({ limit: 100 })
            ]);
            setInvData(invResult);
            setCatData(catResult.categories);
            setError(null);
        } catch (err) {
            setError('Failed to fetch inventory data. You may need to log in again.');
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(page, filters);
        }, 500);
        return () => clearTimeout(handler);
    }, [page, filters, fetchData]);
    
    const refreshData = () => {
        setPage(1);
        fetchData(1, filters);
    };

    const handleAdd = async (newItemData: CreateInventoryDTO) => {
        await createInventory(newItemData);
        setModal(null);
        refreshData();
    };
    
    const handleEdit = async (itemData: UpdateInventoryDTO) => {
        await updateInventory(itemData);
        setModal(null);
        setSelectedItem(null);
        fetchData(page, filters);
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        await deleteInventory(selectedItem.id);
        setModal(null);
        setSelectedItem(null);
        refreshData();
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    }

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [by, order] = e.target.value.split('-');
        setFilters(prev => ({...prev, sortBy: by as any, sortOrder: order as any}));
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <input
                    type="text"
                    name="searchTerm"
                    placeholder="Search inventory (min 3 chars)..."
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                    className="md:col-span-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
                    <option value="">All Categories</option>
                    {catData.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                 <select value={`${filters.sortBy}-${filters.sortOrder}`} onChange={handleSortChange} className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
                    <option value="NAME-ASC">Name (A-Z)</option>
                    <option value="NAME-DESC">Name (Z-A)</option>
                    <option value="QUANTITY-ASC">Quantity (Low to High)</option>
                    <option value="QUANTITY-DESC">Quantity (High to Low)</option>
                </select>
            </div>
             <div className="flex justify-end mb-6">
                 <button
                    onClick={() => setModal('add')}
                    className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusIcon />
                    Add Inventory
                </button>
            </div>

            {loading && <p className="text-center text-gray-500 py-10">Loading...</p>}
            {error && <p className="text-center text-red-500 py-10">{error}</p>}
            
            {!loading && !error && invData && (
                invData.inventories.length > 0 ? (
                    <>
                        <InventoryContainer 
                            items={invData.inventories}
                            onEdit={(item: InventoryDTO) => { setSelectedItem(item); setModal('edit'); }}
                            onDelete={(item: InventoryDTO) => { setSelectedItem(item); setModal('delete'); }}
                        />
                        <PaginationControl
                            currentPage={invData.currentPage}
                            totalPages={invData.totalPages}
                            onPageChange={setPage}
                        />
                    </>
                ) : (
                     <p className="text-center text-gray-500 py-10">No inventory found.</p>
                )
            )}
            
            {modal === 'add' && <AddInventoryModal categories={catData} onClose={() => setModal(null)} onAdd={handleAdd} />}
            {modal === 'edit' && selectedItem && <EditInventoryModal item={selectedItem} categories={catData} onClose={() => setModal(null)} onEdit={handleEdit} />}
            {modal === 'delete' && selectedItem && <ConfirmationModal itemName={selectedItem.name} onClose={() => setModal(null)} onConfirm={handleDelete} />}
        </div>
    );
}