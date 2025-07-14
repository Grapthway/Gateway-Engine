import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllCategories, createCategory, deleteCategory, updateCategory, CategoryDTO, CategoryConnectionDTO } from '@/src/services/categoryGraph';

import { PlusIcon } from '../icons';
import { CategoryContainer } from '../containers/categoryContainer';
import { PaginationControl } from '../paginationControl';
import { AddCategoryModal, EditCategoryModal } from '../modals/categoryModal';
import { ConfirmationModal } from '../modals/confirmationModal';

export function CategorySection() {
    const [data, setData] = useState<CategoryConnectionDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    
    // Modal states
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [selectedItem, setSelectedItem] = useState<CategoryDTO | null>(null);
    
    const itemsPerPage = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 8, []);

    const fetchData = useCallback(async (currentPage: number, currentSearch: string) => {
        setLoading(true);
        try {
            const result = await getAllCategories({ 
                page: currentPage, 
                search: currentSearch.length > 2 ? currentSearch : undefined,
                limit: itemsPerPage
            });
            setData(result);
            setError(null);
        } catch (err) {
            setError('Failed to fetch categories. You may need to log in again.');
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage]);

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

    const handleAdd = async (name: string, description?: string) => {
        await createCategory({ name, description });
        setModal(null);
        refreshData();
    };
    
    const handleEdit = async (categoryData: {id: string, name: string, description?: string}) => {
        await updateCategory(categoryData);
        setModal(null);
        setSelectedItem(null);
        fetchData(page, searchTerm); // Refetch current page
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        await deleteCategory(selectedItem.id);
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
                        placeholder="Search categories (min 3 chars)..."
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
                        Add Category
                    </button>
                </div>
            </div>

            {loading && <p className="text-center text-gray-500 py-10">Loading...</p>}
            {error && <p className="text-center text-red-500 py-10">{error}</p>}
            
            {!loading && !error && data && (
                data.categories.length > 0 ? (
                    <>
                        <CategoryContainer 
                            categories={data.categories}
                            onEdit={(item: CategoryDTO) => { setSelectedItem(item); setModal('edit'); }}
                            onDelete={(item: CategoryDTO) => { setSelectedItem(item); setModal('delete'); }}
                        />
                        <PaginationControl
                            currentPage={data.currentPage}
                            totalPages={data.totalPages}
                            onPageChange={setPage}
                        />
                    </>
                ) : (
                    <p className="text-center text-gray-500 py-10">No categories found.</p>
                )
            )}

            {modal === 'add' && <AddCategoryModal onClose={() => setModal(null)} onAdd={handleAdd} />}
            {modal === 'edit' && selectedItem && <EditCategoryModal category={selectedItem} onClose={() => setModal(null)} onEdit={handleEdit} />}
            {modal === 'delete' && selectedItem && <ConfirmationModal itemName={selectedItem.name} onClose={() => setModal(null)} onConfirm={handleDelete} />}
        </div>
    );
}