import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStory, deleteStory, likeStory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Calendar, Heart, Edit, Trash2, DollarSign, Navigation, ArrowRight, Users, Clock, Compass } from 'lucide-react';
import StoryForm from '../components/StoryForm';
import toast from 'react-hot-toast';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&auto=format',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&auto=format',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&auto=format',
];

const StoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getStory(id);
        const s = res.data.story;
        setStory(s);
        setLikeCount(s.likes?.length || 0);
        setLiked(s.likes?.some(l => l === user?._id || l?._id === user?._id));
      } catch {
        toast.error('Story not found');
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleLike = async () => {
    if (isGuest) { toast.error('Sign up to like stories!'); return; }
    try {
      const res = await likeStory(id);
      setLiked(res.data.liked);
      setLikeCount(res.data.likes);
    } catch {
      toast.error('Failed to like story');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this story? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteStory(id);
      toast.success('Story deleted');
      navigate('/home');
    } catch {
      toast.error('Failed to delete story');
    } finally {
      setDeleting(false);
    }
  };

  const isAuthor = user?._id === (story?.userId?._id || story?.userId);
  const coverImg = story?.coverImage || FALLBACK_IMAGES[id?.charCodeAt(0) % FALLBACK_IMAGES.length] || FALLBACK_IMAGES[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
          <div className="h-8 bg-slate-200/80 rounded-xl w-1/3" />
          <div className="h-72 sm:h-84 bg-slate-200/80 rounded-3xl" />
          <div className="h-6 bg-slate-200/80 rounded-xl w-2/3" />
          <div className="h-4 bg-slate-100 rounded-lg w-full" />
          <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
        </div>
      </div>
    );
  }

  if (!story) return null;

  // Calculate total cost from flat activities or daysItinerary
  let totalCost = 0;
  if (story.daysItinerary?.length) {
    story.daysItinerary.forEach(d => {
      d.activities?.forEach(a => {
        const val = parseFloat(a.cost);
        if (!isNaN(val)) totalCost += val;
      });
    });
  } else if (story.activities?.length) {
    story.activities.forEach(a => {
      const val = parseFloat(a.cost);
      if (!isNaN(val)) totalCost += val;
    });
  }

  const mapSearchQuery = story.fromPlace ? `${story.fromPlace} to ${story.place}` : story.place;

  return (
    <div className="min-h-screen pb-20 font-sans bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
        {/* Back + author actions */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <button onClick={() => navigate(-1)}
            className="btn-secondary text-xs sm:text-sm py-2 px-4 font-extrabold shadow-xs inline-flex items-center gap-2">
            <ArrowLeft size={16} /> <span>Back to feed</span>
          </button>
          {isAuthor && (
            <div className="flex gap-2.5">
              <button onClick={() => setShowEdit(true)}
                className="btn-secondary text-xs sm:text-sm py-2 px-4 font-extrabold border-sky-200 text-sky-700 hover:bg-sky-50 shadow-xs inline-flex items-center gap-1.5">
                <Edit size={15} /> <span>Update</span>
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="btn-danger text-xs sm:text-sm py-2 px-4 shadow-sm inline-flex items-center gap-1.5">
                <Trash2 size={15} />
                <span>{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Story Container */}
        <article className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden mb-8">
          {/* Cover image — 16:9 aspect ratio */}
          <div className="relative overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
            <img src={coverImg} alt={story.title}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = FALLBACK_IMAGES[0]; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

            {/* Like button overlay */}
            <button onClick={handleLike}
              className={`absolute top-4 right-4 inline-flex items-center gap-2 px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm shadow-lg backdrop-blur-md transition-all hover:scale-105
                ${liked ? 'bg-red-500 text-white border border-red-400' : 'bg-white/85 text-slate-800 border border-white/60 hover:bg-white'}`}>
              <Heart size={16} className={liked ? 'fill-white' : 'text-slate-500'} />
              <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
            </button>
          </div>

          <div className="p-6 sm:p-10">
            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold mb-5 leading-tight text-slate-900 tracking-tight font-outfit">
              {story.title}
            </h1>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              {/* Date Badge */}
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-700 font-bold bg-slate-100/90 px-3.5 py-1.5 rounded-full border border-slate-200/80">
                <Calendar size={14} className="shrink-0 text-sky-500" />
                <span>
                  {format(new Date(story.tripStartDate), 'MMM d, yyyy')}
                  {story.tripEndDate ? ` – ${format(new Date(story.tripEndDate), 'MMM d, yyyy')}` : ''}
                </span>
              </div>

              {/* Travelers Badge */}
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-700 font-bold bg-slate-100/90 px-3.5 py-1.5 rounded-full border border-slate-200/80">
                <Users size={14} className="shrink-0 text-indigo-500" />
                <span>{story.numberOfPersons || 1} {story.numberOfPersons === 1 ? 'Traveler' : 'Travelers'}</span>
              </div>

              {/* Route: From → Destination */}
              {story.fromPlace ? (
                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700">
                  <Navigation size={13} className="shrink-0 text-sky-600" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">{story.fromPlace}</span>
                  <ArrowRight size={11} className="text-sky-400 shrink-0" />
                  <MapPin size={13} className="shrink-0 text-sky-600" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">{story.place}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700">
                  <MapPin size={14} className="shrink-0 text-sky-600" />
                  <span>{story.place}</span>
                </div>
              )}

              {/* Author Badge */}
              {story.userId?.name && (
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-bold bg-slate-100/90 px-3 py-1.5 rounded-full border border-slate-200/80">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-2xs">
                    {story.userId.name[0]?.toUpperCase()}
                  </div>
                  <span>by {story.userId.name}</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px mb-8 bg-slate-100" />

            {/* Story text */}
            <div className="prose max-w-none text-slate-700 leading-relaxed text-base sm:text-lg whitespace-pre-wrap mb-10 font-normal">
              {story.description}
            </div>

            {/* Total Trip Cost Summary */}
            {totalCost > 0 && (
              <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm font-extrabold text-emerald-900 font-outfit">Estimated Trip Budget</span>
                <span className="inline-flex items-center gap-1 text-sm font-extrabold text-emerald-800 bg-white px-4 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-emerald-600 font-bold">₹</span>
                  <span>{totalCost.toLocaleString('en-IN')} INR</span>
                </span>
              </div>
            )}

            {/* Day-by-Day Itinerary Threads */}
            {story.daysItinerary?.length > 0 ? (
              <div className="pt-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-outfit mb-6">
                  🗓️ Day-by-Day Itinerary Threads
                </h3>
                <div className="space-y-6">
                  {story.daysItinerary.map((day, dayIdx) => (
                    <div key={dayIdx} className="bg-slate-50/80 rounded-2xl p-4 sm:p-6 border border-slate-200/80">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0">
                          D{day.dayNumber || dayIdx + 1}
                        </span>
                        <h4 className="text-base sm:text-lg font-extrabold text-slate-900 font-outfit">
                          {day.dayTitle || `Day ${dayIdx + 1}`}
                        </h4>
                      </div>

                      <div className="space-y-2.5 pl-2 sm:pl-3 border-l-2 border-sky-200">
                        {day.activities?.map((act, actIdx) => (
                          <div key={actIdx} className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <Compass size={16} className="text-sky-500 shrink-0" />
                              <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">{act.activityName}</span>
                              {act.time && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  <Clock size={11} /> {act.time}
                                </span>
                              )}
                            </div>
                            <span className={`cost-badge shrink-0 ${act.cost === '-' ? 'no-cost' : 'has-cost'}`}>
                              {act.cost === '-' ? '—' : (
                                <>
                                  <span className="font-extrabold text-xs">₹</span>
                                  <span>{act.cost}</span>
                                </>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : story.activities?.length > 0 && (
              <div className="pt-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-outfit mb-6">
                  🗓️ Activity Log
                </h3>
                <div className="activity-timeline">
                  {story.activities.map((act, i) => (
                    <div key={i} className="timeline-item">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-extrabold text-white shrink-0 bg-gradient-to-tr from-sky-500 via-sky-600 to-indigo-600 shadow-xs">
                            {i + 1}
                          </span>
                          <span className="text-xs sm:text-base font-bold text-slate-800 truncate">{act.activityName}</span>
                        </div>
                        <span className={`cost-badge shrink-0 ${act.cost === '-' ? 'no-cost' : 'has-cost'}`}>
                          {act.cost === '-' ? '—' : (
                            <>
                              <span className="font-extrabold text-xs">₹</span>
                              <span>{act.cost}</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trip Photo Gallery (Up to 6 Photos) */}
            {story.imageGallery?.length > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-100">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-outfit mb-4 flex items-center gap-2">
                  <span>📸 Trip Photo Gallery ({story.imageGallery.length} {story.imageGallery.length === 1 ? 'Photo' : 'Photos'})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {story.imageGallery.map((photo, pIdx) => (
                    <div key={pIdx} className="group relative aspect-4/3 rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs bg-slate-100">
                      <img
                        src={photo}
                        alt={`Gallery ${pIdx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                        <span className="text-[11px] font-extrabold text-white">Photo {pIdx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Free Google Maps Directions Embed Container */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm overflow-hidden mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg sm:text-xl font-extrabold font-outfit text-slate-900 flex items-center gap-2">
              <MapPin size={20} className="text-sky-500" />
              <span>Interactive Route Map & Directions</span>
            </h3>
            <span className="text-xs font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
              Free Google Maps Route
            </span>
          </div>

          <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-100 shadow-inner">
            <iframe
              title="Route Map Directions"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mapSearchQuery)}&output=embed`}
            ></iframe>
          </div>
        </div>

      </div>

      {/* Edit modal */}
      {showEdit && (
        <StoryForm
          story={story}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => setStory(updated)}
        />
      )}
    </div>
  );
};

export default StoryDetailPage;




