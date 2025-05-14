import React from 'react'
import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import StockManagement from './pages/StockManagement/StockManagement'
import Login from './pages/Login/Login'
import Staff from './pages/Staff/Staff'
import Tables from './pages/Tables/Tables'
import NotFound from './pages/NotFound/NotFound'
import Reviews from './pages/Reviews/Reviews'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sales from './pages/Sales/Sales'

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
          <Route path="stock-management" element={<StockManagement />} />
          <Route path="sales" element={<Sales />} />
          <Route path="staff" element={<Staff />} />
          <Route path="tables" element={<Tables />} />
          <Route path="review" element={<Reviews />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App