import React, { useState, useEffect } from 'react';
import './Reviews.css';
import { toast } from 'react-toastify';
import { currency } from '../../assets/assets';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        fiveStarReviews: 0,
        oneStarReviews: 0
    });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/review/list');
            const data = await response.json();
            
            if (data.success) {
                setReviews(data.data);
                calculateStats(data.data);
            } else {
                toast.error('Failed to fetch reviews');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Error fetching reviews');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (reviewsData) => {
        const total = reviewsData.length;
        const sumRatings = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        const fiveStars = reviewsData.filter(review => review.rating === 5).length;
        const oneStars = reviewsData.filter(review => review.rating === 1).length;

        setStats({
            totalReviews: total,
            averageRating: total > 0 ? (sumRatings / total).toFixed(1) : 0,
            fiveStarReviews: fiveStars,
            oneStarReviews: oneStars
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatOrderItems = (items) => {
        return items.map(item => `${item.name} x ${item.quantity}`).join(', ');
    };

    if (loading) {
        return <div className="reviews-container">Loading...</div>;
    }

    return (
        <div className="reviews-container">
            <div className="reviews-header">
                <h2>Customer Reviews</h2>
            </div>

            <div className="reviews-stats">
                <div className="stat-card">
                    <h3>Total Reviews</h3>
                    <p>{stats.totalReviews}</p>
                </div>
                <div className="stat-card">
                    <h3>Average Rating</h3>
                    <p>{stats.averageRating} ★</p>
                </div>
                <div className="stat-card">
                    <h3>5 Star Reviews</h3>
                    <p>{stats.fiveStarReviews}</p>
                </div>
                <div className="stat-card">
                    <h3>1 Star Reviews</h3>
                    <p>{stats.oneStarReviews}</p>
                </div>
            </div>

            <div className="reviews-list">
                {reviews.map((review) => (
                    <div key={review._id} className="review-card">
                        <div className="review-header">
                            <div className="review-rating">
                                {'★'.repeat(review.rating)}
                                {'☆'.repeat(5 - review.rating)}
                            </div>
                            <div className="review-date">
                                {formatDate(review.date)}
                            </div>
                        </div>
                        <div className="review-content">
                            {review.comment}
                        </div>
                        <div className="review-details">
                            <div className="customer-info">
                                <h4>Customer</h4>
                                <p>{review.userName}</p>
                            </div>
                            {review.orderDetails && (
                                <div className="order-info">
                                    <h4>Order Details</h4>
                                    <p><strong>Items:</strong> {formatOrderItems(review.orderDetails.items)}</p>
                                    <p><strong>Amount:</strong> {currency}{review.orderDetails.amount}</p>
                                    <p><strong>Status:</strong> {review.orderDetails.status}</p>
                                    <p><strong>Order Date:</strong> {formatDate(review.orderDetails.date)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reviews;