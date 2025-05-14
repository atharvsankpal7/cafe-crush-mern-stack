import React from 'react'
import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Staff from "./pages/Staff/Staff"
import Orders from './pages/Orders/Orders'
import StockManagement from './pages/StockManagement/StockManagement'
import Login from './pages/Login/Login'
import NotFound from './pages/NotFound/NotFound'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sales from "./pages/Sales/Sales"
import Restaurants from "./pages/Restaurants/Restaurants"
import Reviews from './pages/Reviews/Reviews'
import Tables from './pages/Tables/Tables'

// Protected Layout Component
const ProtectedLayout = () => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return (
    <>
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Outlet /> {/* This will render the child routes */}
      </div>
    </>
  )
}

const App = () => {
  return (
    <div className='app'>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/add" replace />} />
          <Route path="add" element={<Add />} />
          <Route path="list" element={<List />} />
          <Route path="orders" element={<Orders />} />
          <Route path="staff" element={<Staff />} />
          <Route path="stock-management" element={<StockManagement />} />
          <Route path="sales" element={<Sales />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="tables" element={<Tables />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App