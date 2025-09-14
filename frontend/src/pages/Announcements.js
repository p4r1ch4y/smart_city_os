import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAnnouncements, getAnnouncementById, syncAnnouncementsFromRemote } from '../lib/announcements';
import { useAuth } from '../contexts/AuthContext';

function AnnouncementCard({ a, onClick }) {
  return (
    <div onClick={onClick} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{a.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(a.createdAt).toLocaleString()}</p>
      <p className="mt-2 text-gray-700 dark:text-gray-300 line-clamp-2">{a.content}</p>
    </div>
  );
}

export function AnnouncementDetail() {
  const { id } = useParams();
  const a = getAnnouncementById(id);
  const navigate = useNavigate();
  if (!a) return <div className="text-gray-500">Announcement not found.</div>;
  const isYouTube = a.videoUrl && a.videoUrl.includes('youtube');
  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm text-primary-600">← Back</button>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{a.title}</h1>
      <p className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()} • {a.author}</p>
      {a.imageUrl && (
        <img src={a.imageUrl} alt="announcement" className="rounded-lg border border-gray-200 dark:border-gray-700 max-h-96 object-contain" />
      )}
      {a.videoUrl && (
        isYouTube ? (
          <div className="aspect-video">
            <iframe title="video" className="w-full h-full rounded-lg" src={a.videoUrl.replace('watch?v=', 'embed/')} allowFullScreen />
          </div>
        ) : (
          <video controls className="w-full rounded-lg"><source src={a.videoUrl} /></video>
        )
      )}
      {a.linkUrl && (
        <a href={a.linkUrl} target="_blank" rel="noreferrer" className="text-primary-600 underline">{a.linkUrl}</a>
      )}
      <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{a.content}</p>
    </div>
  );
}

export default function Announcements() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState(getAnnouncements());

  useEffect(() => {
    let mounted = true;
    (async () => {
      const ok = await syncAnnouncementsFromRemote();
      if (mounted && ok) setList(getAnnouncements());
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">City Notices</h1>
          <p className="text-gray-600 dark:text-gray-400">Official messages and updates</p>
        </div>
        {(user?.role === 'admin') && (
          <button onClick={() => navigate('/announcements/new')} className="btn btn-primary">New Announcement</button>
        )}
      </div>

      {list.length === 0 && (
        <div className="p-6 rounded-lg border border-dashed text-gray-500">No announcements yet.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((a) => (
          <AnnouncementCard key={a.id} a={a} onClick={() => navigate(`/announcements/${a.id}`)} />
        ))}
      </div>
    </div>
  );
}

