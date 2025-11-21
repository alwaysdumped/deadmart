import { Product } from '../types';

export const getRecommendedProducts = (
    currentProduct: Product,
    allProducts: Product[],
    limit: number = 4
): Product[] => {
    if (!currentProduct || !allProducts) return [];

    return allProducts
        .filter(product => {
            // Exclude current product
            if (product.id === currentProduct.id || product._id === currentProduct._id) return false;

            // Must be same category
            if (product.category !== currentProduct.category) return false;

            // Optional: Price range check (within +/- 50%)
            const priceRatio = product.price / currentProduct.price;
            if (priceRatio < 0.5 || priceRatio > 1.5) return false;

            return true;
        })
        .sort(() => Math.random() - 0.5) // Shuffle results
        .slice(0, limit);
};
