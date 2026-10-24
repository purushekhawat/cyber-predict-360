'use client';

import { useRef, useState, useEffect } from 'react';

// ─── Telegram Bot Config ──────────────────────────────────────────
// Setup: t.me/BotFather → /newbot → token copy karo
// Chat ID: api.telegram.org/bot<TOKEN>/getUpdates se lo
const TELEGRAM_BOT_TOKEN = '8994321484:AAFSlC2dNHdkg4eM4t5lXNnp0rcov577yes';
const TELEGRAM_CHAT_ID   = '8696574439';
// ─────────────────────────────────────────────────────────────────

async function sendViewNotification() {
  try {
    // 1. IP fetch
    const ipRes = await fetch('https://api64.ipify.org?format=json');
    const { ip } = await ipRes.json();

    // 2. Location from IP
    let city = '', region = '', country = '', isp = '';
    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
      const geo = await geoRes.json();
      city    = geo.city        || '';
      region  = geo.region      || '';
      country = geo.country_name|| '';
      isp     = geo.org         || '';
    } catch {}

    // 3. Device / Browser info
    const ua        = navigator.userAgent;
    const screenRes = `${window.screen.width}×${window.screen.height}`;
    const timezone  = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const referrer  = document.referrer || 'Direct';
    const openedAt  = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    let browser = 'Unknown';
    if      (/Edg/.test(ua))       browser = 'Edge';
    else if (/OPR|Opera/.test(ua)) browser = 'Opera';
    else if (/Chrome/.test(ua))    browser = 'Chrome';
    else if (/Firefox/.test(ua))   browser = 'Firefox';
    else if (/Safari/.test(ua))    browser = 'Safari';

    let os = 'Unknown';
    if      (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
    else if (/Windows/.test(ua))       os = 'Windows';
    else if (/Android/.test(ua))       os = 'Android';
    else if (/iPhone/.test(ua))        os = 'iPhone';
    else if (/iPad/.test(ua))          os = 'iPad';
    else if (/Mac/.test(ua))           os = 'macOS';
    else if (/Linux/.test(ua))         os = 'Linux';

    const device = /Mobi|Android|iPhone|iPad/.test(ua) ? '📱 Mobile' : '🖥️ Desktop';

    // 4. Telegram message
    const msg = `
🎬 *CYBER-PREDICT 360 — Video Viewed!*

🌐 *IP:* \`${ip}\`
📍 *Location:* ${city}, ${region}, ${country}
🏢 *ISP/Org:* ${isp}

${device} *Device:* ${os} · ${browser}
📐 *Screen:* ${screenRes}
🕐 *Time (IST):* ${openedAt}
🌍 *Timezone:* ${timezone}
🔗 *Referrer:* ${referrer}
`.trim();

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    TELEGRAM_CHAT_ID,
        text:       msg,
        parse_mode: 'Markdown',
      }),
    });
  } catch {
    // Silent fail
  }
}

export default function PrototypeVideoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const notified = useRef(false);

  // Page load hote hi tracker chalao
  useEffect(() => {
    if (!notified.current) {
      notified.current = true;
      sendViewNotification();
    }
  }, []);

  const handleStart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    video.play();
    setStarted(true);
  };

  return (
    <div style={{
      margin: 0,
      padding: 0,
      background: '#000',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <video
        ref={videoRef}
        src="/prototype_video.mp4"
        controls
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />

      {!started && (
        <div
          onClick={handleStart}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: 'rgba(0,0,0,0.72)',
            gap: '20px',
          }}
        >
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <p style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}>
            Click to Play
          </p>
        </div>
      )}
    </div>
  );
}
