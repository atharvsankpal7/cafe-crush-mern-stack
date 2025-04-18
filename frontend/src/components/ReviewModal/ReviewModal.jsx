import React, { useState } from 'react';
import './ReviewModal.css';
import { toast } from 'react-toastify';
import axios from 'axios';

const ReviewModal = ({ orderId, onClose, token, url }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.warning('Please select a rating');
            return;
        }
        if (!comment.trim()) {
            toast.warning('Please enter a comment');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(`${url}/api/review/add`, 
                { orderId, rating, comment },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success('Review submitted successfully');
                onClose();
            } else {
                toast.error('Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="review-modal-overlay">
            <div className="review-modal">
                <div className="review-modal-header">
                    <h3>Write a Review</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="rating-container">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`star ${star <= rating ? 'filled' : ''}`}
                            onClick={() => setRating(star)}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <textarea
                    className="review-textarea"
                    placeholder="Write your review here..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <button
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </div>
        </div>
    );
};

export default ReviewModal;