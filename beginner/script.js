document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  toggleBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
});


document.addEventListener('DOMContentLoaded', () => {
    const lessonsContainer = document.getElementById('lessons-container');

    fetch('n5-n4.json')
        .then(response => response.json())
        .then(lessonsData => {
            lessonsData.forEach((lesson, index) => {
                const lessonDiv = document.createElement('div');
                lessonDiv.className = 'lesson';
                lessonDiv.onclick = () => toggleLesson(lessonDiv, `lesson${index + 1}-content`);
                lessonDiv.innerHTML = `
                    <h2>${lesson.title}</h2>
                    <span class="toggle-icon">+</span>
                `;

                const contentDiv = document.createElement('div');
                contentDiv.className = 'lesson-content';
                contentDiv.id = `lesson${index + 1}-content`;
                contentDiv.style.display = 'none';
                contentDiv.innerHTML = `<pre>${lesson.content}</pre>`; // Preserves line breaks

                lessonsContainer.appendChild(lessonDiv);
                lessonsContainer.appendChild(contentDiv);
            });
        })
        .catch(error => {
            lessonsContainer.innerHTML = `<p>Error loading lessons: ${error.message}</p>`;
        });

    function toggleLesson(lessonElement, contentId) {
        const content = document.getElementById(contentId);
        const icon = lessonElement.querySelector('.toggle-icon');
        const isVisible = content.style.display === 'block';

        content.style.display = isVisible ? 'none' : 'block';
        icon.textContent = isVisible ? '+' : '-';
    }
});