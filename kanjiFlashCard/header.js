document.addEventListener('DOMContentLoaded', function() {
  const header = `
  <header class="bg-white shadow-sm w-full fixed top-0 left-0 z-50">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <h1 class="text-xl font-bold text-red-700">
          日本語の文法 <span class="text-gray-500 font-normal">Japanese Grammar</span>
        </h1>
      </div>
      <a href="flashCardIndex.html"
        class="inline-flex items-center px-3 py-2 mr-2 bg-red-100 text-gray-700 rounded-md hover:bg-blue-200 active:bg-blue-300 transition font-medium">
        Back
      </a>
      <nav class="hidden md:flex space-x-10">
        <a href="../index.html" class="text-blue-600 font-medium">Home</a>
        <a href="#" class="text-gray-600 hover:text-blue-600">Resources</a>
        <a href="#" class="text-gray-600 hover:text-blue-600">About</a>
      </nav>
      <button id="menu-toggle" class="md:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
    <nav id="mobile-menu" class="hidden md:hidden flex flex-col px-4 pb-4 bg-white shadow space-y-2">
      <a href="../index.html"
        class="block w-full px-4 py-3 text-blue-600 font-medium rounded-lg hover:bg-blue-50 active:bg-blue-100 transition">
        Home
      </a>
      <a href="#"
        class="block w-full px-4 py-3 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition">
        Resources
      </a>
      <a href="#"
        class="block w-full px-4 py-3 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition">
        About
      </a>
    </nav>
  </header>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', header);
  
  // ✅ Mobile menu toggle
  document.addEventListener('click', function(e) {
    const toggleBtn = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (e.target.closest('#menu-toggle')) {
      mobileMenu.classList.toggle('hidden');
    }
  });
});