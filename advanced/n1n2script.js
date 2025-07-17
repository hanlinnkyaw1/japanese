
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  toggleBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const lessonsContainer = document.getElementById('lessons-container');

  fetch('N1N2.json')
    .then(response => response.json())
    .then(lessonsData => {
      lessonsData.forEach((lesson, index) => {
        // Create lesson summary
        const lessonDiv = document.createElement('div');
        lessonDiv.className = 'lesson';
        lessonDiv.onclick = () => toggleLesson(lessonDiv, `lesson${index + 1}-content`);
        lessonDiv.innerHTML = `
          <div>
            <h2>${lesson.title}</h2>
            <p class="lesson-number">${lesson.lessonNumber}</p>
          </div>
          <span class="toggle-icon">+</span>
        `;

        // Create expandable content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'lesson-content';
        contentDiv.id = `lesson${index + 1}-content`;
        contentDiv.style.display = 'none';

      const { content } = lesson;  // content is an array now
      let contentHTML = '';
      
      content.forEach((grammarPoint) => {
        contentHTML += `
          <h3>${grammarPoint["grammar-title"]}</h3>
          <div class="connection-line">接続 : ${grammarPoint.connection}</div>
          <div class="grammar-explain">${grammarPoint["grammar-explain"].replace(/\n/g, '<br>')}</div>
          <ul class="grammar-examples">
            ${grammarPoint["grammar-examples"].map(example => `<li>${example}</li>`).join('')}
          </ul>
        `;
      });
      
      contentDiv.innerHTML = contentHTML;

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