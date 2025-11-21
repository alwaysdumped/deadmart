import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { Star } from 'lucide-react';

interface RecommendedProductsProps {
    products: Product[];
    title?: string;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
    products,
    title = "You Might Also Like"
}) => {
    const navigate = useNavigate();

    if (products.length === 0) return null;

    return (
        <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div
                        key={product.id || product._id}
                        className="card group cursor-pointer hover:shadow-lg transition-all duration-300"
                        onClick={() => navigate(`/product/${product.id || product._id}`)}
                    >
                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-xl bg-gray-200 relative">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-48 w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                            />
                            {product.stock <= 5 && product.stock > 0 && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    Low Stock
                                </span>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                                </div>
                                <p className="text-lg font-bold text-primary-600">
                                    ₹{product.price.toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="ml-1 text-sm text-gray-600">
                                    {product.rating} ({product.reviewCount || 0} reviews)
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendedProducts;
