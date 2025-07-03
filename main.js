// Mobile menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  toggleBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
});


document.getElementById('beginnerLevel').addEventListener("click", () => {
    window.location.href = "beginner/beginner.html";
});


// Grammar level filter buttons
document.querySelectorAll('.flex.flex-wrap button').forEach(btn => {
    btn.addEventListener('click', function() {
        const level = btn.textContent.trim();
        document.querySelectorAll('.flex.flex-wrap button').forEach(b => {
            b.classList.remove('bg-red-500', 'text-white');
            b.classList.add('bg-gray-100', 'text-gray-800');
            
        });
        btn.classList.remove('bg-gray-100', 'text-gray-800');
        btn.classList.add('bg-red-500', 'text-white');

        document.querySelectorAll('.grammar-card').forEach(card => {
            if (level === 'All Levels') {
                card.style.display = '';
            } else {
                const badge = card.querySelector('span');
                if (badge && badge.textContent.trim() === level) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });
});


// Smooth scroll for nav links (if you add #anchors)
document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Grammar card hover effect
const grammarCards = document.querySelectorAll('.grammar-card');
grammarCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.classList.add('shadow-md');
    });
    card.addEventListener('mouseleave', function() {
        this.classList.remove('shadow-md');
    });
});

// --- Add your new JS code below ---
// Example: Show alert when "Practice This Point" is clicked
document.querySelectorAll('button').forEach(btn => {
    if (btn.textContent.includes('Practice This Point')) {
        btn.addEventListener('click', () => {
            alert('Practice mode coming soon!');
        });
    }
});

// Highlight navigation link on scroll (active section)
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 80;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('tab-active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('tab-active');
        }
    });
});


// Animate grammar cards on scroll into view
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate__animated', 'animate__fadeInUp');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.grammar-card').forEach(card => {
    observer.observe(card);
});

// Optional: Add Animate.css for card animation if not already included
if (!document.querySelector('link[href*="animate.min.css"]')) {
    const animateCSS = document.createElement('link');
    animateCSS.rel = 'stylesheet';
    animateCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
    document.head.appendChild(animateCSS);
}

// Auto-close mobile nav when a nav link is clicked (for better UX on mobile)
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        const nav = document.querySelector('nav');
        if (window.innerWidth < 768 && nav.classList.contains('flex')) {
            nav.classList.add('hidden');
            nav.classList.remove('flex', 'flex-col', 'absolute', 'top-16', 'right-4', 'bg-white', 'shadow-lg', 'p-4', 'rounded-lg', 'space-y-4', 'z-50');
        }
    });
});


