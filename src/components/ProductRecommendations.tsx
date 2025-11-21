import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { productsAPI } from '../services/api';

interface ProductRecommendationsProps {
    currentProductId: string;
    category: string;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ currentProductId, category }) => {
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                // Fetch products in the same category
                const response = await productsAPI.getProducts({ category });

                if (response.success) {
                    const allProducts: Product[] = response.products;

                    // Filter and sort recommendations
                    const recommended = allProducts
                        .filter(p =>
                            (p.id !== currentProductId && p._id !== currentProductId) && // Not the current product
                            p.isActive !== false && // Active products only
                            p.stock > 0 // In stock
                        )
                        .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Sort by rating
                        .slice(0, 4); // Top 4 recommendations

                    setRecommendations(recommended);
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        if (category) {
            fetchRecommendations();
        }
    }, [currentProductId, category]);

    if (loading || recommendations.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map((product) => (
                    <ProductCard key={product.id || product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ProductRecommendations;
