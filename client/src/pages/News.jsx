import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getNews, createNews, deleteNews, toggleLike, addComment, deleteComment, pinNews } from '../store/newsSlice';
import { Newspaper, Send, Trash2, Heart, MessageSquare, Pin, Image as ImageIcon, Users, Filter, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const News = () => {
  const dispatch = useDispatch();
  const { news, isLoading } = useSelector((state) => state.news);
  const { user } = useSelector((state) => state.auth);

  const [activeFilter, setActiveFilter] = useState('All');
  const categories = ['All', 'General', 'Placements', 'Events', 'Academics', 'Alumni'];

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', content: '', category: 'General', targetRole: 'All', targetBranch: 'All', allowComments: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(getNews());
  }, [dispatch]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return toast.error('Title and content are required.');
    
    let imageUrl = '';
    
    // Upload image if selected
    if (imageFile) {
      const uploadData = new FormData();
      uploadData.append('image', imageFile);
      setUploading(true);
      try {
        const API_BASE = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user.token}` },
          body: uploadData
        });
        const data = await res.text(); // multer returns the path string
        if (res.ok) {
          const SERVER_BASE = API_BASE.replace('/api', '');
          imageUrl = `${SERVER_BASE}${data}`;
        } else {
          toast.error('Image upload failed');
          setUploading(false);
          return;
        }
      } catch (err) {
        toast.error('Image upload failed');
        setUploading(false);
        return;
      }
    }

    dispatch(createNews({ ...formData, imageUrl }));
    toast.success('Announcement posted!');
    setFormData({ title: '', content: '', category: 'General', targetRole: 'All', targetBranch: 'All', allowComments: true });
    setImageFile(null);
    setUploading(false);
    setShowForm(false);
  };

  const validNews = Array.isArray(news) ? news : (news?.data || news?.news || []);
  const filteredNews = activeFilter === 'All' ? validNews : validNews.filter(n => n.category === activeFilter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-cmr-blue dark:text-blue-400">
            <Newspaper size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Campus Feed</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest announcements and updates</p>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === cat 
                ? 'bg-cmr-blue text-white shadow-md' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Post News Form (Admin/Faculty only) */}
      {(user.role === 'Admin' || user.role === 'Faculty') && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Send size={18} className="text-cmr-orange dark:text-amber-400" /> Post an Announcement
            </span>
            <ChevronDown size={20} className={`text-slate-400 transition-transform ${showForm ? 'rotate-180' : ''}`} />
          </button>
          
          {showForm && (
            <form onSubmit={handlePostSubmit} className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4 bg-slate-50/50 dark:bg-[#0b1120]">
              <input
                type="text"
                placeholder="Announcement Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cmr-blue focus:outline-none dark:text-white"
                required
              />
              <textarea
                placeholder="What's happening? (Markdown is supported! Use **bold**, *italics*, - lists, etc.)"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cmr-blue focus:outline-none min-h-[100px] dark:text-white"
                required
              />
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <ImageIcon size={18} />
                  <span className="text-sm font-medium">Attach Cover Image:</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full bg-transparent focus:outline-none text-sm dark:text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-cmr-blue hover:file:bg-blue-100 dark:file:bg-blue-500/10 dark:file:text-blue-400 cursor-pointer"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm dark:text-slate-200"
                >
                  <option value="General">General</option>
                  <option value="Placements">Placements</option>
                  <option value="Events">Events</option>
                  <option value="Academics">Academics</option>
                  <option value="Alumni">Alumni</option>
                </select>
                
                <select 
                  value={formData.targetRole} 
                  onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm dark:text-slate-200"
                >
                  <option value="All">Target: Everyone</option>
                  <option value="Student">Target: Students</option>
                  <option value="Alumni">Target: Alumni</option>
                  <option value="Faculty">Target: Faculty</option>
                </select>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="allowComments" 
                    checked={formData.allowComments}
                    onChange={(e) => setFormData({...formData, allowComments: e.target.checked})}
                    className="rounded text-cmr-blue focus:ring-cmr-blue h-4 w-4"
                  />
                  <label htmlFor="allowComments" className="text-sm text-slate-600 dark:text-slate-400">Allow Comments</label>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button type="submit" disabled={uploading} className="bg-cmr-blue text-white px-6 py-2 rounded-xl font-semibold shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {uploading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* News Feed */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-10 text-slate-500">Loading feed...</div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <Newspaper className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No announcements yet.</p>
          </div>
        ) : (
          filteredNews.map((item) => (
            <NewsCard key={item._id} item={item} user={user} dispatch={dispatch} />
          ))
        )}
      </div>
    </div>
  );
};

const NewsCard = ({ item, user, dispatch }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const isLiked = item.likes?.includes(user._id);
  const isAuthor = item.author._id === user._id;
  const isAdmin = user.role === 'Admin';

  const handleLike = () => dispatch(toggleLike(item._id));
  const handleDelete = () => { if(window.confirm('Delete this post?')) dispatch(deleteNews(item._id)); };
  const handlePin = () => dispatch(pinNews(item._id));
  
  const handleComment = (e) => {
    e.preventDefault();
    if(!commentText.trim()) return;
    dispatch(addComment({ id: item._id, text: commentText }));
    setCommentText('');
  };

  const handleDeleteComment = (commentId) => {
    if(window.confirm('Delete comment?')) dispatch(deleteComment({ id: item._id, commentId }));
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden transition-all hover:shadow-md">
      
      {/* Pinned Header */}
      {item.isPinned && (
        <div className="bg-cmr-orange/10 dark:bg-amber-500/10 px-4 py-2 flex items-center gap-2 border-b border-cmr-orange/20 dark:border-amber-500/20">
          <Pin size={14} className="text-cmr-orange dark:text-amber-400 fill-current" />
          <span className="text-xs font-bold text-cmr-orange dark:text-amber-400 uppercase tracking-wide">Pinned Announcement</span>
        </div>
      )}

      {/* Card Header */}
      <div className="p-5 flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
            {item.author.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{item.author.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {item.author.role} • {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-md">
            {item.category}
          </span>
          {isAdmin && (
            <button onClick={handlePin} className={`p-1.5 rounded-lg transition-colors ${item.isPinned ? 'text-cmr-orange bg-orange-50 dark:bg-amber-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Pin post">
              <Pin size={16} />
            </button>
          )}
          {(isAuthor || isAdmin) && (
            <button onClick={handleDelete} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete post">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-4 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{item.title}</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none prose-slate prose-a:text-cmr-blue dark:prose-a:text-blue-400">
            <ReactMarkdown>{item.content}</ReactMarkdown>
          </div>
        </div>

        {/* Cover Image */}
        {item.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800/80">
            <img src={item.imageUrl} alt="Announcement cover" className="w-full h-auto object-cover max-h-96" loading="lazy" />
          </div>
        )}
        
        {/* Targeting Info */}
        {item.targetRole !== 'All' && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 inline-flex px-2 py-1 rounded">
            <Users size={12} /> Visible to: {item.targetRole} {item.targetBranch !== 'All' ? `(${item.targetBranch})` : ''}
          </div>
        )}
      </div>



      {/* Social Footer */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex gap-4">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400'}`}
          >
            <Heart size={18} className={isLiked ? 'fill-current' : ''} />
            {item.likes?.length || 0}
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-cmr-blue dark:hover:text-blue-400 transition-colors"
          >
            <MessageSquare size={18} />
            {item.comments?.length || 0}
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-slate-50 dark:bg-[#0b1120] p-5 border-t border-slate-100 dark:border-slate-800/80">
          
          {item.allowComments || isAdmin ? (
            <form onSubmit={handleComment} className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cmr-blue dark:text-white"
              />
              <button type="submit" disabled={!commentText.trim()} className="bg-cmr-blue text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors">
                <Send size={16} className="-ml-0.5" />
              </button>
            </form>
          ) : (
            <div className="text-center text-xs text-slate-400 mb-4 bg-slate-100 dark:bg-slate-800/50 py-2 rounded-lg">Comments are disabled for this post.</div>
          )}

          <div className="space-y-4">
            {item.comments?.map((comment) => (
              <div key={comment._id} className="flex gap-3 group">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                  {comment.user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="bg-white dark:bg-slate-800/60 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700/50 inline-block max-w-[90%]">
                    <div className="flex justify-between items-center gap-4 mb-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{comment.user.name}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{comment.text}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 ml-2">
                    <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    {(comment.user._id === user._id || isAdmin) && (
                      <button onClick={() => handleDeleteComment(comment._id)} className="text-[10px] text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default News;
