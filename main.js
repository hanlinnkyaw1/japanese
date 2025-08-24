// Mobile menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  toggleBtn?.addEventListener("click", () => {
    mobileMenu?.classList.toggle("hidden");
  });
});

// Navigation buttons
document.getElementById("beginnerLevel").addEventListener("click", () => {
  window.location.href = "beginner/beginner.html";
});

document.getElementById("intermediateLevel").addEventListener("click", () => {
  window.location.href = "intermediate/n3.html";
});

document.getElementById("advancedLevel").addEventListener("click", () => {
  window.location.href = "advanced/advancedLevel.html";
});

document.getElementById("kanjiFlashCard").addEventListener("click", () => {
  window.location.href = "kanjiFlashCard/kanjiFlashcards.html";
});

document.getElementById("kanjiGame").addEventListener("click", () => {
  window.location.href = "kanjiGame/kanjigame.html";
});
document.getElementById("viewAllGrammar").addEventListener("click", () => {
  window.location.href = "searchgrammar.html";
});

// Grammar rendering and filtering
document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("grammar-container");
  const searchInput = document.querySelector("input[type='text']");
  const filterButtons = document.querySelectorAll(".flex.flex-wrap button");

  let metaData = [];
  let fullData = null;
  let currentFilter = "All Levels";
  let isSearching = false;

  fetch("preview.json")
    .then(res => res.json())
    .then(data => {
      metaData = data;
      renderCards(metaData.slice(0, 3)); // initial preview
    });

  function renderCards(data) {
    container.innerHTML = "";

    if (!data.length) {
      container.innerHTML = `<p class="text-gray-500 text-center col-span-full">No grammar points found.</p>`;
      return;
    }

    data.forEach((item, index) => {
      const badgeColor = {
        N5: "green",
        N4: "blue",
        N3: "purple",
        N2: "yellow",
        N1: "red"
      }[item.level] || "gray";

      const exampleHTML = (item.examples || []).map(ex => `
        <li class="mb-2">
          <span class="jp-text font-medium">${ex.jp}</span><br>
          <span class="text-gray-400 text-xs">${ex.mm}</span>
        </li>
      `).join("");

      const cardHTML = `
        <div class="grammar-card bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-red-200">
          <span class="bg-${badgeColor}-100 text-${badgeColor}-600 text-xs font-medium px-2.5 py-0.5 rounded-full">${item.level}</span>
          <h4 class="text-lg font-bold mt-2 jp-text">${item.title}</h4>
          <p class="text-gray-600 text-sm mb-3">${item.short}</p>
          ${item.description ? `<p class="text-gray-700 mb-4 text-sm">${item.description}</p>` : ""}
          ${item.examples ? `
            <div class="flex justify-between items-center">
              <button class="text-red-500 hover:text-red-600 text-sm font-medium show-examples-btn" data-index="${index}">Show examples</button>
              <span class="text-gray-400 text-xs">${item.examples.length} examples</span>
            </div>
            <ul class="example-list text-sm mt-4 hidden">${exampleHTML}</ul>
          ` : ""}
        </div>
      `;

      container.insertAdjacentHTML("beforeend", cardHTML);
    });

    // Toggle example visibility
    document.querySelectorAll(".show-examples-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const card = this.closest(".grammar-card");
        const list = card.querySelector(".example-list");
        const isHidden = list.classList.contains("hidden");
        if (isHidden) {
          list.classList.remove("hidden");
          this.textContent = "Hide examples";
        } else {
          list.classList.add("hidden");
          this.textContent = "Show examples";
        }
      });
    });
  }

  // Filter buttons: filter on preview.json data only
  filterButtons.forEach(button => {
    button.addEventListener("click", function () {
      currentFilter = this.textContent.trim();
      isSearching = false;
      searchInput.value = "";

      filterButtons.forEach(btn => btn.classList.remove("bg-red-500", "text-white"));
      this.classList.add("bg-red-500", "text-white");

      if (currentFilter === "All Levels") {
        renderCards(metaData.slice(0, 3)); // preview mode on all levels
      } else {
        const filtered = metaData.filter(item => item.level === currentFilter);
        renderCards(filtered);
      }
    });
  });

  // Load full grammarMetadata.json for search only
  function ensureFullData(callback) {
    if (fullData) {
      callback(fullData);
    } else {
      fetch("grammarMetadata.json")
        .then(res => res.json())
        .then(data => {
          fullData = data;
          callback(fullData);
        });
    }
  }

  // Search input event (search fullData only)
  searchInput.addEventListener("input", function () {
    const keyword = this.value.toLowerCase().trim();

    if (keyword === "") {
      // Reset view on search cleared
      isSearching = false;
      if (currentFilter === "All Levels") {
        renderCards(metaData.slice(0, 3));
      } else {
        renderCards(metaData.filter(item => item.level === currentFilter));
      }
      return;
    }

    isSearching = true;
    ensureFullData(data => {
      const filtered = data.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        item.short.toLowerCase().includes(keyword) ||
        (item.description && item.description.toLowerCase().includes(keyword))
      );
      renderCards(filtered);
    });
  });

  // View All Grammar Points button (load fullData)
  document.querySelector(".flex.justify-center button").addEventListener("click", function () {
    isSearching = true;
    searchInput.value = "";
    filterButtons.forEach(btn => btn.classList.remove("bg-red-500", "text-white"));
    ensureFullData(data => renderCards(data));
  });
});