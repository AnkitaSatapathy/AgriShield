import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

const MyOrders = () => {
  const [activeTab, setActiveTab] = useState('buyer'); // 'buyer' or 'seller'

  const BUYER_ID = "user_9999";
  const SELLER_ID = "user_1234";

  const [buyerOrders, setBuyerOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'buyer') {
        const res = await fetch(`http://127.0.0.1:8000/api/marketplace/orders/buyer/${BUYER_ID}`);
        if (res.ok) setBuyerOrders(await res.json());
      } else {
        const res = await fetch(`http://127.0.0.1:8000/api/marketplace/orders/seller/${SELLER_ID}`);
        if (res.ok) setSellerOrders(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/marketplace/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "In Transit": return <Truck className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "Delivered": return "bg-green-50 text-green-700 border-green-200";
      case "In Transit": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 flex items-center justify-center sm:justify-start tracking-tight">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl mr-4 shadow-lg shadow-green-500/30 text-white transform -rotate-6">
                <Package className="w-8 h-8" />
              </div>
              My Orders
            </h1>
            <p className="mt-3 text-lg text-gray-500 font-medium ml-1">Track and manage your agricultural orders</p>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex space-x-2 mb-8 max-w-md mx-auto sm:mx-0">
          <button
            onClick={() => setActiveTab('buyer')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'buyer'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md transform scale-100'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            Orders as Buyer
          </button>
          <button
            onClick={() => setActiveTab('seller')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'seller'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-100'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            Orders as Seller
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6 animate-fade-in-up">
          {isLoading ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 font-medium">Loading orders...</p>
            </div>
          ) : activeTab === 'buyer' ? (
            buyerOrders.length > 0 ? (
              buyerOrders.map((order, idx) => (
                <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-extrabold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-sm truncate max-w-[120px]" title={order.id}>{order.id.slice(0, 8)}...</span>
                      <span className="text-sm font-medium text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Product ID: {order.product_id.slice(0, 8)}...</h3>
                    <p className="text-sm font-medium text-gray-500 flex items-center mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2"></span>
                      Qty: <span className="text-gray-700 ml-1">{order.quantity}</span>
                    </p>
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2"></span>
                      Seller: <span className="text-gray-700 ml-1 truncate max-w-[150px]">{order.seller_id}</span>
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-8">
                    <span className="text-2xl font-extrabold text-gray-900 tracking-tight">₹{order.total_amount}</span>
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${getStatusBg(order.order_status)}`}>
                      {getStatusIcon(order.order_status)}
                      <span className="text-sm font-bold tracking-wide">{order.order_status}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-500 font-medium">You haven't placed any orders as a buyer yet.</p>
                <button className="mt-6 px-6 py-3 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-100 transition-colors">
                  Explore Marketplace
                </button>
              </div>
            )
          ) : (
            sellerOrders.length > 0 ? (
              sellerOrders.map((order, idx) => (
                <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-extrabold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-sm truncate max-w-[120px]" title={order.id}>{order.id.slice(0, 8)}...</span>
                      <span className="text-sm font-medium text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Product ID: {order.product_id.slice(0, 8)}...</h3>
                    <p className="text-sm font-medium text-gray-500 flex items-center mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2"></span>
                      Qty: <span className="text-gray-700 ml-1">{order.quantity}</span>
                    </p>
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2"></span>
                      Buyer: <span className="text-gray-700 ml-1 truncate max-w-[150px]">{order.buyer_id}</span>
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-8">
                    <span className="text-2xl font-extrabold text-gray-900 tracking-tight">₹{order.total_amount}</span>
                    <div className="flex flex-col items-end space-y-2">
                      <select
                        value={order.order_status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl border font-bold text-sm outline-none cursor-pointer ${getStatusBg(order.order_status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Sales Yet</h3>
                <p className="text-gray-500 font-medium">You haven't received any orders for your products yet.</p>
                <button className="mt-6 px-6 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors">
                  List a Product
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
