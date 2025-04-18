import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import axios from 'axios'
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import ReviewModal from '../../components/ReviewModal/ReviewModal';

const MyOrders = () => {
  
  const [data,setData] =  useState([]);
  const {url,token,currency} = useContext(StoreContext);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchOrders = async () => {
    const response = await axios.post(url+"/api/order/userorders",{},{headers:{token}});
    setData(response.data.data)
  }

  useEffect(()=>{
    if (token) {
      fetchOrders();
    }
  },[token])

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>
      <div className="container">
        {data.map((order,index)=>{
          return (
            <div key={index} className='my-orders-order'>
                <img src={assets.parcel_icon} alt="" />
                <p>{order.items.map((item,index)=>{
                  if (index === order.items.length-1) {
                    return item.name+" x "+item.quantity
                  }
                  else{
                    return item.name+" x "+item.quantity+", "
                  }
                  
                })}</p>
                <p>{currency}{order.amount}.00</p>
                <p>Items: {order.items.length}</p>
                <p><span>&#x25cf;</span> <b>{order.status}</b></p>
                <div className="order-actions">
                  <button onClick={fetchOrders}>Track Order</button>
                  {order.status === "Delivered" && (
                    <button onClick={() => setSelectedOrderId(order._id)}>Add Review</button>
                  )}
                </div>
            </div>
          )
        })}
      </div>

      {selectedOrderId && (
        <ReviewModal 
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          token={token}
          url={url}
        />
      )}
    </div>
  )
}

export default MyOrders