import React, { useState, useEffect, useContext } from 'react';
import './TableReservation.css';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';

const TableReservation = () => {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { token, url } = useContext(StoreContext);

    useEffect(() => {
        fetchTables();
        const interval = setInterval(fetchTables, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchTables = async () => {
        try {
            const response = await fetch(`${url}/api/table/list`);
            const data = await response.json();
            if (data.success) {
                setTables(data.data);
            }
        } catch (error) {
            console.error('Error fetching tables:', error);
        }
    };

    const handleTableClick = (table) => {
        if (!token) {
            toast.error('Please login to book a table');
            return;
        }
        if (!table.isBooked) {
            setSelectedTable(table);
            setShowModal(true);
        }
    };

    const handleBookTable = async () => {
        try {
            const response = await fetch(`${url}/api/table/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token
                },
                body: JSON.stringify({
                    tableNumber: selectedTable.tableNumber
                })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Table booked successfully!');
                fetchTables();
            } else {
                toast.error(data.message || 'Failed to book table');
            }
        } catch (error) {
            toast.error('Error booking table');
        }
        setShowModal(false);
    };

    return (
        <div className="table-reservation" id="table-reservation">
            <div className="table-reservation-container">
                <h2>Table Reservation</h2>
                <div className="tables-grid">
                    {tables.map((table) => (
                        <div
                            key={table.tableNumber}
                            className={`table-card ${table.isBooked ? 'booked' : ''}`}
                            onClick={() => handleTableClick(table)}
                        >
                            <div className="table-number">Table {table.tableNumber}</div>
                            <div className="table-capacity">{table.capacity} Seats</div>
                            <div className={`table-status ${table.isBooked ? 'booked' : 'available'}`}>
                                {table.isBooked ? 'Booked' : 'Available'}
                            </div>
                            <button
                                className="book-button"
                                disabled={table.isBooked}
                            >
                                {table.isBooked ? 'Booked' : 'Book Now'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Confirm Reservation</h3>
                            <button className="close-button" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <p>Would you like to book Table {selectedTable.tableNumber}?</p>
                        <div className="modal-actions">
                            <button className="cancel-button" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="confirm-button" onClick={handleBookTable}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableReservation;