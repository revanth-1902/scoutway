import { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Minus, MapPin, Calendar, FileText, Image as ImageIcon, Navigation, DollarSign } from 'lucide-react';
import { createStory, updateStory, uploadStoryImage } from '../services/api';
import toast from 'react-hot-toast';

const EMPTY_ACTIVITY = { activityName: '', cost: '-' };

const StoryForm = ({ story, onClose, onSaved }) => {
  const isEdit = !!story;
  const fileRef = useRef();

  const [form, setForm] = useState({
    title: story?.title || '',
    fromPlace: story?.fromPlace || '',
    place: story?.place || '',
    tripStartDate: story?.tripStartDate?.slice(0, 10) || '',
    tripEndDate: story?.tripEndDate?.slice(0, 10) || '',
    description: story?.description || '',
    activities: story?.activities?.length ? story.activities : [{ ...EMPTY_ACTIVITY }],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(story?.coverImage || '');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const setActivity = (i, key, val) => {
    const acts = [...form.activities];
    acts[i] = { ...acts[i], [key]: val };
    setForm(f => ({ ...f, activities: acts }));
  };

  const addActivity = () => setForm(f => ({ ...f, activities: [...f.activities, { ...EMPTY_ACTIVITY }] }));
  const removeActivity = (i) => setForm(f => ({ ...f, activities: f.activities.filter((_, idx) => idx !== i) }));

  const handleImageChange = (file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.place || !form.tripStartDate || !form.tripEndDate || !form.description) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      let saved;
      if (isEdit) {
        const res = await updateStory(story._id, form);
        saved = res.data.story;
      } else {
        const res = await createStory(form);
        saved = res.data.story;
      }

      // Upload image if selected
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        try {
          const imgRes = await uploadStoryImage(saved._id, fd);
          saved.coverImage = imgRes.data.coverImage;
        } catch {
          toast('Story saved, but image upload failed. Check Cloudinary config.', { icon: '⚠️' });
        }
      }

      toast.success(isEdit ? 'Story updated!' : 'Story created!');
      onSaved?.(saved);
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save story');
    } finally {
      setLoading(false);
    }
  };

  // Trap scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in overflow-hidden border border-slate-200/90 font-sans"
        style={{ boxShadow: '0 32px 64px rgba(15,61,92,0.25)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-white/95 backdrop-blur-sm z-10 shrink-0">
          <h2 className="text-lg sm:text-xl font-extrabold font-outfit text-slate-900">
            {isEdit ? '✏️ Update Story' : '✈️ Add New Story'}
          </h2>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 flex items-center justify-center"
            title="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="story-title">
              <FileText size={14} className="text-sky-500 shrink-0" />
              <span>Story Title *</span>
            </label>
            <input id="story-title" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. A Day at the Great Wall" className="input-field" required />
          </div>

          {/* From → Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="form-group">
              <label htmlFor="story-from">
                <Navigation size={14} className="text-sky-500 shrink-0" />
                <span>From (Origin)</span>
              </label>
              <input id="story-from" value={form.fromPlace} onChange={e => set('fromPlace', e.target.value)}
                placeholder="e.g. Mumbai, India" className="input-field" />
            </div>
            <div className="form-group">
              <label htmlFor="story-dest">
                <MapPin size={14} className="text-sky-500 shrink-0" />
                <span>Destination *</span>
              </label>
              <input id="story-dest" value={form.place} onChange={e => set('place', e.target.value)}
                placeholder="e.g. Great Wall of China, Beijing" className="input-field" required />
            </div>
          </div>

          {/* Route Preview Badge Span */}
          {(form.fromPlace && form.place) && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-sky-50 border border-sky-200/80 text-sky-800 shadow-2xs w-full">
              <MapPin size={15} className="shrink-0 text-sky-600" />
              <span className="truncate max-w-[40%]">{form.fromPlace}</span>
              <span className="text-sky-400 font-bold">→</span>
              <span className="truncate max-w-[40%]">{form.place}</span>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="form-group">
              <label htmlFor="story-start-date">
                <Calendar size={14} className="text-sky-500 shrink-0" />
                <span>From Date *</span>
              </label>
              <input id="story-start-date" type="date" value={form.tripStartDate}
                onChange={e => set('tripStartDate', e.target.value)}
                className="input-field" required />
            </div>
            <div className="form-group">
              <label htmlFor="story-end-date">
                <Calendar size={14} className="text-sky-500 shrink-0" />
                <span>To Date *</span>
              </label>
              <input id="story-end-date" type="date" value={form.tripEndDate}
                onChange={e => set('tripEndDate', e.target.value)}
                min={form.tripStartDate} className="input-field" required />
            </div>
          </div>

          {/* Cover image */}
          <div className="form-group">
            <label>
              <ImageIcon size={14} className="text-sky-500 shrink-0" />
              <span>Cover Image</span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview"
                    className="preview-img" />
                  <div className="absolute bottom-2 right-2 px-3 py-1 rounded-lg text-xs font-bold text-white bg-slate-900/70 backdrop-blur-sm border border-white/20">
                    Click to change
                  </div>
                </div>
              ) : (
                <div className="py-8 sm:py-10 text-center px-4 flex flex-col items-center justify-center">
                  <Upload size={30} className="text-slate-300 mb-2" />
                  <p className="text-xs sm:text-sm font-bold text-slate-700 mb-1">Drag & drop or click to upload</p>
                  <p className="text-xs text-slate-400">JPG, PNG, WebP — Recommended 16:9 aspect ratio</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" hidden
                onChange={e => handleImageChange(e.target.files[0])} />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="story-desc">
              <FileText size={14} className="text-sky-500 shrink-0" />
              <span>Story / Narrative *</span>
            </label>
            <textarea id="story-desc" value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe your trip experience in detail..."
              rows={4} className="input-field resize-none" required />
          </div>

          {/* Activity Thread */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs sm:text-sm font-extrabold text-slate-800">
                🗓️ Activity Thread
              </label>
              <button type="button" onClick={addActivity}
                className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100">
                <Plus size={13} /> <span>Add Activity</span>
              </button>
            </div>

            <div className="activity-timeline">
              {form.activities.map((act, i) => (
                <div key={i} className="timeline-item">
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center">
                    {/* Activity name */}
                    <div className="flex-1">
                      <input value={act.activityName}
                        onChange={e => setActivity(i, 'activityName', e.target.value)}
                        placeholder="Activity / place description"
                        className="input-field text-xs sm:text-sm py-2" />
                    </div>
                    {/* Cost field */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 sm:w-32">
                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={act.cost}
                          onChange={e => setActivity(i, 'cost', e.target.value)}
                          placeholder="Cost"
                          className="input-field text-xs sm:text-sm py-2 pl-8" />
                      </div>
                      {form.activities.length > 1 && (
                        <button type="button" onClick={() => removeActivity(i)}
                          className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all shrink-0 flex items-center justify-center"
                          title="Remove activity">
                          <Minus size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sticky Submit Footer */}
          <div className="flex gap-3 pt-3 border-t border-slate-100 sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </span>
              ) : (isEdit ? 'Update Story' : 'Add Story')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoryForm;


