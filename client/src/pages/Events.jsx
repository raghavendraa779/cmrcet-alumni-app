import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getEvents, createEvent, deleteEvent, toggleRSVP } from '../store/eventSlice';
import { Calendar as CalendarIcon, MapPin, Users, Trash2, Plus, Clock, FileText, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const Events = () => {
  const dispatch = useDispatch();
  const { events, isLoading } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  const [filter, setFilter] = useState('Upcoming'); // 'Upcoming', 'Past', 'All'
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '', type: 'Webinar', date: '', location: '', description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(getEvents());
  }, [dispatch]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.location || !formData.description) {
      return toast.error('Please fill in all required fields.');
    }

    let imageUrl = '';
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
        const data = await res.text();
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

    dispatch(createEvent({ ...formData, imageUrl }));
    toast.success('Event created successfully!');
    setFormData({ title: '', type: 'Webinar', date: '', location: '', description: '' });
    setImageFile(null);
    setUploading(false);
    setShowForm(false);
  };

  const today = new Date();
  
  const validEvents = Array.isArray(events) ? events : (events?.data || events?.events || []);
  const filteredEvents = validEvents.filter(evt => {
    const eventDate = new Date(evt.date);
    if (filter === 'Upcoming') return eventDate >= today;
    if (filter === 'Past') return eventDate < today;
    return true; // 'All'
  });

  const canCreateEvent = user.role === 'Admin' || user.role === 'Alumni' || user.role === 'Faculty';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-2">
            <CalendarIcon className="text-cmr-blue dark:text-blue-400" size={32} />
            Events & Meetups
          </h1>
          <p className="text-slate-500 dark:text-slate-400">RSVP to workshops, webinars, and alumni reunions.</p>
        </div>
        
        {canCreateEvent && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-cmr-blue text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} /> Host an Event
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-8">
        {['Upcoming', 'Past', 'All'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${
              filter === tab 
              ? 'border-cmr-blue text-cmr-blue dark:border-blue-400 dark:text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {tab} Events
          </button>
        ))}
      </div>

      {/* Host Event Form */}
      {showForm && (
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm mb-8 animate-fade-in">
          <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
            <CalendarIcon size={20} className="text-cmr-orange dark:text-amber-400"/> Host a New Event
          </h2>
          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Event Title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-cmr-blue outline-none" />
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-cmr-blue outline-none">
                <option value="Webinar">Webinar (Online)</option>
                <option value="Meetup">Meetup</option>
                <option value="Workshop">Workshop</option>
                <option value="Reunion">Reunion</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="datetime-local" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-cmr-blue outline-none" />
              <input type="text" placeholder="Location (Room No. or Zoom Link)" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-cmr-blue outline-none" />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl dark:bg-slate-900">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <ImageIcon size={18} />
                <span className="text-sm font-medium whitespace-nowrap">Event Banner:</span>
              </div>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm dark:text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-cmr-blue hover:file:bg-blue-100 dark:file:bg-blue-500/10 dark:file:text-blue-400 cursor-pointer" />
            </div>
            
            <textarea placeholder="Event Details (Markdown supported)" required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-cmr-blue outline-none" />
            
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
              <button type="submit" disabled={uploading} className="bg-cmr-blue text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors">{uploading ? 'Creating...' : 'Create Event'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-10 text-center text-slate-500">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-[#111827] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <CalendarIcon className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No {filter.toLowerCase()} events found.</p>
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <EventCard key={evt._id} event={evt} user={user} dispatch={dispatch} />
          ))
        )}
      </div>
    </div>
  );
};

const EventCard = ({ event, user, dispatch }) => {
  const dateObj = new Date(event.date);
  const isPast = dateObj < new Date();
  const isAttending = event.attendees.some(a => a._id === user._id);
  const isOrganizer = event.organizer._id === user._id;
  const isAdmin = user.role === 'Admin';

  const handleDelete = () => {
    if(window.confirm('Cancel and delete this event?')) {
      dispatch(deleteEvent(event._id));
    }
  };

  return (
    <div className={`bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden flex flex-col transition-all ${isPast ? 'opacity-75 grayscale-[0.3]' : 'hover:shadow-md'}`}>
      
      {/* Banner */}
      {event.imageUrl ? (
        <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
          <img src={event.imageUrl} alt="Event Banner" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg text-center shadow-lg border border-white/20">
            <span className="block text-xs font-bold text-red-500 uppercase">{dateObj.toLocaleString('default', { month: 'short' })}</span>
            <span className="block text-2xl font-black text-slate-900 dark:text-white leading-none">{dateObj.getDate()}</span>
          </div>
        </div>
      ) : (
        <div className="h-24 w-full bg-gradient-to-r from-cmr-blue to-blue-800 relative">
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg text-center shadow-lg border border-white/20">
            <span className="block text-xs font-bold text-red-500 uppercase">{dateObj.toLocaleString('default', { month: 'short' })}</span>
            <span className="block text-xl font-black text-slate-900 dark:text-white leading-none">{dateObj.getDate()}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-2 ${
              event.type === 'Webinar' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
              event.type === 'Meetup' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
              'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
            }`}>
              {event.type}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight">
              {event.title}
            </h2>
          </div>
          {(isOrganizer || isAdmin) && (
            <button onClick={handleDelete} className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors" title="Delete Event">
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <div className="space-y-2 mt-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            <span>{dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-slate-400" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none prose-slate prose-a:text-cmr-blue line-clamp-3 mb-6">
          <ReactMarkdown>{event.description}</ReactMarkdown>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Users size={16} />
            <span><strong className="text-slate-800 dark:text-slate-200">{event.attendees.length}</strong> attending</span>
          </div>
          
          <button 
            onClick={() => dispatch(toggleRSVP(event._id))}
            disabled={isPast}
            className={`px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${
              isPast ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed' :
              isAttending ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
              'bg-cmr-blue text-white hover:bg-blue-700 shadow-md'
            }`}
          >
            {isPast ? 'Ended' : isAttending ? '✓ Attending' : 'RSVP Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Events;
