import React, { useEffect, useState } from 'react';
import { Send, Plus, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { ChatRoom, ChatMessage } from '../types';

export const ChatPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms();
      subscribeToRooms();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
      subscribeToMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  const fetchRooms = async () => {
    if (!user) return;

    const { data: memberData } = await supabase
      .from('room_members')
      .select('room_id')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (memberData && memberData.length > 0) {
      const roomIds = memberData.map(m => m.room_id);
      const { data: roomsData, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .in('id', roomIds)
        .order('last_message_at', { ascending: false });

      if (!error && roomsData) {
        setRooms(roomsData as ChatRoom[]);
        if (roomsData.length > 0) {
          setSelectedRoom(roomsData[0] as ChatRoom);
        }
      }
    }
    setLoading(false);
  };

  const subscribeToRooms = () => {
    if (!user) return;

    const subscription = supabase
      .from('chat_rooms')
      .on('*', async (payload) => {
        await fetchRooms();
      })
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const fetchMessages = async (roomId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        user:user_id (id, username, avatar_url)
      `)
      .eq('room_id', roomId)
      .eq('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(100);

    if (!error && data) {
      setMessages(data as unknown as ChatMessage[]);
    }
  };

  const subscribeToMessages = (roomId: string) => {
    const subscription = supabase
      .from('messages')
      .on('*', (payload) => {
        if (payload.new.room_id === roomId && !payload.new.deleted_at) {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      })
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !user) return;

    const { error } = await supabase.from('messages').insert({
      room_id: selectedRoom.id,
      user_id: user.id,
      content: newMessage,
      message_type: 'text',
    });

    if (!error) {
      setNewMessage('');
      await supabase
        .from('chat_rooms')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedRoom.id);
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createNewRoom = async () => {
    if (!user) return;
    const roomName = `Chat with ${new Date().getTime()}`;

    const { data: newRoom, error } = await supabase
      .from('chat_rooms')
      .insert({
        name: roomName,
        room_type: 'group',
        created_by: user.id,
        is_active: true,
      })
      .select()
      .maybeSingle();

    if (!error && newRoom) {
      await supabase.from('room_members').insert({
        room_id: newRoom.id,
        user_id: user.id,
        is_active: true,
      });

      setSelectedRoom(newRoom as ChatRoom);
      await fetchRooms();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to chat</h2>
          <p className="text-slate-400">You need to be authenticated to access chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex">
      <div className="w-full max-w-7xl mx-auto flex h-screen">
        <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <button
              onClick={createNewRoom}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          <div className="p-4 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search chats..."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pl-10 pr-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-400">Loading...</div>
            ) : filteredRooms.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">No chat rooms</div>
            ) : (
              filteredRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-700 transition ${
                    selectedRoom?.id === room.id
                      ? 'bg-blue-600/20 border-l-2 border-l-blue-600'
                      : 'hover:bg-slate-700'
                  }`}
                >
                  <h3 className="font-medium text-white truncate">{room.name}</h3>
                  <p className="text-slate-400 text-xs mt-1">{room.room_type}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-slate-900">
          {selectedRoom ? (
            <>
              <div className="p-4 border-b border-slate-700 bg-slate-800">
                <h2 className="text-lg font-bold text-white">{selectedRoom.name}</h2>
                <p className="text-slate-400 text-sm">{selectedRoom.description}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.user_id === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-100 border border-slate-700'
                      }`}
                    >
                      {msg.user_id !== user?.id && (
                        <p className="text-xs font-medium text-slate-400 mb-1">
                          {msg.user?.username}
                        </p>
                      )}
                      <p className="text-sm break-words">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700 bg-slate-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-lg transition"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">No chat selected</h2>
                <p className="text-slate-400">Create or select a chat to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
