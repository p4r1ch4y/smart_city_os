// Announcements store using backend API with localStorage fallback
import { supabase } from './supabase';

const STORAGE_KEY = 'smartcity_announcements_v1';
const API_BASE = process.env.REACT_APP_API_URL || '/api';

// Map row -> local format
function mapRow(r) {
  return {
    id: r.id?.toString?.() || r.id || `${Date.now()}`,
    title: r.title,
    content: r.content,
    imageUrl: r.imageUrl || r.image_url || '',
    videoUrl: r.videoUrl || r.video_url || '',
    linkUrl: r.linkUrl || r.link_url || '',
    author: r.author || 'admin',
    createdAt: r.createdAt || r.created_at || new Date().toISOString()
  };
}

export async function syncAnnouncementsFromRemote() {
  try {
    const resp = await fetch(`${API_BASE}/notices`, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    const list = (json?.data || []).map(mapRow);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function getAnnouncements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)) : [];
  } catch {
    return [];
  }
}

export async function addAnnouncement({ title, content, imageUrl = '', videoUrl = '', linkUrl = '', author = 'admin' }) {
  // Update local cache immediately for responsive UX
  const all = getAnnouncements();
  const temp = { id: `${Date.now()}`, title, content, imageUrl, videoUrl, linkUrl, author, createdAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([temp, ...all]));

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

    const resp = await fetch(`${API_BASE}/notices`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title, content, imageUrl, videoUrl, linkUrl, author })
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    const saved = mapRow(json.data || {});
    // Replace temp with saved (has real id/timestamp)
    const updated = [saved, ...getAnnouncements().filter(a => a.id !== temp.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return saved;
  } catch {
    // Leave temp in cache; caller may show a warning elsewhere
    return temp;
  }
}

export function getLatestAnnouncement() {
  const all = getAnnouncements();
  return all.length ? all[0] : null;
}

export function getAnnouncementById(id) {
  const all = getAnnouncements();
  return all.find(a => a.id === id) || null;
}

export async function fetchAnnouncementById(id) {
  // Try cache first
  const cached = getAnnouncementById(id);
  if (cached) return cached;
  try {
    const resp = await fetch(`${API_BASE}/notices/${id}`, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    const item = mapRow(json.data || {});
    const updated = [item, ...getAnnouncements().filter(a => a.id !== item.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return item;
  } catch {
    return null;
  }
}

export function deleteAnnouncement(id) {
  const all = getAnnouncements().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  // Optional: add backend delete later
}
