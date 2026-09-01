import { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Trash2, MapPin, Calendar, FileText, Image as ImageIcon, Navigation, DollarSign, Users, Clock } from 'lucide-react';
import { createStory, updateStory, uploadStoryImage } from '../services/api';
import toast from 'react-hot-toast';

const StoryForm = ({ story, onClose, onSaved }) => {
  const isEdit = !!story;
  const fileRef = useRef();

  const [form, setForm] = useState({
    title: story?.title || '',
    fromPlace: story?.fromPlace || '',
    place: story?.place || '',
    tripStartDate: story?.tripStartDate?.slice(0, 10) || '',
    tripEndDate: story?.tripEndDate?.slice(0, 10) || '',
    numberOfPersons: story?.numberOfPersons || 1,
    description: story?.description || '',
    activities: story?.activities?.length ? story.activities : [{ activityName: '', cost: '-' }],
    daysItinerary: story?.daysItinerary?.length
      ? story.daysItinerary
      : [{ dayNumber: 1, dayTitle: 'Day 1', activities: [{ activityName: '', cost: '-', time: '' }] }],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(story?.coverImage || '');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeDayTab, setActiveDayTab] = useState(0);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Sync days count when dates change
  useEffect(() => {
    if (form.tripStartDate && form.tripEndDate) {
      const s = new Date(form.tripStartDate);
      const e = new Date(form.tripEndDate);
      if (!isNaN(s) && !isNaN(e) && e >= s) {
        const totalDays = Math.max(1, Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1);
        setForm(f => {
          if (f.daysItinerary.length === totalDays) return f;
          const updatedDays = [];
          for (let i = 1; i <= totalDays; i++) {
            const existing = f.daysItinerary[i - 1];
            updatedDays.push(
              existing || {
                dayNumber: i,
                dayTitle: `Day ${i}`,
                activities: [{ activityName: '', cost: '-', time: '' }],
              }
            );
          }
          return { ...f, daysItinerary: updatedDays };
        });
      }
    }
  }, [form.tripStartDate, form.tripEndDate]);

  // Day itinerary handlers
  const setDayTitle = (dayIdx, title) => {
    const days = [...form.daysItinerary];
    days[dayIdx] = { ...days[dayIdx], dayTitle: title };
    setForm(f => ({ ...f, daysItinerary: days }));
  };

  const addDayActivity = (dayIdx) => {
    const days = [...form.daysItinerary];
    const currentActivities = days[dayIdx]?.activities || [];
    days[dayIdx] = {
      ...days[dayIdx],
      activities: [...currentActivities, { activityName: '', cost: '-', time: '' }],
    };
    setForm(f => ({ ...f, daysItinerary: days }));
  };

  const setDayActivity = (dayIdx, actIdx, key, val) => {
    const days = [...form.daysItinerary];
    const acts = [...days[dayIdx].activities];
    acts[actIdx] = { ...acts[actIdx], [key]: val };
    days[dayIdx] = { ...days[dayIdx], activities: acts };
    setForm(f => ({ ...f, daysItinerary: days }));
  };

  const removeDayActivity = (dayIdx, actIdx) => {
    const days = [...form.daysItinerary];
    const acts = days[dayIdx].activities.filter((_, idx) => idx !== actIdx);
    days[dayIdx] = { ...days[dayIdx], activities: acts.length ? acts : [{ activityName: '', cost: '-', time: '' }] };
    setForm(f => ({ ...f, daysItinerary: days }));
  };

  const addExtraDay = () => {
    setForm(f => {
      const nextNum = f.daysItinerary.length + 1;
      return {
        ...f,
        daysItinerary: [
          ...f.daysItinerary,
          { dayNumber: nextNum, dayTitle: `Day ${nextNum}`, activities: [{ activityName: '', cost: '-', time: '' }] },
        ],
      };
    });
    setActiveDayTab(form.daysItinerary.length);
  };

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

    // Flatten all day activities into flat activities list for backward compatibility
    const flatActivities = [];
    form.daysItinerary.forEach((day) => {
      day.activities.forEach((act) => {
        if (act.activityName?.trim()) {
          flatActivities.push({ activityName: act.activityName, cost: act.cost || '-', time: act.time || '' });
        }
      });
    });

    const payload = {
      ...form,
      numberOfPersons: parseInt(form.numberOfPersons, 10) || 1,
      activities: flatActivities.length ? flatActivities : form.activities,
    };

    try {
      let saved;
      if (isEdit) {
        const res = await updateStory(story._id, payload);
        saved = res.data.story;
      } else {
        const res = await createStory(payload);
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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col animate-scale-in overflow-hidden border border-slate-200/90 font-sans"
        style={{ boxShadow: '0 32px 64px rgba(15,61,92,0.25)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-white/95 backdrop-blur-sm z-10 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold font-outfit text-slate-900">
              {isEdit ? '✏️ Edit Travel Story & Itinerary' : '✈️ Add New Travel Story'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Define your route, dates, day-by-day thread, and costs</p>
          </div>
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
              placeholder="e.g. 3 Days Roadtrip Across California" className="input-field" required />
          </div>

          {/* From → Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="form-group">
              <label htmlFor="story-from">
                <Navigation size={14} className="text-sky-500 shrink-0" />
                <span>From (Origin)</span>
              </label>
              <input id="story-from" value={form.fromPlace} onChange={e => set('fromPlace', e.target.value)}
                placeholder="e.g. Los Angeles, CA" className="input-field" />
            </div>
            <div className="form-group">
              <label htmlFor="story-dest">
                <MapPin size={14} className="text-sky-500 shrink-0" />
                <span>Destination *</span>
              </label>
              <input id="story-dest" value={form.place} onChange={e => set('place', e.target.value)}
                placeholder="e.g. San Francisco, CA" className="input-field" required />
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

          {/* Dates & Travelers Count */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
            <div className="form-group">
              <label htmlFor="story-persons">
                <Users size={14} className="text-sky-500 shrink-0" />
                <span>Travelers / Persons *</span>
              </label>
              <input id="story-persons" type="number" min="1" max="99" value={form.numberOfPersons}
                onChange={e => set('numberOfPersons', e.target.value)}
                className="input-field" required />
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
                  <img src={imagePreview} alt="Preview" className="preview-img" />
                  <div className="absolute bottom-2 right-2 px-3 py-1 rounded-lg text-xs font-bold text-white bg-slate-900/70 backdrop-blur-sm border border-white/20">
                    Click to change cover image
                  </div>
                </div>
              ) : (
                <div className="py-8 sm:py-10 text-center px-4 flex flex-col items-center justify-center">
                  <Upload size={30} className="text-slate-300 mb-2" />
                  <p className="text-xs sm:text-sm font-bold text-slate-700 mb-1">Drag & drop or click to upload cover photo</p>
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
              <span>Story Narrative / Overview *</span>
            </label>
            <textarea id="story-desc" value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe your trip highlights, overall experience, travel tips..."
              rows={4} className="input-field resize-none" required />
          </div>

          {/* Dynamic Day-by-Day Itinerary Threads */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-outfit">
                  🗓️ Day-by-Day Itinerary Threads ({form.daysItinerary.length} {form.daysItinerary.length === 1 ? 'Day' : 'Days'})
                </h3>
                <p className="text-xs text-slate-500">Organize activities thread per day</p>
              </div>
              <button type="button" onClick={addExtraDay}
                className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors">
                <Plus size={13} /> <span>+ Add Another Day</span>
              </button>
            </div>

            {/* Day Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3">
              {form.daysItinerary.map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveDayTab(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                    activeDayTab === idx
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  Day {day.dayNumber || idx + 1}
                </button>
              ))}
            </div>

            {/* Selected Day Activities List */}
            {form.daysItinerary[activeDayTab] && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                    D{activeDayTab + 1}
                  </span>
                  <input
                    value={form.daysItinerary[activeDayTab].dayTitle || ''}
                    onChange={(e) => setDayTitle(activeDayTab, e.target.value)}
                    placeholder={`Day ${activeDayTab + 1} Title (e.g. Arrival & Beach Walk)`}
                    className="input-field text-xs font-bold py-1.5 flex-1"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  {form.daysItinerary[activeDayTab].activities.map((act, actIdx) => (
                    <div key={actIdx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="flex-1">
                        <input
                          value={act.activityName}
                          onChange={(e) => setDayActivity(activeDayTab, actIdx, 'activityName', e.target.value)}
                          placeholder="Activity description (e.g. Visit Museum)"
                          className="input-field text-xs py-1.5"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative w-28">
                          <Clock size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            value={act.time || ''}
                            onChange={(e) => setDayActivity(activeDayTab, actIdx, 'time', e.target.value)}
                            placeholder="Time (e.g. 10:00 AM)"
                            className="input-field text-xs py-1.5 pl-7"
                          />
                        </div>
                        <div className="relative w-24">
                          <DollarSign size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            value={act.cost}
                            onChange={(e) => setDayActivity(activeDayTab, actIdx, 'cost', e.target.value)}
                            placeholder="Cost"
                            className="input-field text-xs py-1.5 pl-7"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDayActivity(activeDayTab, actIdx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove activity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addDayActivity(activeDayTab)}
                  className="w-full py-2 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus size={13} /> <span>Add Activity to Day {activeDayTab + 1}</span>
                </button>
              </div>
            )}
          </div>

          {/* Sticky Submit Footer */}
          <div className="flex gap-3 pt-3 border-t border-slate-100 sticky bottom-0 bg-white z-10">
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



