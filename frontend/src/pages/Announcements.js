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

      {/* Official Letter - Project Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Letter Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Smart City Management Platform</h2>
              <p className="text-blue-100">Official Project Documentation</p>
            </div>
          </div>
        </div>

        {/* Letter Content */}
        <div className="px-8 py-8">
          {/* Date and Reference */}
          <div className="flex justify-between items-start mb-8 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <p>Date: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p>Reference: SCMP-2024-001</p>
            </div>
            <div className="text-right">
              <p>Classification: Public</p>
              <p>Status: Production Ready</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Project Overview & Acknowledgments
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6 border-l-4 border-blue-500">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                This is a <strong>comprehensive, production-ready smart city management platform</strong> featuring 
                AI-powered analytics, blockchain transparency, and real-time IoT monitoring. Built as a capstone project, 
                it was meant to be a simple Full Stack Smart City Management Platform, but evolved into a sophisticated 
                system introducing multiple microservice modules inspired from modern web architecture.
              </p>
            </div>

            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Key Inspirations & References
            </h4>

            <div className="space-y-4">
              {/* Waste and IoT Sensors */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white">Waste Management & IoT Sensors</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Comprehensive IoT sensor integration for waste management and environmental monitoring
                    </p>
                    <a 
                      href="https://www.youtube.com/watch?v=v8HIJYyBeSg" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Watch Implementation Video
                    </a>
                  </div>
                </div>
              </div>

              {/* Smart City Management Program */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white">Integrated Smart City Management Program</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Civil Engineering approach to comprehensive urban infrastructure management
                    </p>
                    <a 
                      href="https://www.youtube.com/playlist?list=PL3MO67NH2XxIYo-UFN8csPPnEiYVyR0TO" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      View Complete Playlist
                    </a>
                  </div>
                </div>
              </div>

              {/* Meri Panchayat Application */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white">Meri Panchayat Application Inspiration</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Ministry of Panchayat Raj's citizen service platform - similar integration potential for smart city citizen access
                    </p>
                    <a 
                      href="https://play.google.com/store/apps/details?id=com.meri_panchayat" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      View on Google Play Store
                    </a>
                  </div>
                </div>
              </div>

              {/* National Blockchain Stack */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white">National Blockchain Stack (Vishvasya)</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Blockchain-as-a-Service Stack for transparent governance and civic applications
                    </p>
                    <a 
                      href="https://blockchain.meity.gov.in/index.php/articles/184-vishvasya-national-blockchain-technology-stack" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Learn About Vishvasya Stack
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Closing Statement */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                <strong>Happy to contribute as much as we can</strong> to the advancement of smart city technologies 
                and transparent governance systems. This platform represents our commitment to leveraging cutting-edge 
                technology for better urban management and citizen services.
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Respectfully submitted,</p>
                <div className="mt-4">
                  <p className="font-semibold text-gray-900 dark:text-white">Smart City Development Team</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Full Stack Development & Research</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-24 h-16 bg-gray-100 dark:bg-gray-700 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Digital Seal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regular Announcements Section */}
      {list.length > 0 && (
        <>
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Announcements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {list.map((a) => (
                <AnnouncementCard key={a.id} a={a} onClick={() => navigate(`/announcements/${a.id}`)} />
              ))}
            </div>
          </div>
        </>
      )}

      {list.length === 0 && (
        <div className="p-6 rounded-lg border border-dashed text-gray-500 text-center">
          <p>No additional announcements at this time.</p>
          <p className="text-sm mt-2">Check back later for updates and news.</p>
        </div>
      )}
    </div>
  );
}

