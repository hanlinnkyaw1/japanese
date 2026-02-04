document.addEventListener('DOMContentLoaded', function () {
    const headerHeight = 72;

    // 1. Inject Custom CSS for the Light/Clean Design
    const styles = `
    <style>
        /* Modern Reset */
        #custom-nav * {
            box-sizing: border-box;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        /* Glassmorphism White Header */
        #custom-nav {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: ${headerHeight}px;
            /* White background with 90% opacity */
            background: rgba(255, 255, 255, 0.90);
            /* The Blur Effect */
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            /* Subtle border and shadow for depth */
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            z-index: 1000;
            transition: all 0.3s ease;
        }

        #custom-nav .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        /* Logo Styling */
        #custom-nav .logo {
            font-size: 1.5rem;
            font-weight: 800;
            text-decoration: none;
            color: #1f2937; /* Dark Gray */
            letter-spacing: -0.5px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        /* Optional: A Red dot or accent for 'Japan' feel */
        #custom-nav .logo span {
            color: #ef4444; /* Red-500 */
        }

        /* Desktop Links */
        .desktop-menu {
            display: flex;
            gap: 32px;
        }

        .nav-link {
            color: #4b5563; /* Gray-600 */
            text-decoration: none;
            font-size: 0.95rem;
            font-weight: 600;
            position: relative;
            padding: 5px 0;
            transition: color 0.3s ease;
        }

        .nav-link:hover {
            color: #ef4444; /* Red Hover */
        }

        /* Animated Red Underline */
        .nav-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: 0;
            left: 0;
            background-color: #ef4444;
            transition: width 0.3s ease;
            border-radius: 2px;
        }

        .nav-link:hover::after {
            width: 100%;
        }

        /* Mobile Hamburger Button */
        .menu-btn {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
        }
        
        /* Dark icon for light background */
        .menu-btn svg {
            width: 28px;
            height: 28px;
            stroke: #1f2937; 
        }

        /* Mobile Menu Dropdown (White) */
        #mobile-menu {
            position: absolute;
            top: ${headerHeight}px;
            left: 0;
            width: 100%;
            background: rgba(255, 255, 255, 0.98);
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            max-height: 0;
            transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        #mobile-menu.open {
            max-height: 300px;
        }

        #mobile-menu a {
            display: block;
            padding: 16px 24px;
            color: #1f2937;
            text-decoration: none;
            border-top: 1px solid rgba(0, 0, 0, 0.03);
            font-weight: 600;
            transition: background 0.2s, color 0.2s;
        }

        #mobile-menu a:hover {
            background: #f9fafb; /* Very light gray */
            color: #ef4444;
            padding-left: 30px;
        }

        @media (max-width: 768px) {
            .desktop-menu { display: none; }
            .menu-btn { display: block; }
        }
    </style>
    `;

    // 2. The HTML Structure
    const headerHTML = `
    <header id="custom-nav">
        <div class="nav-container">
            <a href="https://www.jlptburmese.com" class="logo">
                JLPT <span>Burmese</span>
            </a>

            <nav class="desktop-menu">
                <a href="../index.html" class="nav-link">Home</a>
                <a href="../#learnExplore" class="nav-link">Study Tools</a>
                <a href="../searchgrammar.html" class="nav-link">Grammar Search</a>
                <a href="../about.html" class="nav-link">Contact</a>
            </nav>

            <button id="menu-toggle" class="menu-btn" aria-label="Toggle menu">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>

        <div id="mobile-menu">
            <a href="../index.html">Home</a>
            <a href="../#learnExplore">Study Tools</a>
            <a href="../searchgrammar.html">Grammar Search</a>
            <a href="../about.html">Contact</a>
        </div>
    </header>
    `;

    // 3. Inject into DOM
    document.head.insertAdjacentHTML('beforeend', styles);
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.style.marginTop = headerHeight + 'px';

    // 4. Mobile Logic
    const menuBtn = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            mobileMenu.classList.remove('open');
        }
    });
});