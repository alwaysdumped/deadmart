import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../context/AuthContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

const Wishlist: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, loading, fetchWishlist, removeFromWishlist } = useWishlistStore();
    const { addItem } = useCartStore();

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            navigate('/login');
        }
    }, [user, fetchWishlist, navigate]);

    const handleRemove = async (productId: string) => {
        try {
            await removeFromWishlist(productId);
        } catch (error) {
            alert('Failed to remove item');
        }
    };

    const handleMoveToCart = async (product: any) => {
        addItem(product);
        await removeFromWishlist(product.id);
        alert('Moved to cart!');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                    My Wishlist
                </h1>
                <p className="mt-1 text-sm text-gray-500">{items.length} item(s) saved</p>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-16">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 mb-6">Save items you love to buy them later</p>
                    <button onClick={() => navigate('/dashboard')} className="btn-primary">
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((product) => (
                        <div key={product.id} className="card overflow-hidden group">
                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <button
                                    onClick={() => handleRemove(product.id)}
                                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                            </div>

                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>

                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xl font-bold text-primary-600">₹{product.price}</span>
                                    <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/product/${product.id}`)}
                                        className="flex-1 btn-secondary text-sm py-2"
                                    >
                                        View
                                    </button>
                                    {product.stock > 0 && (
                                        <button
                                            onClick={() => handleMoveToCart(product)}
                                            className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1"
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                            Add to Cart
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
