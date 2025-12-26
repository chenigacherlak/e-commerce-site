import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, ChevronDown } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { Product, Category } from '../types';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, page, searchTerm]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data as Category[]);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
    if (sortBy === 'price-low') query = query.order('price', { ascending: true });
    if (sortBy === 'price-high') query = query.order('price', { ascending: false });
    if (sortBy === 'rating') query = query.order('rating', { ascending: false });

    query = query.range((page - 1) * 12, page * 12 - 1);

    const { data, error } = await query;
    if (!error && data) {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Discover Products</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-white mb-4">Filters</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search products..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center text-slate-400 py-12">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center text-slate-400 py-12">No products found</div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => (
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
                        <p className="text-slate-400 text-xs mt-2">Stock: {product.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-slate-400 px-4 py-2">Page {page}</span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={products.length < 12}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
