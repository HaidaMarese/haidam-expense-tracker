function Footer() {

  const LEFT_TEXT = "@2025MHaidaMint";

  return (

    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-800 bg-black/50 backdrop-blur">
      <div className="px-4 py-3 flex items-center justify-between text-sm">

        <span className="opacity-80">{LEFT_TEXT}</span>

        <div className="flex items-center gap-4">
          {/* GitHub */}
          <a
            href="https://github.com/HaidaMarese"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hover:text-white/90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.3-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2.9-.3 2-.4 3-.4s2.1.1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z"/>
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/hmakouan/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="hover:text-white/90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h14zM8.3 10.8H5.7V18h2.6v-7.2zm-.1-3.6a1.5 1.5 0 1 0-1.5 1.5 1.5 1.5 0 0 0 1.5-1.5zM20 18h-2.7v-3.5c0-2.1-.9-3.1-2.2-3.1s-2.1.9-2.1 3.1V18h-2.7v-7.2h2.5v1.1h.1a2.8 2.8 0 0 1 2.5-1.4c2.1 0 3.5 1.4 3.5 3.9V18z"/>
            </svg>
          </a>

          {/* Email */}
          <a href="mailto:hmakouan06@gmail.com" aria-label="Email" className="hover:text-white/90">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 4-8 5-8-5V6l8 5 8-5z"/>
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@hmarese?_t=ZP-8ynYppb0Ub1&_r=1"
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok"
            className="hover:text-white/90"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="currentColor">
              <path d="M29.5 9.2c1.7 3.8 5.2 6.3 9.2 6.6v6.2c-3.3-.1-6.6-1.2-9.2-3.3v10.6c0 7.1-5.4 12.7-12.5 12.7S4.5 36.4 4.5 29.3 9.9 16.6 17 16.6c1.3 0 2.6.2 3.8.6v6.7a7.2 7.2 0 0 0-3.8-1c-4 0-7.3 3.4-7.3 7.5s3.3 7.5 7.3 7.5 7.2-3.3 7.2-7.5V4h5.3v5.2z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
