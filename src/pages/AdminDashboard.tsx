import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { BarChart3, Users, ShoppingCart, MessageCircle, TrendingUp } from 'lucide-react';

interface Stats {
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  activeChatRooms: number;
  recentOrders: any[];
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    activeChatRooms: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchStats();
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const [orders, users, chatRooms] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('chat_rooms').select('*', { count: 'exact', head: true }),
      ]);

      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const totalRevenue = orderData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      setStats({
        totalOrders: orders.count || 0,
        totalUsers: users.count || 0,
        totalRevenue,
        activeChatRooms: chatRooms.count || 0,
        recentOrders: orderData || [],
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-blue-500 opacity-50" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={fetchStats}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm"
          >
            Refresh
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} />
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
          <StatCard icon={TrendingUp} label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
          <StatCard icon={MessageCircle} label="Chat Rooms" value={stats.activeChatRooms} />
          <StatCard icon={BarChart3} label="Avg Order Value" value={`$${(stats.totalRevenue / Math.max(stats.totalOrders, 1)).toFixed(2)}`} />
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-bold text-white mb-6">Recent Orders</h2>

          {stats.recentOrders.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Order ID</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                      <td className="py-3 px-4 text-white">{order.order_number}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-white font-medium">${order.total_amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900/20 text-blue-300 border border-blue-500/30">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
