document.addEventListener('DOMContentLoaded', function () {
  const headerHeight = 72;
  const header =
    `<header class="bg-gray-900 text-white w-full fixed top-0 left-0 z-50 shadow-md">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="https://www.jlptburmese.com" class="text-2xl font-bold tracking-wide hover:text-red-400 transition">
          JLPT Burmese
        </a>
        <nav class="hidden md:flex space-x-6">
          <a href="../index.html" class="hover:text-red-400 transition">Home</a>
          <a href="../#learnExplore" class="hover:text-red-400 transition">Study tools</a>
          <a href="../searchgrammar.html" class="hover:text-red-400 transition">Grammar Search</a>
          <a href="../about.html" class="hover:text-red-400 transition">Contact</a>
        </nav>
        <button id="menu-toggle" class="md:hidden focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <div id="mobile-menu" class="hidden md:hidden bg-gray-800 px-4 py-4 space-y-2">
        <a href="../index.html" class="block text-white hover:text-red-400 transition">Home</a>
        <a href="../#learnExplore" class="block text-white hover:text-red-400 transition">Study tools</a>
        <a href="../searchgrammar.html" class="block text-white hover:text-red-400 transition">Grammar Search</a>
        <a href="../about.html" class="block text-white hover:text-red-400 transition">Contact</a>
      </div>
    </header>`;

  document.body.insertAdjacentHTML('afterbegin', header);

  // Add margin-top to body so content is not covered by fixed header
  document.body.style.marginTop = headerHeight + 'px';

  // Toggle mobile menu
  document.addEventListener('click', function (e) {
    const menuBtn = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu && e.target.closest('#menu-toggle')) {
      mobileMenu.classList.toggle('hidden');
    }
  });
});