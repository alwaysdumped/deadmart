import React, { useState, useEffect } from 'react';
import { productsAPI } from '../../services/api';
import { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard';
import SearchFilters, { FilterState } from '../../components/SearchFilters';
import { PRODUCT_CATEGORIES } from '../../constants/categories';
import RecommendedProducts from '../../components/RecommendedProducts';

const CustomerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
    const [filters, setFilters] = useState<FilterState>({
        category: '',
        minPrice: 0,
        maxPrice: 10000,
        minRating: 0,
        sortBy: '',
    });

    useEffect(() => {
        fetchProducts();
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        setRecentlyViewed(viewed);
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getProducts({ role: 'customer' });
            if (response.success) {
                setProducts(response.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products
        .filter((product) => {
            const matchesSearch =
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !filters.category || product.category === filters.category;
            const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice;
            const matchesRating = !filters.minRating || (product.rating || 0) >= filters.minRating;
            return matchesSearch && matchesCategory && matchesPrice && matchesRating;
        })
        .sort((a, b) => {
            switch (filters.sortBy) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'newest':
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                default:
                    return 0;
            }
        });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 mb-8 text-white shadow-lg">
                <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
                <p className="text-primary-100 text-lg">Discover amazing products from local retailers</p>
            </div>

            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && (
                <div className="mb-12">
                    <RecommendedProducts products={recentlyViewed} title="Recently Viewed" />
                </div>
            )}

            {/* Search and Filters */}
            <SearchFilters onSearch={setSearchTerm} onFilter={setFilters} categories={PRODUCT_CATEGORIES} />

            {/* Products Grid */}
            <div className="mt-8">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No products found</p>
                        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-600">
                                Showing {filteredProducts.length} of {products.length} products
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product._id || product.id} product={product} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
