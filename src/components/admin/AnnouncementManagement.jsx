// src/components/admin/AnnouncementManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  MegaphoneIcon, PlusIcon, PencilIcon, TrashIcon,
  CheckCircleIcon, XCircleIcon, EyeIcon, ArrowPathIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { IMAGE_BASE_URL } from '../../config';

const TYPES     = ['announcement', 'promotion', 'newsletter', 'advertisement', 'sponsorship'];
const AUDIENCES = ['all', 'guests', 'buyers', 'sellers'];
const COLORS    = ['green', 'red', 'blue', 'yellow', 'purple', 'orange'];

const BADGE_PREVIEW = {
  green: 'bg-green-500 text-white', red: 'bg-red-500 text-white',
  blue: 'bg-blue-500 text-white', yellow: 'bg-yellow-400 text-gray-900',
  purple: 'bg-purple-500 text-white', orange: 'bg-orange-500 text-white',
};

const EMPTY = {
  title: '', content: '', type: 'announcement', image: null,
  cta_label: '', cta_url: '', cta_style: 'primary',
  badge_label: '', badge_color: 'green',
  target_audience: 'all', is_active: true, show_once: true,
  delay_seconds: 1, starts_at: '', ends_at: '', sort_order: 0,
};

const AnnouncementManagement = () => {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [removeImage, setRemoveImage]   = useState(false);

  const flash = (msg, type = 'success') => {
    if (type === 'success') setSuccess(msg);
    else setError(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 4000);
  };

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/announcements');
      setItems(res.data.data ?? []);
    } catch { setError('Failed to load announcements.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setImageFile(null);
    setImagePreview('');
    setRemoveImage(false);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title ?? '',
      content: item.content ?? '',
      type: item.type ?? 'announcement',
      image: null,
      cta_label: item.cta_label ?? '',
      cta_url: item.cta_url ?? '',
      cta_style: item.cta_style ?? 'primary',
      badge_label: item.badge_label ?? '',
      badge_color: item.badge_color ?? 'green',
      target_audience: item.target_audience ?? 'all',
      is_active: item.is_active ?? true,
      show_once: item.show_once ?? true,
      delay_seconds: item.delay_seconds ?? 1,
      starts_at: item.starts_at ? item.starts_at.slice(0, 16) : '',
      ends_at: item.ends_at ? item.ends_at.slice(0, 16) : '',
      sort_order: item.sort_order ?? 0,
    });
    setImagePreview(item.image ?? '');
    setImageFile(null);
    setRemoveImage(false);
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') fd.append(k, v);
      });
      if (imageFile) fd.append('image', imageFile);
      if (removeImage) fd.append('remove_image', '1');

      let res;
      if (editing) {
        res = await api.put(`/admin/announcements/${editing.id}`, fd,
          { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await api.post('/admin/announcements', fd,
          { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      if (res.data.success) {
        flash(editing ? 'Announcement updated.' : 'Announcement created.');
        setShowForm(false);
        fetch();
      }
    } catch (err) {
      const msgs = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message ?? 'Failed to save.';
      setError(msgs);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      flash('Deleted.');
      fetch();
    } catch { flash('Failed to delete.', 'error'); }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/admin/announcements/${id}/toggle`);
      fetch();
    } catch { flash('Failed to toggle.', 'error'); }
  };

  const f = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked
              : e.target.type === 'number'   ? Number(e.target.value)
              : e.target.value;
    setForm(prev => ({ ...prev, [k]: val }));
  };

  const Input = ({ label, name, type = 'text', ...rest }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={f(name)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg
                   focus:ring-2 focus:ring-green-500 focus:border-transparent"
        {...rest}
      />
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MegaphoneIcon className="h-5 w-5 text-green-600" />
            Announcements & Banners
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage popup banners shown on the homepage
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetch}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowPathIcon className="h-4 w-4" />
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white
                       text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
            <PlusIcon className="h-4 w-4" /> New
          </button>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200
                        rounded-lg text-sm text-green-800">
          <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200
                        rounded-lg text-sm text-red-700">
          <XCircleIcon className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center
                        bg-black/50 overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                {editing ? 'Edit Announcement' : 'New Announcement'}
              </h3>
              <button onClick={() => setShowForm(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <Input label="Title *" name="title" required />
                </div>

                {/* Content */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Content</label>
                  <textarea
                    rows={3}
                    value={form.content}
                    onChange={f('content')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg
                               focus:ring-2 focus:ring-green-500"
                    placeholder="Message body..."
                  />
                </div>

                {/* Type + Audience */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                  <select value={form.type} onChange={f('type')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Target Audience</label>
                  <select value={form.target_audience} onChange={f('target_audience')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                {/* CTA */}
                <Input label="CTA Button Text" name="cta_label" placeholder="e.g. Shop Now" />
                <Input label="CTA URL" name="cta_url" placeholder="/products or https://..." />

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">CTA Style</label>
                  <select value={form.cta_style} onChange={f('cta_style')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option value="primary">Primary (filled)</option>
                    <option value="outline">Outline</option>
                  </select>
                </div>

                {/* Badge */}
                <Input label="Badge Label" name="badge_label" placeholder="e.g. 🔥 New" />
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Badge Color</label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {COLORS.map(c => (
                      <button type="button" key={c}
                        onClick={() => setForm(p => ({ ...p, badge_color: c }))}
                        className={`w-6 h-6 rounded-full border-2 transition-transform
                          ${BADGE_PREVIEW[c]} ${form.badge_color === c ? 'scale-125 border-gray-800' : 'border-transparent'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <Input label="Starts At" name="starts_at" type="datetime-local" />
                <Input label="Ends At"   name="ends_at"   type="datetime-local" />

                {/* Options */}
                <Input label="Delay (seconds)" name="delay_seconds" type="number" min="0" max="30" />
                <Input label="Sort Order" name="sort_order" type="number" min="0" />

                {/* Checkboxes */}
                <div className="sm:col-span-2 flex flex-wrap gap-6">
                  {[
                    ['is_active', 'Active'],
                    ['show_once', 'Show once per day'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={form[key]} onChange={f(key)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>

                {/* Image upload */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Banner Image</label>
                  <div className="flex items-start gap-4">
                    {imagePreview ? (
                      <div className="relative w-40 h-24 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                        <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                        <button type="button"
                          onClick={() => { setImagePreview(''); setImageFile(null); setRemoveImage(true); }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
                          <XCircleIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-40 h-24 rounded-xl border-2 border-dashed border-gray-300
                                      flex flex-col items-center justify-center text-gray-400 flex-shrink-0">
                        <PhotoIcon className="h-6 w-6" />
                        <span className="text-[10px] mt-1">No image</span>
                      </div>
                    )}
                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2
                                        border border-gray-300 rounded-lg text-sm text-gray-700
                                        hover:bg-gray-50 transition-colors">
                        <PhotoIcon className="h-4 w-4" />
                        {imagePreview ? 'Change image' : 'Upload image'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      </label>
                      <p className="text-xs text-gray-400 mt-1">Max 4MB · JPG, PNG, WebP</p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm
                             font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-green-600 text-white text-sm font-semibold
                             rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                  {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <MegaphoneIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No announcements yet.</p>
            <button onClick={openCreate}
              className="mt-3 text-sm text-green-700 hover:text-green-900 underline">
              Create your first one
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Title', 'Type', 'Audience', 'Dates', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold
                                           text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-10 h-7 object-cover rounded-md flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-7 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <PhotoIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                          {item.badge_label && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                                              ${BADGE_PREVIEW[item.badge_color] ?? BADGE_PREVIEW.green}`}>
                              {item.badge_label}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">{item.type}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{item.target_audience}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {item.starts_at ? new Date(item.starts_at).toLocaleDateString() : '—'} →{' '}
                      {item.ends_at   ? new Date(item.ends_at).toLocaleDateString()   : '∞'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          item.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}>
                        {item.is_active ? <CheckCircleIcon className="h-3 w-3" /> : <XCircleIcon className="h-3 w-3" />}
                        {item.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementManagement;