import React, { useState, useEffect } from 'react';
import { Tag, ShoppingBag, X } from 'lucide-react';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cart state
  const [cartCount, setCartCount] = useState(0);
  const [notification, setNotification] = useState(null);

  const BUYER_ID = "user_9999";

  useEffect(() => {
    fetchPurchasedItems();
    fetchCartCount();
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/marketplace/cart/${BUYER_ID}`);
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.items ? data.items.length : 0);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };



  const fetchPurchasedItems = async () => {
    try {
      // Get all orders where the user is the buyer
      const response = await fetch(`http://127.0.0.1:8000/api/marketplace/orders/buyer/${BUYER_ID}`);
      if (response.ok) {
        const ordersData = await response.json();

        // We'll map the orders into a structure that the UI expects for "purchased products"
        const purchased = ordersData.map(order => ({
          id: order.id,
          order_id: order.id,
          product_id: order.product_id,
          name: `Purchased Item (${order.product_id.slice(0, 6)})`,
          category: 'Purchased',
          price: order.total_amount,
          quantity: order.quantity,
          unit: 'units',
          image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?w=400&h=300&fit=crop",
          status: order.order_status,
          date: new Date(order.created_at).toLocaleDateString()
        }));
        setProducts(purchased);
      } else {
        console.error("Failed to fetch purchased items");
      }
    } catch (error) {
      console.error("Error fetching purchased items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // We are removing the Add, Edit, Delete product logic since this is now just past purchases.

  return (
    <div className="min-h-screen bg-[#f8fafc] py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-24 right-4 z-50 px-6 py-3 rounded-lg shadow-xl flex items-center space-x-3 transition-opacity duration-300 animate-fade-in-up ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
          {notification.type === 'success' ? <ShoppingBag className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 flex items-center tracking-tight">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-2xl mr-4 shadow-lg shadow-blue-500/30 text-white transform rotate-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              My Purchased Products
            </h1>
            <p className="mt-3 text-lg text-gray-500 font-medium ml-1">View the products you have previously purchased</p>
          </div>

          <div className="flex items-center space-x-4 w-full md:w-auto mt-4 md:mt-0">
            <button className="relative p-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
              <ShoppingBag className="w-6 h-6 group-hover:text-blue-600 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
          {isLoading ? (
            <div className="col-span-full text-center py-20 text-gray-500 font-medium">Loading your products...</div>
          ) : products.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">

              <div className="relative h-56 overflow-hidden">
                <img
                  src={product.image || product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                <span className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-md text-blue-800 text-xs font-bold rounded-lg shadow-sm border border-white/20">
                  {product.category}
                </span>

                <h3 className="absolute bottom-4 left-4 right-4 text-xl font-bold text-white line-clamp-1 truncate tracking-wide drop-shadow-md">
                  {product.name}
                </h3>
              </div>

              <div className="p-6 flex flex-col flex-grow">

                <div className="flex items-baseline space-x-1 mb-6">
                  <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{product.price.toString().startsWith('₹') ? product.price : `₹${product.price}`}</span>
                  <span className="text-gray-500 font-medium text-sm">/ {product.unit}</span>
                </div>

                <div className="flex items-center text-sm mb-4 bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                  <div className="bg-white p-2 rounded-lg shadow-sm mr-3">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="block text-gray-500 font-medium text-xs mb-0.5">Quantity Purchased</span>
                    <span className="block text-gray-900 font-bold">{product.quantity} {product.unit}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Order Date:</span>
                  <span className="font-bold text-gray-800">{product.date}</span>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && products.length === 0 && (
            <div className="col-span-full text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm text-gray-500">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Purchased Products</h3>
              <p className="text-lg mb-6">You haven't bought anything from the marketplace yet.</p>
              <button
                onClick={() => { window.location.hash = '#/marketplace'; window.location.reload(); }}
                className="px-8 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors"
              >
                Explore Marketplace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProducts;
