import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, MessageCircle, Zap, Users } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { Product } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .eq('is_active', true)
        .limit(6);

      if (!error && data) {
        setFeaturedProducts(data as Product[]);
      }
      setLoading(false);
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
          Connect. Shop. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Live</span>
        </h1>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Real-time chat with sellers, browse exclusive products, and shop with confidence. ChatMart brings you closer to what you love.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            Browse Chats <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: ShoppingBag, label: '10k+ Products', desc: 'Curated selection' },
            { icon: MessageCircle, label: 'Live Chat', desc: 'Chat with sellers' },
            { icon: Zap, label: 'Fast Shipping', desc: 'Quick delivery' },
            { icon: Users, label: 'Active Community', desc: 'Real users, real reviews' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center hover:border-blue-500 transition">
              <item.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-1">{item.label}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white mb-8">Featured Products</h2>
        {loading ? (
          <div className="text-center text-slate-400">Loading products...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-blue-500 transition cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-slate-700 to-slate-900 h-48 flex items-center justify-center group-hover:from-slate-600 transition">
                  <ShoppingBag className="w-12 h-12 text-slate-600" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white line-clamp-2 mb-2">{product.name}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">{product.short_description}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-bold text-white">${product.price.toFixed(2)}</p>
                      {product.discount_price && (
                        <p className="text-slate-500 line-through text-sm">${product.discount_price.toFixed(2)}</p>
                      )}
                    </div>
                    {product.rating > 0 && (
                      <div className="text-yellow-400 text-sm font-medium">
                        {product.rating.toFixed(1)} ⭐
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-800/50 border-t border-slate-700 mt-16 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-slate-400 mb-8">Join thousands of happy customers shopping on ChatMart today</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition"
          >
            Sign Up Now
          </button>
        </div>
      </section>
    </div>
  );
};
