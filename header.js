document.addEventListener('DOMContentLoaded', function () {
    const headerHeight = 90;

    // 1. Inject Modern CSS for the Floating Island Design
    const styles = `
    <style>
        :root {
            --nav-bg: rgba(255, 255, 255, 0.8);
            --nav-text: #374151;
            --nav-accent: #ef4444;
        }

        /* Container for the Floating Nav */
        #nav-wrapper {
            position: fixed;
            top: 15px;
            left: 0;
            width: 100%;
            z-index: 9999;
            display: flex;
            justify-content: center;
            padding: 0 4px;
        }

        /* The Floating "Island" */
        #main-nav {
            background: var(--nav-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
            border-radius: 10px; /* Pill shape */
            width: 100%;
            max-width: 1100px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 25px;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Logo Area */
        .nav-logo {
            font-weight: 800;
            font-size: 1.25rem;
            color: #111827;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .logo-dot {
            height: 8px;
            width: 8px;
            background: var(--nav-accent);
            border-radius: 50%;
        }

        /* Desktop Menu Links */
        .nav-menu {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .nav-item {
            color: var(--nav-text);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 600;
            padding: 8px 16px;
            margin: 0 4px;
            transition: all 0.3s ease;
        }

        .nav-item:hover {
            background: rgba(0, 0, 0, 0.04);
            color: var(--nav-accent);
        }

        /* Mobile Menu Button */
        .mobile-toggle {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            color: var(--nav-text);
        }

        /* Mobile Dropdown Wrapper */
        #mobile-dropdown {
            position: fixed;
            top: 90px;
            left: 20px;
            right: 20px;
            background: white;
            border-radius: 14px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            opacity: 0;
            transform: translateY(-10px);
            pointer-events: none;
            transition: all 0.3s ease;
            z-index: 9998;
        }

        #mobile-dropdown.active {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
        }

        #mobile-dropdown a {
            padding: 14px 20px;
            text-decoration: none;
            color: var(--nav-text);
            font-weight: 600;
        }

        #mobile-dropdown a:hover {
            background: #fef2f2;
            color: var(--nav-accent);
        }

        @media (max-width: 850px) {
            .nav-menu { display: none; }
            .mobile-toggle { display: block; }
            #main-nav { max-width: 95%; }
        }
    </style>
    `;

    // 2. The HTML Content
    const navHTML = `
    <div id="nav-wrapper">
        <nav id="main-nav">
            <a href="https://www.jlptburmese.com" class="nav-logo">
                <div class="logo-dot"></div>
                JLPT Burmese
            </a>

            <div class="nav-menu">
                <a href="../index.html" class="nav-item">Home</a>
                <a href="../JLPTtest/test.html" class="nav-item">JLPT Test</a>
                <a href="../#learnExplore" class="nav-item">Study tools</a>
                <a href="../searchgrammar.html" class="nav-item">Grammar Search</a>
                <a href="../about.html" class="nav-item">Community</a>
            </div>

            <button class="mobile-toggle" id="mobile-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
        </nav>
    </div>

    <div id="mobile-dropdown">
        <a href="../index.html">Home</a>
        <a href="../#learnExplore">Study tools</a>
        <a href="../JLPTtest/test.html">JLPT Test</a>
        <a href="../searchgrammar.html">Grammar Search</a>
        <a href="../about.html">Community</a>
    </div>
    `;

    // 3. Inject into Page
    document.head.insertAdjacentHTML('beforeend', styles);
    document.body.insertAdjacentHTML('afterbegin', navHTML);
    document.body.style.marginTop = headerHeight + 'px';

    // 4. Interaction Logic
    const mobileBtn = document.getElementById('mobile-btn');
    const mobileDropdown = document.getElementById('mobile-dropdown');

    mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        mobileDropdown.classList.remove('active');
    });
});