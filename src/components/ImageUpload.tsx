import React, { useState, useCallback } from 'react';
import { Upload, X, Loader, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

interface ImageUploadProps {
    onImageUploaded: (url: string) => void;
    currentImage?: string;
    label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUploaded, currentImage, label = "Product Image" }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [error, setError] = useState<string | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const uploadFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size should be less than 5MB');
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', file);

        try {
            // Use relative path assuming proxy or base URL is set
            // Or use full URL from environment variable
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await axios.post(`${apiUrl}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setPreview(response.data.imageUrl);
                onImageUploaded(response.data.imageUrl);
            } else {
                setError('Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
            setIsDragging(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            uploadFile(e.target.files[0]);
        }
    };

    const removeImage = (e: React.MouseEvent) => {
        e.preventDefault();
        setPreview(null);
        onImageUploaded('');
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            {preview ? (
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden group border border-gray-200">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <button
                            onClick={removeImage}
                            className="p-2 bg-white rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                            title="Remove Image"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleChange}
                        accept="image/*"
                        disabled={isUploading}
                    />

                    <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
                        {isUploading ? (
                            <Loader className="h-10 w-10 text-primary-600 animate-spin" />
                        ) : (
                            <div className="p-4 bg-gray-100 rounded-full">
                                <Upload className="h-8 w-8 text-gray-400" />
                            </div>
                        )}

                        <div className="text-sm text-gray-600">
                            {isUploading ? (
                                <span className="font-medium text-primary-600">Uploading...</span>
                            ) : (
                                <>
                                    <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
                                </>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                </div>
            )}

            {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <X className="h-4 w-4" /> {error}
                </p>
            )}
        </div>
    );
};

export default ImageUpload;
