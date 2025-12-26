import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { CartItem, Product } from '../types';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartItems(cart);
      fetchProductDetails(cart);
    }
    setLoading(false);
  };

  const fetchProductDetails = async (cartItems: CartItem[]) => {
    const productIds = cartItems.map(item => item.product_id);
    if (productIds.length === 0) return;

    const { data } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (data) {
      const productMap = new Map(data.map(p => [p.id, p as Product]));
      setProducts(productMap);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    const updated = cartItems.map(item =>
      item.product_id === productId ? { ...item, quantity } : item
    );

    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (productId: string) => {
    const updated = cartItems.filter(item => item.product_id !== productId);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const product = products.get(item.product_id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to checkout</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

        {loading ? (
          <div className="text-center text-slate-400">Loading...</div>
        ) : cartItems.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
            <p className="text-slate-400 mb-6">Add some products to get started</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = products.get(item.product_id);
                return (
                  <div
                    key={item.product_id}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex gap-6"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-3xl">📦</div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">{product?.name}</h3>
                      <p className="text-slate-400 text-sm mb-4">{product?.short_description}</p>
                      <p className="text-lg font-bold text-white">
                        ${(product?.price || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-2 bg-slate-700 border border-slate-600 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-600 rounded transition"
                        >
                          <Minus className="w-4 h-4 text-white" />
                        </button>
                        <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-600 rounded transition"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      <p className="text-white font-semibold">
                        ${((product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 sticky top-8">
                <h2 className="text-lg font-bold text-white mb-6">Order Summary</h2>

                <div className="space-y-3 border-b border-slate-700 pb-6 mb-6">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="font-semibold text-white">Total</span>
                  <span className="text-2xl font-bold text-blue-400">${total.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/products')}
                  className="w-full mt-3 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-lg transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
