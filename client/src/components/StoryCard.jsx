import { useState } from 'react';
import { Heart, MapPin, Calendar, Navigation, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { likeStory } from '../services/api';
import toast from 'react-hot-toast';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&auto=format',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&auto=format',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format',
];

const StoryCard = ({ story, onLikeUpdate }) => {
  const { user, isGuest } = useAuth();
  const [likes, setLikes] = useState(story.likes?.length || 0);
  const [liked, setLiked] = useState(story.likes?.includes(user?._id));
  const [liking, setLiking] = useState(false);

  const coverImg = story.coverImage ||
    FALLBACK_IMAGES[story._id?.charCodeAt(0) % FALLBACK_IMAGES.length] ||
    FALLBACK_IMAGES[0];

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isGuest) { toast.error('Sign up to like stories!'); return; }
    if (liking) return;
    setLiking(true);
    try {
      const res = await likeStory(story._id);
      setLikes(res.data.likes);
      setLiked(res.data.liked);
      onLikeUpdate?.(story._id, res.data.likes);
    } catch {
      toast.error('Failed to like story');
    } finally {
      setLiking(false);
    }
  };

  // Calculate total trip cost
  let totalCost = 0;
  const parseCost = (costStr) => {
    if (!costStr || costStr === '-') return 0;
    const num = parseFloat(String(costStr).replace(/[^0-9.]/g, ''));
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

  const excerpt = story.description || '';

  const handleAuthorClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (story.userId?._id) {
      onLikeUpdate?.('AUTHOR_FILTER', { userId: story.userId._id, name: story.userId.name });
    }
  };

  return (
    <Link to={`/story/${story._id}`} className="block h-full group">
      <article className="story-card">
        {/* Cover Image Container — 16:10 aspect ratio */}
        <div className="relative overflow-hidden bg-slate-100 shrink-0 w-full" style={{ aspectRatio: '16/10' }}>
          <img
            src={coverImg}
            alt={story.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e) => { e.target.src = FALLBACK_IMAGES[0]; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-90" />

          {/* Like button overlay */}
          <button
            onClick={handleLike}
            className={`absolute top-3.5 right-3.5 p-2.5 rounded-full shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 flex items-center justify-center
              ${liked ? 'bg-red-500/90 border border-red-400 text-white shadow-red-500/20' : 'bg-white/85 text-slate-500 border border-white/60 hover:bg-white hover:text-slate-700'}
            `}
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart
              size={16}
              className={`transition-all ${liked ? 'fill-white text-white heart-liked' : ''}`}
            />
          </button>

          {/* Author Glass Badge (Clickable to view all stories by user) */}
          {story.userId?.name && (
            <div
              onClick={handleAuthorClick}
              className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 hover:bg-sky-600 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-xs max-w-[75%] truncate cursor-pointer transition-colors"
              title={`View all stories by ${story.userId.name}`}
            >
              <span className="truncate">by {story.userId.name}</span>
            </div>
          )}

          {/* Total Trip Cost Badge */}
          {totalCost > 0 && (
            <div className="absolute bottom-3.5 right-3.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-900/85 backdrop-blur-md text-emerald-300 text-xs font-extrabold border border-emerald-400/30 shadow-xs">
              <span>₹{totalCost.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        {/* Card Body — Flex Column */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 bg-white justify-between">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mb-1.5 line-clamp-1 truncate text-ellipsis overflow-hidden group-hover:text-sky-600 transition-colors font-outfit" title={story.title}>
              {story.title}
            </h3>

            {/* Trip Date Tag */}
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2.5">
              <Calendar size={13} className="shrink-0 text-sky-500" />
              <span className="truncate">
                {story.tripStartDate ? format(new Date(story.tripStartDate), 'MMM d, yyyy') : ''}
                {story.tripEndDate && story.tripEndDate !== story.tripStartDate
                  ? ` – ${format(new Date(story.tripEndDate), 'MMM d, yyyy')}`
                  : ''}
              </span>
            </div>

            {/* Narrative Excerpt with Ellipsis */}
            <p className="text-xs sm:text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed font-normal overflow-hidden text-ellipsis">
              {excerpt}
            </p>
          </div>

          {/* Card Footer — Route Pill + Likes Badge */}
          <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 mt-auto gap-2">
            {/* Route: From → Destination */}
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 min-w-0 max-w-[78%]">
              {story.fromPlace ? (
                <>
                  <Navigation size={12} className="shrink-0 text-sky-600" />
                  <span className="truncate max-w-[42%] text-ellipsis">{story.fromPlace}</span>
                  <ArrowRight size={10} className="shrink-0 text-sky-400" />
                  <MapPin size={12} className="shrink-0 text-sky-600" />
                  <span className="truncate max-w-[42%] text-ellipsis">{story.place}</span>
                </>
              ) : (
                <>
                  <MapPin size={12} className="shrink-0 text-sky-600" />
                  <span className="truncate text-ellipsis">{story.place}</span>
                </>
              )}
            </div>

            {/* Likes Count Span Badge */}
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-600 bg-slate-100/90 px-2.5 py-1 rounded-full shrink-0 border border-slate-200/60">
              <Heart size={12} className={liked ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
              <span>{likes}</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default StoryCard;




