import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCartStore } from '../store/cartStore';
import { Product, Review, CartItem } from '../types';
import { Star, ShoppingCart, ArrowLeft, ThumbsUp, Clock } from 'lucide-react';
import RecommendedProducts from '../components/RecommendedProducts';
import { getRecommendedProducts } from '../utils/RecommendationEngine';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addItem } = useCartStore();

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [quantity, setQuantity] = useState(1);
    const [recommendations, setRecommendations] = useState<Product[]>([]);

    useEffect(() => {
        if (id) {
            fetchProductAndReviews();
        }
    }, [id]);

    useEffect(() => {
        if (product) {
            // Track Recently Viewed
            const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            const updatedViewed = [
                product,
                ...viewed.filter((p: Product) => (p.id || p._id) !== (product.id || product._id))
            ].slice(0, 5); // Keep last 5
            localStorage.setItem('recentlyViewed', JSON.stringify(updatedViewed));

            // Fetch all products for recommendations (Client-side filtering for MVP)
            productsAPI.getProducts().then(res => {
                if (res.success) {
                    const recs = getRecommendedProducts(product, res.products);
                    setRecommendations(recs);
                }
            });
        }
    }, [product]);

    useEffect(() => {
        if (id) {
            fetchProductAndReviews();
        }
    }, [id]);

    const fetchProductAndReviews = async () => {
        try {
            setLoading(true);
            const [productRes, reviewsRes] = await Promise.all([
                productsAPI.getProduct(id!),
                reviewsAPI.getReviews(id!)
            ]);

            if (productRes.success) setProduct(productRes.product);
            if (reviewsRes.success) setReviews(reviewsRes.reviews);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            const cartItem: CartItem = { ...product, quantity };
            addItem(cartItem);
            alert('Added to cart!');
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !id) return;

        try {
            const response = await reviewsAPI.createReview({
                productId: id,
                rating: reviewData.rating,
                comment: reviewData.comment
            });

            if (response.success) {
                setReviews([response.review, ...reviews]);
                setShowReviewForm(false);
                setReviewData({ rating: 5, comment: '' });
                alert('Review submitted successfully!');
            }
        } catch (error: any) {
            alert(error.message || 'Failed to submit review');
        }
    };

    const handleMarkHelpful = async (reviewId: string) => {
        try {
            const response = await reviewsAPI.markHelpful(reviewId);
            if (response.success) {
                setReviews(reviews.map(r => r.id === reviewId ? response.review : r));
            }
        } catch (error) {
            console.error('Error marking helpful:', error);
        }
    };

    const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-5 w-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                        onClick={() => interactive && onRate?.(star)}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
                    <button onClick={() => navigate('/dashboard')} className="mt-4 btn-primary">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const avgRating = product.rating || 0;
    const reviewCount = product.reviewCount || reviews.length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
            </button>

            {/* Product Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Image */}
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                        <div className="flex items-center gap-4">
                            {renderStars(avgRating)}
                            <span className="text-sm text-gray-600">
                                {avgRating.toFixed(1)} ({reviewCount} reviews)
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-b border-gray-200 py-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-primary-600">₹{product.price}</span>
                            <span className="text-gray-500">/ {product.unit}</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-600">{product.description || 'No description available.'}</p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Category:</span> {product.category}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Stock:</span>{' '}
                            <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                            </span>
                        </p>
                        {product.wholesalerId && (
                            <p className="text-sm">
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                    From Wholesaler
                                </span>
                            </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                            <Clock className="h-4 w-4 text-primary-600" />
                            <span>Estimated Delivery: 3-5 Business Days</span>
                        </div>
                    </div>

                    {user?.role === 'customer' && product.stock > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={product.stock}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                                    className="input-field w-24"
                                />
                            </div>
                            <button onClick={handleAddToCart} className="btn-primary w-full flex items-center justify-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Add to Cart
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-gray-200 pt-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                    {user && !showReviewForm && (
                        <button onClick={() => setShowReviewForm(true)} className="btn-primary">
                            Write a Review
                        </button>
                    )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                    <div className="card p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Write Your Review</h3>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                {renderStars(reviewData.rating, true, (rating) => setReviewData({ ...reviewData, rating }))}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                                <textarea
                                    value={reviewData.comment}
                                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                    className="input-field"
                                    rows={4}
                                    placeholder="Share your experience with this product..."
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary">Submit Review</button>
                                <button type="button" onClick={() => setShowReviewForm(false)} className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>No reviews yet. Be the first to review this product!</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="card p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-medium text-gray-900">{review.userName}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {renderStars(review.rating)}
                                            <span className="text-sm text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-3">{review.comment}</p>
                                <button
                                    onClick={() => handleMarkHelpful(review.id)}
                                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                    Helpful ({review.helpful || 0})
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recommendations Section */}
            <div className="border-t border-gray-200 pt-8 mt-8">
                <RecommendedProducts
                    products={recommendations}
                    title="You Might Also Like"
                />
            </div>
        </div>
    );
};

export default ProductDetail;
