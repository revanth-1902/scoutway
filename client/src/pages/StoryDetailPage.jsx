import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStory, deleteStory, likeStory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Calendar, Heart, Edit, Trash2, DollarSign, Navigation, ArrowRight } from 'lucide-react';
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

  const totalCost = story.activities
    ?.map(a => parseFloat(a.cost))
    .filter(n => !isNaN(n))
    .reduce((acc, n) => acc + n, 0);

  return (
    <div className="min-h-screen pb-20 font-sans bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
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
        <article className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
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

            {/* Activity Thread — Vertical Timeline */}
            {story.activities?.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-outfit">
                    🗓️ Activity Log
                  </h3>
                  {totalCost > 0 && (
                    <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs">
                      <DollarSign size={15} className="text-emerald-600" />
                      <span>Total Trip Cost: ${totalCost.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Vertical Timeline */}
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
                              <DollarSign size={13} />
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
          </div>
        </article>
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



