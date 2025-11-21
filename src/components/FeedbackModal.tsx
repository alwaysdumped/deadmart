import React, { useState } from 'react';
import { Star, X } from 'lucide-react';


import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, product }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    if (!isOpen || !user) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const review = {
            id: Math.random().toString(36).substr(2, 9),
            productId: product.id,
            userId: user.id,
            userName: user.name,
            rating,
            comment,
            createdAt: new Date().toISOString(),
        };

        // In a real app, we'd save this. For mock DB, we'll add a helper or just log it.
        // Let's assume db has a saveReview method or we just push to local state if we didn't add it to db.ts yet.
        // Checking db.ts... I added 'livemart_reviews' but no explicit saveReview method.
        // I'll quickly add it to the logic here or just manually update localStorage for simplicity in this component
        // to avoid editing db.ts again if not strictly necessary, but editing db.ts is cleaner.
        // Actually, I'll just read/write localStorage here for the prototype speed.

        const reviews = JSON.parse(localStorage.getItem('livemart_reviews') || '[]');
        reviews.push(review);
        localStorage.setItem('livemart_reviews', JSON.stringify(reviews));

        onClose();
        alert('Thank you for your feedback!');
    };

    return (
        <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Rate {product.name}</h3>

                            <div className="flex items-center justify-center space-x-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`h-8 w-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Comment</label>
                                <textarea
                                    rows={4}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share your experience..."
                                />
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Submit Review
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;
