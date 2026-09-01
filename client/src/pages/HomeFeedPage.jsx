import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Filter, X } from 'lucide-react';
import { getStories } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StoryCard from '../components/StoryCard';
import CalendarWidget from '../components/CalendarWidget';
import EmptyState from '../components/EmptyState';
import StoryForm from '../components/StoryForm';
import toast from 'react-hot-toast';

const HomeFeedPage = () => {
  const { isGuest } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [showForm, setShowForm] = useState(searchParams.get('add') === 'true');
  const [showCalendar, setShowCalendar] = useState(false);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (dateRange?.start) params.startDate = dateRange.start.toISOString();
      if (dateRange?.end) params.endDate = dateRange.end.toISOString();
      const res = await getStories(params);
      setStories(res.data.stories);
    } catch {
      toast.error('Failed to load stories');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, dateRange]);

  useEffect(() => {
    const timer = setTimeout(fetchStories, 350);
    return () => clearTimeout(timer);
  }, [fetchStories]);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowForm(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleDateSelect = (range) => {
    setDateRange(range);
  };

  const clearDateFilter = () => {
    setDateRange(null);
  };

  const handleAddClick = () => {
    if (isGuest) { toast.error('Sign up to add stories!'); return; }
    setShowForm(true);
  };

  const handleStorySaved = (saved) => {
    setStories(prev => {
      const idx = prev.findIndex(s => s._id === saved._id);
      if (idx !== -1) { const copy = [...prev]; copy[idx] = saved; return copy; }
      return [saved, ...prev];
    });
  };

  const headingDates = dateRange?.start
    ? `${format(dateRange.start, 'MMM d, yyyy')}${dateRange.end ? ` – ${format(dateRange.end, 'MMM d, yyyy')}` : ''}`
    : null;

  return (
    <div className="min-h-screen font-sans bg-slate-50">
      <Navbar searchQuery={searchQuery} onSearch={setSearchQuery} onAddStory={handleAddClick} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4 pb-5 border-b border-slate-200/80">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-outfit">
              {headingDates ? `Travel Stories: ${headingDates}` : 'Explore Stories'}
            </h1>
            {dateRange?.start && (
              <button onClick={clearDateFilter}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold text-sky-700 bg-sky-100/90 border border-sky-200 hover:bg-sky-200 transition-colors shadow-2xs">
                <X size={13} /> Clear filter
              </button>
            )}
          </div>

          <button onClick={() => setShowCalendar(s => !s)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm transition-all border shadow-xs"
            style={showCalendar
              ? { background: 'linear-gradient(135deg, #0EA5E9, #0F3D5C)', color: 'white', borderColor: 'transparent' }
              : { background: 'white', color: '#0F172A', borderColor: '#E2E8F0' }}>
            <Filter size={15} />
            <span>{showCalendar ? 'Hide Calendar' : 'Filter by Date'}</span>
          </button>
        </div>

        {/* Mobile/Tablet Collapsible Calendar */}
        {showCalendar && (
          <div className="block lg:hidden mb-8 animate-fade-in">
            <div className="max-w-md mx-auto">
              <CalendarWidget onDateSelect={handleDateSelect} selectedRange={dateRange} />
            </div>
          </div>
        )}

        {/* Main Feed Container */}
        <div className="flex gap-8 items-start">
          {/* Story grid */}
          <div className="flex-1 w-full min-w-0">
            {loading ? (
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${showCalendar ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6 sm:gap-8 items-stretch`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-xs animate-pulse flex flex-col h-96 border border-slate-100">
                    <div className="h-48 bg-slate-200/80 w-full" />
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-5 bg-slate-200/80 rounded-lg w-3/4" />
                        <div className="h-3.5 bg-slate-100 rounded-md w-1/2" />
                      </div>
                      <div className="h-3.5 bg-slate-100 rounded-md w-full" />
                      <div className="h-4 bg-slate-200/60 rounded-lg w-2/3 pt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stories.length === 0 ? (
              <EmptyState onAdd={handleAddClick} isGuest={isGuest} />
            ) : (
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${showCalendar ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6 sm:gap-8 items-stretch`}>
                {stories.map(story => (
                  <StoryCard key={story._id} story={story} />
                ))}
              </div>
            )}
          </div>

          {/* Desktop Sticky Calendar */}
          {showCalendar && (
            <aside className="hidden lg:block w-80 shrink-0 sticky top-24">
              <CalendarWidget onDateSelect={handleDateSelect} selectedRange={dateRange} />
            </aside>
          )}
        </div>
      </main>

      {/* Story form modal */}
      {showForm && (
        <StoryForm
          onClose={() => { setShowForm(false); setSearchParams({}); }}
          onSaved={handleStorySaved}
        />
      )}
    </div>
  );
};

export default HomeFeedPage;



