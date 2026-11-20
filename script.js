document.addEventListener("DOMContentLoaded", () => {
  const sections = [...document.querySelectorAll(".page-section")];
  const menu = document.getElementById("mainNav");
  const menuToggle = document.getElementById("menuToggle");
  const dropdown = document.querySelector(".nav-dropdown");
  const year = document.getElementById("currentYear");

  if (year) year.textContent = new Date().getFullYear();

  function showPage() {
    const requested = window.location.hash.replace("#", "") || "home";
    const pageExists = sections.some(section => section.id === requested);
    const pageId = pageExists ? requested : "home";

    sections.forEach(section => {
      section.classList.toggle("active", section.id === pageId);
    });

    document.querySelectorAll(".main-nav a").forEach(link => {
      link.classList.toggle("current", link.getAttribute("href") === `#${pageId}`);
    });

    if (menu) menu.classList.remove("open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    if (dropdown) dropdown.classList.remove("open");

    window.scrollTo({ top: 0, behavior: "instant" });
  }

  window.addEventListener("hashchange", showPage);
  showPage();

  if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
  }

  if (dropdown) {
    const dropdownButton = dropdown.querySelector(".dropdown-toggle");
    dropdownButton.addEventListener("click", () => {
      dropdown.classList.toggle("open");
    });
  }

  const regents = [
    ["Acting Chairman of the Board of Regents", "Dr. Robert Clark-Cole"],
    ["Vice Chairman of the Board of Regents", "Vacant"],
    ["Immediate Past Chairman of the Board of Regents", "Vacant"],
    ["Secretary of the Board of Regents", "Vacant"],
    ["Regent", "Dr. Eric Conyers"],
    ["Regent", "Vacant"],
    ["Regent", "Vacant"],
    ["Regent", "Vacant"],
    ["Regent", "Vacant"],
    ["Student Regent", "Vacant"]
  ];

  const leadership = [
    {
      title: "Executive Vice President & Chief Operating Officer",
      name: "Vacant",
      subroles: []
    },
    {
      title: "Provost & Vice President of Academic Affairs",
      name: "Vacant",
      subroles: [
        ["Associate VP of Institutional Research & Planning", "Vacant"]
      ]
    },
    {
      title: "Vice President of Student Affairs",
      name: "Vacant",
      subroles: []
    },
    {
      title: "Vice President of Enrollment Management",
      name: "Dr. Caleb A. Tate",
      subroles: [
        ["Associate VP of Student Recruitment", "Vacant"]
      ]
    },
    {
      title: "Vice President of Finance & Administration",
      name: "Vacant",
      subroles: [
        ["Associate VP of Campus Operations & Chief of Police", "Chief Robinson"]
      ]
    },
    {
      title: "Vice President of University Advancement",
      name: "Vacant",
      subroles: [
        ["Associate VP of Communications & Public Relations", "Vacant"]
      ]
    },
    {
      title: "Vice President of Athletics & Athletic Director",
      name: "Dr. Clarence T. McKinney",
      subroles: [
        ["Director of Bands", "Roderick Simmons"],
        ["Head Football Coach", "Vacant"],
        ["Head Men's Basketball Coach", "Vacant"],
        ["Head Women's Basketball Coach", "Vacant"],
        ["Head Baseball Coach", "Vacant"],
        ["Head Softball Coach", "Vacant"],
        ["Head Soccer Coach", "Vacant"]
      ]
    }
  ];

  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);

  const regentsContainer = document.getElementById("regentsDirectory");
  if (regentsContainer) {
    regentsContainer.innerHTML = regents.map((person, index) => `
      <article class="directory-card">
        <div class="directory-number">${String(index + 1).padStart(2, "0")}</div>
        <div>
          <h3>${escapeHTML(person[0])}</h3>
          <p class="${person[1] === "Vacant" ? "vacant" : ""}">${escapeHTML(person[1])}</p>
        </div>
      </article>
    `).join("");
  }

  const leadershipContainer = document.getElementById("leadershipDirectory");
  if (leadershipContainer) {
    leadershipContainer.innerHTML = leadership.map((office, index) => `
      <article class="leadership-unit">
        <div class="leadership-main">
          <div>
            <h3>${escapeHTML(office.title)}</h3>
            <p class="${office.name === "Vacant" ? "vacant" : ""}">${escapeHTML(office.name)}</p>
          </div>
          <span class="position-number">${String(index + 1).padStart(2, "0")}</span>
        </div>
        ${office.subroles.length ? `
          <div class="leadership-subroles">
            ${office.subroles.map(role => `
              <div class="subrole">
                <span>${escapeHTML(role[0])}</span>
                <span class="${role[1] === "Vacant" ? "vacant" : ""}">${escapeHTML(role[1])}</span>
              </div>
            `).join("")}
          </div>
        ` : ""}
      </article>
    `).join("");
  }

  const STORAGE_KEY = "tsuUniversityPublications";

  function readPosts() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  function formatDate(value) {
    if (!value) return "University Update";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "University Update";

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function renderNews(container, posts, limit = Infinity) {
    if (!container) return;

    const visiblePosts = [...posts]
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      })
      .slice(0, limit);

    if (!visiblePosts.length) {
      container.innerHTML = `<div class="empty-state">There are currently no published updates.</div>`;
      return;
    }

    container.innerHTML = visiblePosts.map(post => `
      <article class="news-card">
        <div class="news-meta">
          ${escapeHTML(post.type || "Announcement")}
          ${post.category ? ` / ${escapeHTML(post.category)}` : ""}
          ${post.pinned ? " / Featured" : ""}
        </div>
        <h3>${escapeHTML(post.title || "University Update")}</h3>
        <p>${escapeHTML(post.content || "")}</p>
        <div class="news-author">
          ${escapeHTML(post.author || "University Administration")}
          · ${formatDate(post.createdAt)}
        </div>
      </article>
    `).join("");
  }

  function updatePublications() {
    const posts = readPosts();
    renderNews(document.getElementById("publicNewsFeed"), posts);
    renderNews(document.getElementById("homeNewsFeed"), posts, 3);
  }

  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) updatePublications();
  });

  updatePublications();
});