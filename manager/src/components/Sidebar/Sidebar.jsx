import React from 'react'
import  './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/add' className="sidebar-option">
            <img src={assets.add_icon} alt="" />
            <p>Add Items</p>
        </NavLink>
        <NavLink to='/list' className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>List Items</p>
        </NavLink>
        <NavLink to='/orders' className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Orders</p>
        </NavLink>
        <NavLink to='/stock-management' className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>StockManagement</p>
        </NavLink>
        <NavLink to='/sales' className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Sales</p>
        </NavLink>
        <NavLink to='/staff' className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Staff</p>
        </NavLink>
        <NavLink to='/tables' className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Tables</p>
        </NavLink>
        <NavLink to='/review' className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Reviews</p>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar