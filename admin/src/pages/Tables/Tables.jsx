import React, { useState, useEffect } from 'react';
import './Tables.css';
import { toast } from 'react-toastify';

const Tables = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTables();
        // Refresh tables every 30 seconds
        const interval = setInterval(fetchTables, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchTables = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/table/list');
            const data = await response.json();
            if (data.success) {
                setTables(data.data);
            }
        } catch (error) {
            console.error('Error fetching tables:', error);
            toast.error('Failed to fetch tables');
        } finally {
            setLoading(false);
        }
    };

    const handleBookingAction = async (tableNumber, action) => {
        try {
            const response = await fetch('http://localhost:4000/api/table/handle-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                },
                body: JSON.stringify({ tableNumber, action })
            });

            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                fetchTables();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to handle booking request');
        }
    };

    const markAvailable = async (tableNumber) => {
        try {
            const response = await fetch('http://localhost:4000/api/table/mark-available', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                },
                body: JSON.stringify({ tableNumber })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Table marked as available');
                fetchTables();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to update table status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'booked': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="tables-container">
            <h2>Table Management</h2>
            <div className="tables-grid">
                {tables.map((table) => (
                    <div key={table.tableNumber} className="table-card">
                        <div className="table-header">
                            <h3>Table {table.tableNumber}</h3>
                            <span className={`status-badge ${getStatusColor(table.status)}`}>
                                {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                            </span>
                        </div>
                        <div className="table-info">
                            <p>Capacity: {table.capacity} people</p>
                            {table.bookedBy && (
                                <p>Booked by: {table.bookedBy}</p>
                            )}
                            {table.bookingTime && (
                                <p>Booked at: {new Date(table.bookingTime).toLocaleString()}</p>
                            )}
                        </div>
                        <div className="table-actions">
                            {table.status === 'pending' && (
                                <>
                                    <button 
                                        className="approve-btn"
                                        onClick={() => handleBookingAction(table.tableNumber, 'approve')}
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        className="reject-btn"
                                        onClick={() => handleBookingAction(table.tableNumber, 'reject')}
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            {table.status === 'booked' && (
                                <button 
                                    className="complete-btn"
                                    onClick={() => markAvailable(table.tableNumber)}
                                >
                                    Mark Complete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tables;