
import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, SkipBack, SkipForward, X, Settings, LogIn, Radio, Copy, Check, WifiOff } from 'lucide-react';

interface SpotifyPlayerProps {
  className?: string;
}

interface Track {
  name: string;
  artist: string;
  albumArt: string;
  uri: string;
  durationMs?: number;
}

// Mock Playlist for Demo Mode
const DEMO_PLAYLIST: Track[] = [
  {
    name: "International Harvester",
    artist: "Craig Morgan",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273ea3ef7697cfd57d99414f7bc",
    uri: "demo:1",
    durationMs: 215000
  },
  {
    name: "Amarillo By Morning",
    artist: "George Strait",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273e11a75a2f2ff39cec788a015",
    uri: "demo:2",
    durationMs: 172000
  },
  {
    name: "She Thinks My Tractor's Sexy",
    artist: "Kenny Chesney",
    albumArt: "https://i.scdn.co/image/ab67616d0000b2735f367d17672857e9dfd16b75",
    uri: "demo:3",
    durationMs: 248000
  },
  {
    name: "God's Country",
    artist: "Blake Shelton",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273163322554683a097b610452e",
    uri: "demo:4",
    durationMs: 205000
  },
  {
    name: "Take Me Home, Country Roads",
    artist: "John Denver",
    albumArt: "https://i.scdn.co/image/ab67616d0000b273d92d7c8c6c03e950c879a6a4",
    uri: "demo:5",
    durationMs: 198000
  }
];

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Demo Mode State
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);

  // Initialize from local storage
  useEffect(() => {
    const storedToken = localStorage.getItem('spotify_token');
    const storedClientId = localStorage.getItem('spotify_client_id');
    const tokenExpiry = localStorage.getItem('spotify_token_expiry');

    if (storedClientId) setClientId(storedClientId);

    // Check if token is valid and not expired
    if (storedToken && tokenExpiry && new Date().getTime() < parseInt(tokenExpiry)) {
      setToken(storedToken);
    } else {
      // Check URL for new token (callback from login)
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const expiresIn = params.get('expires_in');

        if (accessToken && expiresIn) {
          const expiryTime = new Date().getTime() + parseInt(expiresIn) * 1000;
          localStorage.setItem('spotify_token', accessToken);
          localStorage.setItem('spotify_token_expiry', expiryTime.toString());
          setToken(accessToken);
          window.location.hash = ''; // Clear hash
          setIsOpen(true); // Auto open on successful login
          setIsDemoMode(false);
        }
      } else {
        // Default to demo mode if no token found
        setIsDemoMode(true);
        setCurrentTrack(DEMO_PLAYLIST[0]);
      }
    }
  }, []);

  // Poll for current track status (Real Mode)
  useEffect(() => {
    if (!token || !isOpen || isDemoMode) return;

    const fetchCurrentTrack = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 204 || response.status > 400) {
          return;
        }

        const data = await response.json();
        
        if (data.item) {
          setCurrentTrack({
            name: data.item.name,
            artist: data.item.artists.map((a: any) => a.name).join(', '),
            albumArt: data.item.album.images[0]?.url,
            uri: data.item.uri,
          });
          setIsPlaying(data.is_playing);
          setError(null);
        }
      } catch (e) {
        // Fail silently
      }
    };

    fetchCurrentTrack();
    const interval = setInterval(fetchCurrentTrack, 5000); 

    return () => clearInterval(interval);
  }, [token, isOpen, isDemoMode]);

  const handleLogin = () => {
    if (!clientId) {
      setError("Client ID is required for real connection");
      return;
    }
    localStorage.setItem('spotify_client_id', clientId);
    
    const redirectUri = window.location.origin;
    const scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing';
    
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=token&show_dialog=true`;
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_token_expiry');
    setCurrentTrack(DEMO_PLAYLIST[0]);
    setIsDemoMode(true);
    setDemoIndex(0);
    setIsPlaying(false);
  };

  const copyRedirectUri = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const controlPlayback = async (action: 'play' | 'pause' | 'next' | 'previous') => {
    // DEMO MODE LOGIC
    if (isDemoMode) {
      if (action === 'play') setIsPlaying(true);
      if (action === 'pause') setIsPlaying(false);
      
      if (action === 'next') {
        const nextIndex = (demoIndex + 1) % DEMO_PLAYLIST.length;
        setDemoIndex(nextIndex);
        setCurrentTrack(DEMO_PLAYLIST[nextIndex]);
        setIsPlaying(true);
      }
      
      if (action === 'previous') {
        const prevIndex = (demoIndex - 1 + DEMO_PLAYLIST.length) % DEMO_PLAYLIST.length;
        setDemoIndex(prevIndex);
        setCurrentTrack(DEMO_PLAYLIST[prevIndex]);
        setIsPlaying(true);
      }
      return;
    }

    // REAL SPOTIFY LOGIC
    if (!token) return;

    let endpoint = `https://api.spotify.com/v1/me/player/${action}`;
    let method = 'POST';

    if (action === 'play' || action === 'pause') {
      method = 'PUT';
    }

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        setError("Premium required for full control.");
      } else if (res.status === 404) {
        setError("No active device found. Open Spotify on your phone.");
      } else {
        if (action === 'pause') setIsPlaying(false);
        if (action === 'play') setIsPlaying(true);
        setError(null);
      }
    } catch (e) {
      setError("Command failed.");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 p-4 bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center justify-center group ${className}`}
      >
        <Music className="w-6 h-6 group-hover:scale-110 transition-transform" />
        {isPlaying && (
           <span className="absolute top-0 right-0 flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-green-200"></span>
           </span>
        )}
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-80 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-slate-700 z-50 overflow-hidden transition-all animate-in slide-in-from-bottom-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-950/50 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-[#1DB954]" />
          <span className="font-bold text-sm">Tractor Tunes</span>
          {isDemoMode && <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">Radio</span>}
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setShowSettings(!showSettings)} className="p-1 hover:bg-slate-800 rounded">
             <Settings className="w-4 h-4 text-slate-400" />
           </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-800 rounded">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Settings (Hidden by default) */}
      {showSettings && (
         <div className="p-4 bg-slate-800 border-b border-slate-700 animate-in slide-in-from-top-2">
            <h5 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">Real Connection Setup</h5>
             <div className="space-y-3">
                <div className="bg-slate-900 p-3 rounded-lg space-y-2">
                  <label className="text-xs text-slate-400 block font-medium">1. Set Redirect URI</label>
                   <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black border border-slate-800 rounded px-2 py-1.5 text-[10px] text-slate-300 break-all">
                       {window.location.origin}
                    </code>
                    <button onClick={copyRedirectUri} className="p-1.5 hover:bg-slate-700 rounded text-slate-400">
                        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg space-y-2">
                  <label className="text-xs text-slate-400 block font-medium">2. Enter Client ID</label>
                  <input 
                    type="text" 
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-black border border-slate-800 rounded px-2 py-1.5 text-xs text-white focus:border-[#1DB954] focus:outline-none"
                    placeholder="e.g. 8421..."
                  />
                </div>
                
                {!token ? (
                    <button 
                    onClick={handleLogin}
                    className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-2 px-4 rounded flex items-center justify-center gap-2 text-xs"
                    >
                    <LogIn className="w-3 h-3" />
                    Login to Spotify
                    </button>
                ) : (
                    <button 
                    onClick={handleLogout}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 text-xs"
                    >
                    Disconnect Real Account
                    </button>
                )}
              </div>
         </div>
      )}

      {/* Content */}
      <div className="p-4">
          <div className="space-y-4">
            {/* Track Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-800 rounded-md overflow-hidden flex-shrink-0 shadow-md relative">
                {currentTrack?.albumArt ? (
                  <img src={currentTrack.albumArt} alt="Album Art" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <Music className="w-8 h-8" />
                  </div>
                )}
                {isPlaying && (
                    <div className="absolute bottom-1 right-1 flex gap-0.5">
                        <div className="w-1 bg-[#1DB954] h-2 animate-[bounce_1s_infinite]"></div>
                        <div className="w-1 bg-[#1DB954] h-3 animate-[bounce_1.2s_infinite]"></div>
                        <div className="w-1 bg-[#1DB954] h-2 animate-[bounce_0.8s_infinite]"></div>
                    </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold truncate text-white">{currentTrack?.name || "Select a Song"}</h4>
                <p className="text-xs text-slate-400 truncate">{currentTrack?.artist || "Artist"}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => controlPlayback('previous')} className="text-slate-400 hover:text-white transition-colors">
                <SkipBack className="w-6 h-6" />
              </button>
              <button 
                onClick={() => controlPlayback(isPlaying ? 'pause' : 'play')} 
                className="w-12 h-12 bg-white hover:bg-slate-200 rounded-full flex items-center justify-center text-black transition-colors shadow-lg"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
              </button>
              <button onClick={() => controlPlayback('next')} className="text-slate-400 hover:text-white transition-colors">
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            {error && (
                <div className="text-[10px] text-amber-400 text-center bg-amber-900/20 p-1 rounded border border-amber-900/50">
                    {error}
                </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
               {isDemoMode ? (
                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                        <WifiOff className="w-3 h-3" /> Local Radio
                    </span>
               ) : (
                    <span className="text-[10px] text-[#1DB954] font-medium flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#1DB954]"></div> Spotify Connected
                    </span>
               )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default SpotifyPlayer;
