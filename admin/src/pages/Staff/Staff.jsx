import React, { useState, useEffect } from "react";
import "./Staff.css";
import { toast } from "react-toastify";

const Staff = () => {
    const [staffList, setStaffList] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        age: "",
        salary: "",
        photo: "",
        email: "",
        password: "",
        role: "manager"
    });
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [updateData, setUpdateData] = useState(null);

    useEffect(() => {
        fetchStaffList();
    }, []);

    const fetchStaffList = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:4000/api/staff/list", {
                headers: {
                    "token": `${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                toast.error("Error fetching staff data!");
                return;
            }
            const data = await response.json();
            setStaffList(data);
        } catch (error) {
            toast.error("Error fetching staff data!");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e, isUpdateForm = false) => {
        const { name, value, type, files } = e.target;
        const dataToUpdate = isUpdateForm ? updateData : formData;
        const setDataFunction = isUpdateForm ? setUpdateData : setFormData;

        if (type === "file" && files.length > 0) {
            const reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.onloadend = () => {
                setDataFunction((prevState) => ({
                    ...prevState,
                    [name]: reader.result,
                }));
            };
        } else {
            setDataFunction((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.address || !formData.age || !formData.salary || !formData.email || !formData.password) {
            toast.warn("Please fill all required fields!");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("http://localhost:4000/api/staff/add", {
                method: "POST",
                headers: {
                    "token": `${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Server Error");

            toast.success("Manager added successfully!");
            setFormData({ 
                name: "", 
                phone: "", 
                address: "", 
                age: "", 
                salary: "", 
                photo: "", 
                email: "", 
                password: "", 
                role: "manager" 
            });
            fetchStaffList();
        } catch (error) {
            toast.error("Failed to add manager details!");
        }
        setLoading(false);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!updateData.name || !updateData.phone || !updateData.address || !updateData.age || !updateData.salary || !updateData.email) {
            toast.warn("Please fill all required fields!");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("http://localhost:4000/api/staff/update", {
                method: "PUT",
                headers: {
                    "token": `${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) throw new Error("Server Error");

            toast.success("Manager updated successfully!");
            setShowModal(false);
            setUpdateData(null);
            fetchStaffList();
        } catch (error) {
            toast.error("Failed to update manager details!");
        }
        setLoading(false);
    };

    const handleEdit = (staff) => {
        setUpdateData({...staff});
        setShowModal(true);
    };

    const handleDelete = async (mail) => {
        if (!window.confirm("Are you sure you want to delete this manager?")) return;
        try {
            setLoading(true);
            const response = await fetch("http://localhost:4000/api/staff/remove", {
                method: "DELETE",
                headers: {
                    "token": `${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: mail }),
            });

            if (!response.ok) throw new Error("Server Error");

            toast.success("Manager deleted successfully!");
            fetchStaffList();
        } catch (error) {
            toast.error("Failed to delete manager!");
        }
        setLoading(false);
    };

    const closeModal = () => {
        setShowModal(false);
        setUpdateData(null);
    };

    return (
     <div className="staff-container">
            <h2>Manager Management</h2>
            <div className="form-container">
                <input type="text" name="name" placeholder="Manager Name" value={formData.name} onChange={handleChange} />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                <input type="text" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
                <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} />
                <input type="number" name="salary" placeholder="Salary" value={formData.salary} onChange={handleChange} />
                <input type="file" name="photo" accept="image/*" onChange={handleChange} />
                {formData.photo && <img src={formData.photo} alt="Manager" style={{ width: "50px", height: "50px" }} />}
                <button type="submit" onClick={handleAddSubmit} disabled={loading}>{loading ? "Processing..." : "Add Manager"}</button>
            </div>

            {/* Manager List */}
            <h2>Manager Details</h2>
            {loading && !showModal ? <p>Loading...</p> : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Age</th>
                            <th>Salary</th>
                            <th>Photo</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.map((staff) => (
                            <tr key={staff._id}>
                                <td>{staff.name}</td>
                                <td>{staff.email}</td>
                                <td>{staff.phone}</td>
                                <td>{staff.address}</td>
                                <td>{staff.age}</td>
                                <td>{staff.salary}</td>
                                <td>{staff.photo && <img src={staff.photo} alt="Manager" className="table-image" />}</td>
                                <td className="action-buttons">
                                    <button onClick={() => handleEdit(staff)}>Edit</button>
                                    <button onClick={() => handleDelete(staff.email)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Update Modal */}
            {showModal && updateData && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Update Manager</h3>
                            <button className="close-btn" onClick={closeModal}>&times;</button>
                        </div>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="form-group">
                                <input type="text" name="name" placeholder="Manager Name" value={updateData.name} onChange={(e) => handleChange(e, true)} required />
                            </div>
                            <div className="form-group">
                                <input type="email" name="email" placeholder="Email" value={updateData.email} onChange={(e) => handleChange(e, true)} required readOnly />
                            </div>
                            <div className="form-group">
                                <input type="text" name="phone" placeholder="Phone Number" value={updateData.phone} onChange={(e) => handleChange(e, true)} required />
                            </div>
                            <div className="form-group">
                                <input type="text" name="address" placeholder="Address" value={updateData.address} onChange={(e) => handleChange(e, true)} required />
                            </div>
                            <div className="form-group">
                                <input type="number" name="age" placeholder="Age" value={updateData.age} onChange={(e) => handleChange(e, true)} required />
                            </div>
                            <div className="form-group">
                                <input type="number" name="salary" placeholder="Salary" value={updateData.salary} onChange={(e) => handleChange(e, true)} required />
                            </div>
                            <div className="form-group">
                                <input type="file" name="photo" accept="image/*" onChange={(e) => handleChange(e, true)} />
                                {updateData.photo && <img src={updateData.photo} alt="Manager Preview" className="preview-image" />}
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={closeModal}>Cancel</button>
                                <button type="submit" disabled={loading}>{loading ? "Processing..." : "Update Manager"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;