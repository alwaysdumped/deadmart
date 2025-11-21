import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, MapPin, Package, Star, Heart } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    showAddToCart?: boolean;
    showStock?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showAddToCart = true, showStock = true }) => {
    const { addItem } = useCartStore();
    const { user } = useAuth();
    const { isInWishlist, addToWishlist, removeFromWishlist, fetchWishlist } = useWishlistStore();
    const navigate = useNavigate();

    // Handle both id formats
    const productId = product._id || product.id;

    useEffect(() => {
        if (user) {
            fetchWishlist();
        }
    }, [user, fetchWishlist]);

    const handleCardClick = () => {
        navigate(`/product/${productId}`);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
    };

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert('Please login to add items to wishlist');
            return;
        }

        try {
            if (isInWishlist(productId)) {
                await removeFromWishlist(productId);
            } else {
                await addToWishlist(product);
            }
        } catch (error) {
            console.error('Wishlist error:', error);
        }
    };

    const inWishlist = user && isInWishlist(productId);

    return (
        <div
            onClick={handleCardClick}
            className="group bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
        >
            <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm border border-gray-100">
                        {product.category}
                    </span>
                </div>
                {user && (
                    <button
                        onClick={handleWishlistToggle}
                        className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-10"
                    >
                        <Heart
                            className={`h-5 w-5 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                }`}
                        />
                    </button>
                )}
                {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg transform -rotate-6">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {product.name}
                    </h3>
                    <span className="text-lg font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg">
                        ₹{product.price}
                    </span>
                </div>

                {(product.rating || 0) > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">{product.rating?.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                    </div>
                )}

                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {product.description}
                </p>

                <div className="space-y-3 mt-auto">
                    <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                        <div className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                            <span className="truncate max-w-[100px]">
                                Seller: {product.sellerId ? (typeof product.sellerId === 'string' ? product.sellerId.slice(0, 8) : product.sellerId.name) : 'Unknown'}
                            </span>
                        </div>
                        {showStock && (
                            <div className="flex items-center">
                                <Package className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {product.stock} {product.unit} left
                                </span>
                            </div>
                        )}
                    </div>

                    {showAddToCart && product.stock > 0 && (
                        <button
                            onClick={handleAddToCart}
                            className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm hover:shadow-md z-10 relative"
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
