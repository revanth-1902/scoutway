import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Filter, X, MapPin, DollarSign, ArrowUpDown, Compass } from 'lucide-react';
import { getStories } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StoryCard from '../components/StoryCard';
import CalendarWidget from '../components/CalendarWidget';
import EmptyState from '../components/EmptyState';
import StoryForm from '../components/StoryForm';
import toast from 'react-hot-toast';

const getStoryTotalCost = (story) => {
  let totalCost = 0;
  const parseCost = (costStr) => {
    if (!costStr || costStr === '-') return 0;
    const num = Math.abs(parseFloat(String(costStr).replace(/[^0-9.]/g, '')));
    return isNaN(num) ? 0 : num;
  };

  if (story.daysItinerary?.length) {
    story.daysItinerary.forEach((day) => {
      day.activities?.forEach((act) => {
        totalCost += parseCost(act.cost);
      });
    });
  } else if (story.activities?.length) {
    story.activities.forEach((act) => {
      totalCost += parseCost(act.cost);
    });
  }
  return totalCost;
};

const POPULAR_PLACES = ['All', 'Vijayawada', 'Visakhapatnam', 'Araku Valley', 'Hyderabad', 'Goa', 'Mumbai', 'Bengaluru', 'Delhi', 'Ooty', 'Kochi'];

const HomeFeedPage = () => {
  const { isGuest } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [authorFilter, setAuthorFilter] = useState(null);
  const [showForm, setShowForm] = useState(searchParams.get('add') === 'true');
  const [showCalendar, setShowCalendar] = useState(false);

  // New filters: Place filter & Money Range sort option
  const [selectedPlace, setSelectedPlace] = useState('');
  const [sortOption, setSortOption] = useState('newest'); // 'newest' | 'cost-asc' | 'cost-desc' | 'likes-desc'

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

  const clearAuthorFilter = () => {
    setAuthorFilter(null);
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

  // Dynamic list of unique places extracted from stories + popular places
  const availablePlaces = useMemo(() => {
    const placesSet = new Set(POPULAR_PLACES.filter(p => p !== 'All'));
    stories.forEach(s => {
      if (s.place) placesSet.add(s.place);
      if (s.fromPlace) placesSet.add(s.fromPlace);
    });
    return Array.from(placesSet);
  }, [stories]);

  // Apply filters and sorting
  const displayedStories = useMemo(() => {
    let list = [...stories];

    if (authorFilter) {
      list = list.filter(s => s.userId?._id === authorFilter.userId || s.userId?.name?.toLowerCase() === authorFilter.name?.toLowerCase());
    }

    if (selectedPlace) {
      list = list.filter(s =>
        s.place?.toLowerCase().includes(selectedPlace.toLowerCase()) ||
        s.fromPlace?.toLowerCase().includes(selectedPlace.toLowerCase())
      );
    }

    if (sortOption === 'cost-asc') {
      list.sort((a, b) => getStoryTotalCost(a) - getStoryTotalCost(b));
    } else if (sortOption === 'cost-desc') {
      list.sort((a, b) => getStoryTotalCost(b) - getStoryTotalCost(a));
    } else if (sortOption === 'likes-desc') {
      list.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    } else if (sortOption === 'newest') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [stories, authorFilter, selectedPlace, sortOption]);

  const headingDates = dateRange?.start
    ? `${format(dateRange.start, 'MMM d, yyyy')}${dateRange.end ? ` – ${format(dateRange.end, 'MMM d, yyyy')}` : ''}`
    : null;

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900">
      <Navbar searchQuery={searchQuery} onSearch={setSearchQuery} onAddStory={handleAddClick} />

      {/* YouTube Style Top Horizontal Scroll Category/Filter Chips Bar */}
      <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-3 flex-wrap">
          {/* Horizontal Chips Scroll Container */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1 min-w-0">
            {/* "All" chip */}
            <button
              onClick={() => { setSelectedPlace(''); setSortOption('newest'); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                !selectedPlace && sortOption === 'newest'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              All Stories
            </button>

            {/* Money Range Chips */}
            <button
              onClick={() => setSortOption(s => s === 'cost-asc' ? 'newest' : 'cost-asc')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                sortOption === 'cost-asc'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
              }`}
            >
              <DollarSign size={13} />
              <span>Money: Low to High</span>
            </button>

            <button
              onClick={() => setSortOption(s => s === 'cost-desc' ? 'newest' : 'cost-desc')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                sortOption === 'cost-desc'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100'
              }`}
            >
              <DollarSign size={13} />
              <span>Money: High to Low</span>
            </button>

            <button
              onClick={() => setSortOption(s => s === 'likes-desc' ? 'newest' : 'likes-desc')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                sortOption === 'likes-desc'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100'
              }`}
            >
              Most Liked ❤️
            </button>

            {/* Place Chips */}
            {POPULAR_PLACES.filter(p => p !== 'All').map((placeName) => (
              <button
                key={placeName}
                onClick={() => setSelectedPlace(p => p === placeName ? '' : placeName)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1 ${
                  selectedPlace === placeName
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                <MapPin size={11} className={selectedPlace === placeName ? 'text-white' : 'text-sky-500'} />
                <span>{placeName}</span>
              </button>
            ))}
          </div>

          {/* Quick Filter Select Controls (Place Dropdown & Money Range Dropdown) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Filter by Place Select */}
            <div className="relative">
              <select
                value={selectedPlace}
                onChange={e => setSelectedPlace(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs font-extrabold bg-white border border-slate-200 text-slate-800 shadow-2xs hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Filter by Place (All)</option>
                {availablePlaces.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <MapPin size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none" />
            </div>

            {/* Money Range & Sort Select */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs font-extrabold bg-white border border-slate-200 text-slate-800 shadow-2xs hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="cost-asc">Money: Low to High 💰</option>
                <option value="cost-desc">Money: High to Low 💎</option>
                <option value="likes-desc">Sort: Most Liked ❤️</option>
              </select>
              <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Active Filter Badges Bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-outfit">
              {authorFilter
                ? `Stories by ${authorFilter.name}`
                : headingDates
                ? `Stories: ${headingDates}`
                : selectedPlace
                ? `Stories in ${selectedPlace}`
                : 'Explore Travel Stories'}
            </h1>

            {authorFilter && (
              <button onClick={clearAuthorFilter}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-2xs">
                <X size={13} /> Author: {authorFilter.name}
              </button>
            )}
            {selectedPlace && (
              <button onClick={() => setSelectedPlace('')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-2xs">
                <X size={13} /> Place: {selectedPlace}
              </button>
            )}
            {sortOption !== 'newest' && (
              <button onClick={() => setSortOption('newest')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors shadow-2xs">
                <X size={13} /> {sortOption === 'cost-asc' ? 'Money: Low to High' : sortOption === 'cost-desc' ? 'Money: High to Low' : 'Most Liked'}
              </button>
            )}
            {dateRange?.start && (
              <button onClick={clearDateFilter}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold text-sky-700 bg-sky-100/90 hover:bg-sky-200 transition-colors shadow-2xs">
                <X size={13} /> Clear date filter
              </button>
            )}
          </div>

          <button onClick={() => setShowCalendar(s => !s)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all border shadow-2xs"
            style={showCalendar
              ? { background: 'linear-gradient(135deg, #0EA5E9, #0F3D5C)', color: 'white', borderColor: 'transparent' }
              : { background: 'white', color: '#0F172A', borderColor: '#E2E8F0' }}>
            <Filter size={14} />
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
          {/* YouTube Video-Style Story Grid — 4 Side-by-Side Cards Columns */}
          <div className="flex-1 w-full min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-xs animate-pulse flex flex-col h-80 border border-slate-200">
                    <div className="h-44 bg-slate-200/80 w-full aspect-video" />
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-slate-200/80 rounded w-3/4" />
                          <div className="h-3 bg-slate-100 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedStories.length === 0 ? (
              <EmptyState onAdd={handleAddClick} isGuest={isGuest} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch">
                {displayedStories.map(story => (
                  <StoryCard
                    key={story._id}
                    story={story}
                    onLikeUpdate={(evtType, payload) => {
                      if (evtType === 'AUTHOR_FILTER') {
                        setAuthorFilter(payload);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>


          {/* Desktop Sticky Calendar */}
          {showCalendar && (
            <aside className="hidden lg:block w-80 shrink-0 sticky top-36">
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




