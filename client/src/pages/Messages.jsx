import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getConversations, getMessages, sendMessage, addMessageToStore } from '../store/messageSlice';
import { Send, Search, UserCircle2, Info } from 'lucide-react';
import io from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
var socket;

const Messages = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { conversations, messages, isLoading } = useSelector((state) => state.messages);
  const validConversations = Array.isArray(conversations) ? conversations : (conversations?.data || conversations?.conversations || []);
  const validMessages = Array.isArray(messages) ? messages : (messages?.data || messages?.messages || []);

  const [socketConnected, setSocketConnected] = useState(false);
  const [selectedUser, setSelectedUser] = useState(location.state?.startChatWith || null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (location.state?.startChatWith) {
      setSelectedUser(location.state.startChatWith);
      // Clean up state so refresh doesn't keep it
      window.history.replaceState({}, document.title)
    }
  }, [location.state]);

  // Initialize Socket Connection
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', { userId: user._id, token: user.token });
    socket.on('connected', () => setSocketConnected(true));

    socket.on('message_received', (newMessageReceived) => {
      // If we are currently chatting with the person who sent the message
      if (selectedUser && selectedUser._id === newMessageReceived.sender) {
        dispatch(addMessageToStore(newMessageReceived));
      } else {
        // Just refresh conversations to update unread count
        dispatch(getConversations());
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user._id, selectedUser, dispatch]);

  // Fetch Conversations on mount
  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  // Fetch Messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      dispatch(getMessages(selectedUser._id));
      socket.emit('join_chat', user._id); // optional typing indicators logic could go here
    }
  }, [selectedUser, dispatch, user._id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const msgData = {
      userId: selectedUser._id,
      text: newMessage
    };

    setNewMessage('');
    
    // Optimistic / Dispatch to backend
    const resultAction = await dispatch(sendMessage(msgData));
    
    if (sendMessage.fulfilled.match(resultAction)) {
      // Emit socket event to notify receiver
      socket.emit('new_message', resultAction.payload);
      // Refresh conversations list to update 'last message' view
      dispatch(getConversations());
    }
  };

  const filteredConversations = validConversations.filter(conv => 
    conv.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)]">
      
      <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 flex h-[85vh] overflow-hidden">
        
        {/* Left Pane: Conversations List */}
        <div className="w-full md:w-1/3 border-r border-slate-200 dark:border-slate-800/80 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800/80">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cmr-blue dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">No conversations found. Start a chat from the Directory!</div>
            ) : (
              filteredConversations.map((conv) => (
                <div 
                  key={conv.user._id}
                  onClick={() => setSelectedUser(conv.user)}
                  className={`p-4 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer transition-colors flex items-center gap-3 ${selectedUser?._id === conv.user._id ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 text-cmr-blue dark:text-blue-400 flex items-center justify-center font-bold flex-shrink-0">
                    {conv.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm">{conv.user.name}</h3>
                      <span className="text-[10px] text-slate-500">{new Date(conv.lastMessage.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                      {conv.lastMessage.isMine ? 'You: ' : ''}{conv.lastMessage.text}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="h-5 w-5 bg-cmr-blue rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Chat Area */}
        <div className={`${selectedUser ? 'flex' : 'hidden'} md:flex w-full md:w-2/3 flex-col bg-slate-50 dark:bg-[#0a0f1a]`}>
          
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800/80 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 text-cmr-blue dark:text-blue-400 flex items-center justify-center font-bold">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{selectedUser.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUser.role}</p>
                  </div>
                </div>
                <button className="md:hidden text-cmr-blue text-sm font-bold" onClick={() => setSelectedUser(null)}>Back</button>
              </div>

              {/* Messages Display */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                  <div className="text-center text-slate-500 dark:text-slate-400 py-4">Loading messages...</div>
                ) : (
                  validMessages.map((msg, index) => {
                    const isMine = msg.sender === user._id;
                    return (
                      <div key={index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMine 
                          ? 'bg-cmr-blue text-white rounded-br-sm' 
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-blue-100' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800/80">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cmr-blue dark:text-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-cmr-blue hover:bg-blue-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <UserCircle2 size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose someone from the list to start chatting.</p>
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
};

export default Messages;
