import React, { useState, useEffect } from "react";
import "./Restaurants.css";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState(null);
    const [formData, setFormData] = useState({
        branchId: "",
        branchName: "",
        address: "",
        contactNo: "",
        image: ""
    });

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:4000/api/restaurant/list", {
                headers: {
                    "token": localStorage.getItem("token")
                }
            });
            const data = await response.json();
            setRestaurants(data);
        } catch (error) {
            toast.error("Error fetching restaurants!");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    image: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        // Validate required fields
        const requiredFields = ["branchId", "branchName", "address", "contactNo", "image"];
        const missingFields = requiredFields.filter(field => !formData[field]);
        if (missingFields.length > 0) {
            toast.warn("Please fill all required fields!");
            return;
        }

        try {
            const url = editingRestaurant
                ? `http://localhost:4000/api/restaurant/${editingRestaurant._id}`
                : "http://localhost:4000/api/restaurant/add";
            
            const method = editingRestaurant ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "token": localStorage.getItem("token")
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error("Failed to save restaurant");

            toast.success(editingRestaurant ? "Restaurant updated successfully!" : "Restaurant added successfully!");
            resetForm();
            fetchRestaurants();
        } catch (error) {
            toast.error("Failed to save restaurant!");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this restaurant?")) return;

        try {
            const response = await fetch(`http://localhost:4000/api/restaurant/${id}`, {
                method: "DELETE",
                headers: {
                    "token": localStorage.getItem("token")
                }
            });

            if (!response.ok) throw new Error("Failed to delete restaurant");

            toast.success("Restaurant deleted successfully!");
            fetchRestaurants();
        } catch (error) {
            toast.error("Failed to delete restaurant!");
        }
    };

    const handleEdit = (restaurant) => {
        setFormData(restaurant);
        setEditingRestaurant(restaurant);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            branchId: "",
            branchName: "",
            address: "",
            contactNo: "",
            image: ""
        });
        setEditingRestaurant(null);
        setShowModal(false);
    };

    return (
        <div className="restaurants-container">
            <div className="restaurants-header">
                <h2>Restaurant Branches</h2>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                    <FaPlus /> Add Branch
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="restaurants-grid">
                    {restaurants.map((restaurant) => (
                        <div key={restaurant._id} className="restaurant-card">
                            <div className="restaurant-image">
                                <img src={restaurant.image} alt={restaurant.branchName} />
                            </div>
                            <div className="restaurant-info">
                                <h3>{restaurant.branchName}</h3>
                                <p><strong>Branch ID:</strong> {restaurant.branchId}</p>
                                <p><strong>Address:</strong> {restaurant.address}</p>
                                <p><strong>Contact:</strong> {restaurant.contactNo}</p>
                            </div>
                            <div className="restaurant-actions">
                                <button
                                    className="edit-btn"
                                    onClick={() => handleEdit(restaurant)}
                                >
                                    <FaEdit /> Edit
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(restaurant._id)}
                                >
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal" onClick={resetForm}>×</button>
                        <h3>{editingRestaurant ? "Edit Branch" : "Add New Branch"}</h3>
                        <div className="form-container">
                            <div className="form-group">
                                <label>Branch ID:</label>
                                <input
                                    type="text"
                                    name="branchId"
                                    value={formData.branchId}
                                    onChange={handleChange}
                                    placeholder="Enter Branch ID"
                                />
                            </div>
                            <div className="form-group">
                                <label>Branch Name:</label>
                                <input
                                    type="text"
                                    name="branchName"
                                    value={formData.branchName}
                                    onChange={handleChange}
                                    placeholder="Enter Branch Name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Address:</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter Branch Address"
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Number:</label>
                                <input
                                    type="text"
                                    name="contactNo"
                                    value={formData.contactNo}
                                    onChange={handleChange}
                                    placeholder="Enter Contact Number"
                                />
                            </div>
                            <div className="form-group">
                                <label>Branch Image:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {formData.image && (
                                    <div className="image-preview">
                                        <img src={formData.image} alt="Preview" />
                                    </div>
                                )}
                            </div>
                            <div className="form-actions">
                                <button onClick={handleSubmit} className="submit-btn">
                                    {editingRestaurant ? "Update" : "Add"} Branch
                                </button>
                                <button onClick={resetForm} className="cancel-btn">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Restaurants; 