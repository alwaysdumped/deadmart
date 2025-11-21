import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI } from '../services/api';
import { PRODUCT_CATEGORIES } from '../constants/categories';
import ImageUpload from '../components/ImageUpload';
import { ArrowLeft, Save, Loader, AlertCircle } from 'lucide-react';

const AddProduct: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: PRODUCT_CATEGORIES[0],
        stock: '',
        unit: 'piece',
        image: '',
        tags: [] as string[],
        // Dynamic fields
        size: '',
        color: '',
        brand: '',
        material: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUploaded = (url: string) => {
        setFormData(prev => ({ ...prev, image: url }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image) {
            setError('Please upload a product image');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Construct tags from dynamic fields
            const tags = [...formData.tags];
            if (formData.size) tags.push(`Size: ${formData.size}`);
            if (formData.color) tags.push(`Color: ${formData.color}`);
            if (formData.brand) tags.push(`Brand: ${formData.brand}`);
            if (formData.material) tags.push(`Material: ${formData.material}`);

            const productData = {
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                category: formData.category,
                stock: Number(formData.stock),
                unit: formData.unit,
                image: formData.image,
                sellerId: user?.id,
                tags: tags
            };

            await productsAPI.createProduct(productData);
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Failed to create product:', err);
            setError(err.response?.data?.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    // Dynamic fields based on category
    const renderCategoryFields = () => {
        switch (formData.category) {
            case 'Clothing':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
                        <div className="md:col-span-2">
                            <h4 className="text-sm font-bold text-gray-700 mb-2">Clothing Details</h4>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                            <input
                                type="text"
                                name="size"
                                value={formData.size}
                                onChange={handleChange}
                                placeholder="e.g., S, M, L, XL"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input
                                type="text"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                placeholder="e.g., Red, Blue"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                            <input
                                type="text"
                                name="material"
                                value={formData.material}
                                onChange={handleChange}
                                placeholder="e.g., Cotton, Polyester"
                                className="input-field"
                            />
                        </div>
                    </div>
                );
            case 'Electronics':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
                        <div className="md:col-span-2">
                            <h4 className="text-sm font-bold text-gray-700 mb-2">Technical Specs</h4>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="e.g., Sony, Apple"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input
                                type="text"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                placeholder="e.g., Black, Silver"
                                className="input-field"
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6 text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column: Image Upload */}
                            <div>
                                <ImageUpload
                                    onImageUploaded={handleImageUploaded}
                                    currentImage={formData.image}
                                />
                            </div>

                            {/* Right Column: Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="input-field"
                                        required
                                    >
                                        {PRODUCT_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="input-field"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            className="input-field"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        className="input-field"
                                    >
                                        <option value="piece">Piece</option>
                                        <option value="kg">Kg</option>
                                        <option value="liter">Liter</option>
                                        <option value="pack">Pack</option>
                                        <option value="dozen">Dozen</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="input-field"
                                required
                            />
                        </div>

                        {/* Dynamic Fields */}
                        {renderCategoryFields()}

                        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="animate-spin h-4 w-4" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save Product
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
