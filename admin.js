document.addEventListener("DOMContentLoaded", () => {
  // DEMONSTRATION LOGIN ONLY.
  // Do not use client-side credentials for a production website.
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "tsu.edu";

  const STORAGE_KEY = "tsuUniversityPublications";
  const SESSION_KEY = "tsuAdminLoggedIn";

  const loginSection = document.getElementById("loginSection");
  const dashboardSection = document.getElementById("dashboardSection");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const logoutButton = document.getElementById("logoutButton");

  const postForm = document.getElementById("postForm");
  const postList = document.getElementById("adminPostList");
  const filterType = document.getElementById("filterType");
  const publishMessage = document.getElementById("publishMessage");

  const totalPosts = document.getElementById("totalPosts");
  const announcementCount = document.getElementById("announcementCount");
  const newsCount = document.getElementById("newsCount");

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  function getPosts() {
    try {
      const posts = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(posts) ? posts : [];
    } catch {
      return [];
    }
  }

  function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }

  function showLogin() {
    loginSection.style.display = "grid";
    dashboardSection.style.display = "none";
  }

  function showDashboard() {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    refreshDashboard();
  }

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  }

  if (isLoggedIn()) {
    showDashboard();
  } else {
    showLogin();
  }

  // LOGIN
  loginForm.addEventListener("submit", event => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      loginError.textContent = "";
      loginForm.reset();
      showDashboard();
    } else {
      loginError.textContent = "Your username or password is incorrect.";
    }
  });

  // LOGOUT
  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    showLogin();
  });

  // CREATE PUBLICATION
  postForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!isLoggedIn()) {
      showLogin();
      return;
    }

    const type = document.getElementById("postType").value;
    const title = document.getElementById("postTitle").value.trim();
    const category = document.getElementById("postCategory").value.trim();
    const author = document.getElementById("postAuthor").value.trim();
    const content = document.getElementById("postContent").value.trim();
    const pinned = document.getElementById("postPinned").checked;

    if (!title || !content) {
      publishMessage.textContent = "Please enter a title and publication content.";
      return;
    }

    const posts = getPosts();

    const newPost = {
      id: createPostId(),
      type,
      title,
      category: category || "University",
      author: author || "University Administration",
      content,
      pinned,
      createdAt: new Date().toISOString()
    };

    posts.unshift(newPost);
    savePosts(posts);

    postForm.reset();
    publishMessage.textContent = "Publication successfully added to this browser's website feed.";

    refreshDashboard();
  });

  function createPostId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  // FILTER PUBLICATIONS
  filterType.addEventListener("change", renderPostList);

  // DASHBOARD COUNTS
  function updateCounts(posts) {
    totalPosts.textContent = posts.length;

    announcementCount.textContent = posts.filter(
      post => post.type === "Announcement"
    ).length;

    newsCount.textContent = posts.filter(
      post => post.type === "News"
    ).length;
  }

  // PUBLICATION LIST
  function renderPostList() {
    const posts = getPosts();
    const selectedType = filterType.value;

    const filteredPosts = selectedType === "All"
      ? posts
      : posts.filter(post => post.type === selectedType);

    if (!filteredPosts.length) {
      postList.innerHTML = `
        <div class="empty-state">No publications found.</div>
      `;
      return;
    }

    postList.innerHTML = filteredPosts.map(post => `
      <article class="admin-post-item">
        <div class="admin-post-meta">
          ${escapeHTML(post.type || "Announcement")}
          ${post.pinned ? " · Featured" : ""}
          · ${escapeHTML(formatDate(post.createdAt))}
        </div>

        <h3>${escapeHTML(post.title || "Untitled Publication")}</h3>

        <p>${escapeHTML(post.content || "")}</p>

        <div class="admin-post-actions">
          <span class="admin-post-meta">
            ${escapeHTML(post.author || "University Administration")}
          </span>

          <button
            type="button"
            class="delete-post"
            data-delete-id="${escapeHTML(post.id)}"
          >
            Delete
          </button>
        </div>
      </article>
    `).join("");
  }

  // DELETE PUBLICATION
  postList.addEventListener("click", event => {
    const deleteButton = event.target.closest("[data-delete-id]");
    if (!deleteButton) return;

    if (!isLoggedIn()) {
      showLogin();
      return;
    }

    const postId = deleteButton.dataset.deleteId;

    const confirmed = window.confirm(
      "Are you sure you want to delete this publication?"
    );

    if (!confirmed) return;

    const updatedPosts = getPosts().filter(post => post.id !== postId);
    savePosts(updatedPosts);

    refreshDashboard();
  });

  function formatDate(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function refreshDashboard() {
    const posts = getPosts();
    updateCounts(posts);
    renderPostList();
  }

  // Refresh when another browser tab updates the publication list.
  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) {
      refreshDashboard();
    }
  });
});