import { useCallback, useEffect, useState } from 'react';
import { getAllWarehouseRelations, createWarehouseRelation, deleteWarehouseRelation, WarehouseRelationDTO, WarehouseRelationConnectionDTO } from '@/src/services/warehouseActivityGraph';
import { PlusIcon } from '../icons';
import { PaginationControl } from '../paginationControl';
import { ConfirmationModal } from '../modals/confirmationModal';
import { AddConnectionModal } from '../modals/connectionsModal';
import { ConnectionContainer } from '../containers/connectionsContainer';

export function ConnectionsSection() {
    const [data, setData] = useState<WarehouseRelationConnectionDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    
    const [modal, setModal] = useState<'add' | 'delete' | null>(null);
    const [selectedItem, setSelectedItem] = useState<WarehouseRelationDTO | null>(null);
    
    const itemsPerPage = 8;

    const fetchData = useCallback(async (currentPage: number, currentSearch: string) => {
        setLoading(true);
        try {
            const result = await getAllWarehouseRelations({ 
                page: currentPage, 
                search: currentSearch.length > 2 ? currentSearch : undefined,
                limit: itemsPerPage
            });
            setData(result);
            setError(null);
        } catch (err) {
            setError('Failed to fetch connections. You may need to log in again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(page, searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, page, fetchData]);
    
    const refreshData = () => {
        setPage(1);
        fetchData(1, searchTerm);
    };

    const handleAdd = async (email: string) => {
        await createWarehouseRelation(email);
        setModal(null);
        refreshData();
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        await deleteWarehouseRelation(selectedItem.id);
        setModal(null);
        setSelectedItem(null);
        refreshData();
    };

    return (
        <div>
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <input
                        type="text"
                        placeholder="Search by partner email (min 3 chars)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <button
                        onClick={() => setModal('add')}
                        className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <PlusIcon />
                        Add Connection
                    </button>
                </div>
            </div>

            {loading && <p className="text-center text-gray-500 py-10">Loading...</p>}
            {error && <p className="text-center text-red-500 py-10">{error}</p>}
            
            {!loading && !error && data && (
                data.relations.length > 0 ? (
                    <>
                        <ConnectionContainer 
                            connections={data.relations}
                            onDelete={(item: WarehouseRelationDTO) => { setSelectedItem(item); setModal('delete'); }}
                        />
                        <PaginationControl
                            currentPage={page}
                            totalPages={Math.ceil(data.totalItems / itemsPerPage)}
                            onPageChange={setPage}
                        />
                    </>
                ) : (
                    <p className="text-center text-gray-500 py-10">No warehouse connections found.</p>
                )
            )}

            {modal === 'add' && <AddConnectionModal onClose={() => setModal(null)} onAdd={handleAdd} />}
            {modal === 'delete' && selectedItem && <ConfirmationModal itemName={`connection with ${selectedItem.partnerEmail}`} onClose={() => setModal(null)} onConfirm={handleDelete} />}
        </div>
    );
}