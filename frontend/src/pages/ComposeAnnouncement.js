import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addAnnouncement } from '../lib/announcements';
import { useAuth } from '../contexts/AuthContext';

export default function ComposeAnnouncement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', imageUrl: '', videoUrl: '', linkUrl: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    addAnnouncement({ ...form, author: user?.email || 'admin' });
    navigate('/announcements');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Announcement</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600">Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="input w-full" placeholder="Announcement title" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Content</label>
          <textarea name="content" value={form.content} onChange={handleChange} className="input w-full h-40" placeholder="Write your message..." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Image URL</label>
            <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className="input w-full" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Video URL (YouTube supported)</label>
            <input name="videoUrl" value={form.videoUrl} onChange={handleChange} className="input w-full" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Link URL</label>
            <input name="linkUrl" value={form.linkUrl} onChange={handleChange} className="input w-full" placeholder="https://..." />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary">Publish</button>
          <button type="button" onClick={() => navigate('/announcements')} className="btn">Cancel</button>
        </div>
      </form>
    </div>
  );
}

