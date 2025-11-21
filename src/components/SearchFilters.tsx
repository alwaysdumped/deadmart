import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface SearchFiltersProps {
    onSearch: (query: string) => void;
    onFilter: (filters: FilterState) => void;
    categories: string[];
}

export interface FilterState {
    category: string;
    minPrice: number;
    maxPrice: number;
    minRating: number;
    sortBy: 'price-asc' | 'price-desc' | 'rating' | 'newest' | '';
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, onFilter, categories }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        category: '',
        minPrice: 0,
        maxPrice: 10000,
        minRating: 0,
        sortBy: '',
    });

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        onSearch(value);
    };

    const handleFilterChange = (key: keyof FilterState, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilter(newFilters);
    };

    const clearFilters = () => {
        const defaultFilters: FilterState = {
            category: '',
            minPrice: 0,
            maxPrice: 10000,
            minRating: 0,
            sortBy: '',
        };
        setFilters(defaultFilters);
        onFilter(defaultFilters);
    };

    const hasActiveFilters = filters.category || filters.minPrice > 0 || filters.maxPrice < 10000 || filters.minRating > 0 || filters.sortBy;

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-3 rounded-lg border transition-colors flex items-center gap-2 ${showFilters || hasActiveFilters
                            ? 'bg-primary-50 border-primary-600 text-primary-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <SlidersHorizontal className="h-5 w-5" />
                    <span className="hidden sm:inline">Filters</span>
                    {hasActiveFilters && <span className="bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">!</span>}
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="card p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                <X className="h-4 w-4" />
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="input-field"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price Range: ₹{filters.minPrice} - ₹{filters.maxPrice}
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="10000"
                                    step="100"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Rating Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                            <select
                                value={filters.minRating}
                                onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                                className="input-field"
                            >
                                <option value="0">All Ratings</option>
                                <option value="4">4★ & above</option>
                                <option value="3">3★ & above</option>
                                <option value="2">2★ & above</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                className="input-field"
                            >
                                <option value="">Default</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                                <option value="newest">Newest First</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchFilters;
