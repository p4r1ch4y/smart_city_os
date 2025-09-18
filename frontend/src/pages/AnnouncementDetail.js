import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAnnouncementById } from '../lib/announcements';

export default function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [a, setA] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const item = await fetchAnnouncementById(id);
      if (mounted) {
        setA(item);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return <div className="min-h-[200px] flex items-center justify-center">Loading...</div>;
  }
  if (!a) {
    return <div className="text-gray-500">Announcement not found.</div>;
  }

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

