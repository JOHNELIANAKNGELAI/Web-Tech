// --- UTILITIES ---
const API_URL = "https://edu-learn-qwjp.onrender.com/api";

function getUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const badge = document.getElementById("cartCount");
  if (badge) badge.innerText = cart.length;
}

document.addEventListener("DOMContentLoaded", updateCartCount);

// --- GLOBAL PROFILE HANDLER ---
document.addEventListener("DOMContentLoaded", function () {
  const user = getUser();
  if (user) {
    const loginBtn = document.querySelector(".nav-actions a.btn");
    if (loginBtn) {
      const initial = user.name.charAt(0).toUpperCase();
      const firstName = user.name.split(' ')[0];
      
      loginBtn.innerHTML = `<div class="avatar-circle">${initial}</div> ${firstName}`;
      loginBtn.href = "#";
      loginBtn.className = "profile-btn";
      loginBtn.title = "Profile Settings";
      
      loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openSettingsModal(user);
      });
    }

  }
});

async function openSettingsModal(user) {
  if (document.getElementById('settingsModal')) {
    document.getElementById('settingsModal').style.display = 'flex';
    return;
  }

  const modalHtml = `
    <div id="settingsModal" class="modal-overlay">
      <div class="modal-content" style="max-width: 500px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h3>Profile Settings</h3>
          <button class="close-btn" onclick="document.getElementById('settingsModal').style.display='none'">&times;</button>
        </div>
        <div class="modal-body">
          <form id="updateProfileForm">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="updateName" class="form-control" value="${user.name}" required>
            </div>
            <button type="submit" class="btn btn-block" style="margin-top: 16px;">Save Changes</button>
            <div id="updateMessage" style="margin-top: 10px; text-align: center; font-size: 14px; font-weight: 500;"></div>
          </form>
          
          <hr style="margin: 24px 0; border: none; border-top: 1px solid var(--border-color);">
          
          <h3 style="margin-bottom: 16px; color: var(--primary-blue);">🎓 My Grades</h3>
          <div id="myGradesList" style="margin-bottom: 24px;">
            <p style="color: var(--text-light); text-align: center;">Loading grades...</p>
          </div>

          <hr style="margin: 24px 0; border: none; border-top: 1px solid var(--border-color);">
          <button id="logoutBtn" class="btn btn-outline btn-block" style="color: var(--error-color); border-color: var(--error-color); justify-content: center; width: 100%;">Log Out</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Fetch Grades
  try {
    const response = await fetch(`${API_URL}/grades/${user.id}?_t=` + new Date().getTime());
    const grades = await response.json();
    const gradesContainer = document.getElementById("myGradesList");
    
    if (grades.length === 0) {
      gradesContainer.innerHTML = '<p style="color: var(--text-light); text-align: center; font-size: 14px;">No quizzes taken yet.</p>';
    } else {
      let gradesHtml = '<div style="display: flex; flex-direction: column; gap: 12px;">';
      grades.forEach(g => {
        let gradeColor = g.grade >= 80 ? 'var(--success-color)' : (g.grade >= 50 ? 'orange' : 'var(--error-color)');
        gradesHtml += `
          <div style="background: #F8FAFC; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="display: block; font-size: 14px; color: var(--text-dark);">${g.course_title}</strong>
              <span style="font-size: 12px; color: var(--text-light);">${new Date(g.timestamp).toLocaleDateString()}</span>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 16px; font-weight: bold; color: ${gradeColor};">${g.grade.toFixed(0)}%</div>
              <div style="font-size: 12px; color: var(--text-light);">${g.score} / ${g.total} Correct</div>
            </div>
          </div>
        `;
      });
      gradesHtml += '</div>';
      gradesContainer.innerHTML = gradesHtml;
    }
  } catch (err) {
    document.getElementById("myGradesList").innerHTML = '<p style="color: var(--error-color); text-align: center; font-size: 14px;">Failed to load grades.</p>';
  }

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart"); // clear cart on logout
    window.location.reload();
  });

  document.getElementById("updateProfileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newName = document.getElementById("updateName").value;
    const msgDiv = document.getElementById("updateMessage");
    
    try {
      const response = await fetch(`${API_URL}/update_profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, name: newName })
      });
      const data = await response.json();
      if (data.success) {
        msgDiv.style.color = "var(--success-color)";
        msgDiv.innerText = "Profile updated! Reloading...";
        user.name = newName;
        localStorage.setItem("user", JSON.stringify(user));
        setTimeout(() => window.location.reload(), 1000);
      } else {
        msgDiv.style.color = "var(--error-color)";
        msgDiv.innerText = data.message || "Error updating profile.";
      }
    } catch (err) {
      msgDiv.style.color = "var(--error-color)";
      msgDiv.innerText = "Failed to connect to server.";
    }
  });
}

// --- AUTH PAGES ---
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;
      const msgDiv = document.getElementById("loginMessage");

      try {
        const response = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
          msgDiv.style.color = "var(--success-color)";
          msgDiv.innerText = "Login successful! Redirecting...";
          localStorage.setItem("user", JSON.stringify(data.user));
          setTimeout(() => { window.location.href = "index.html"; }, 1000);
        } else {
          msgDiv.style.color = "var(--error-color)";
          msgDiv.innerText = data.message || "Invalid login";
        }
      } catch (err) {
        msgDiv.style.color = "var(--error-color)";
        msgDiv.innerText = "Failed to connect to server.";
      }
    });
  }

  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("signupName").value;
      const email = document.getElementById("signupEmail").value;
      const password = document.getElementById("signupPassword").value;
      const msgDiv = document.getElementById("signupMessage");

      try {
        const response = await fetch(`${API_URL}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (data.success) {
          msgDiv.style.color = "var(--success-color)";
          msgDiv.innerText = "Account created! Redirecting to login...";
          setTimeout(() => { window.location.href = "login.html"; }, 1000);
        } else {
          msgDiv.style.color = "var(--error-color)";
          msgDiv.innerText = data.message || "Error creating account";
        }
      } catch (err) {
        msgDiv.style.color = "var(--error-color)";
        msgDiv.innerText = "Failed to connect to server.";
      }
    });
  }
});

// --- DYNAMIC PAGE ROUTING ---
document.addEventListener("DOMContentLoaded", function () {
  const path = window.location.pathname;
  
  if (path.includes("courses.html")) {
    loadCourses();
  } else if (path.includes("course_content.html")) {
    loadCourseContent();
  } else if (path.includes("forum.html")) {
    loadForum();
  } else if (path.includes("replies.html")) {
    loadReplies();
  } else if (path.includes("bookstore.html")) {
    loadBooks();
  } else if (path.includes("purchases.html")) {
    loadCartAndPurchases();
  }
});

// --- COURSES ---
async function loadCourses() {
  const container = document.querySelector(".grid");
  if (!container) return;
  
  try {
    const response = await fetch(`${API_URL}/courses?_t=` + new Date().getTime());
    const courses = await response.json();
    
    const searchInput = document.getElementById("courseSearchInput");
    const categorySelect = document.getElementById("courseCategorySelect");
    
    function render() {
      const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
      const selectedCategory = categorySelect ? categorySelect.value : "All";
      
      const filtered = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm) || c.instructor.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });
      
      container.innerHTML = "";
      filtered.forEach(c => {
        container.innerHTML += `
          <div class="card course-card" data-category="${c.category}" style="cursor: pointer;" onclick="openCourse(${c.id}, '${c.title.replace(/'/g, "\\'")}', '${c.instructor.replace(/'/g, "\\'")}')">
            <div class="course-image">${c.image_icon}</div>
            <div class="course-content">
              <div class="course-tags">
                <span class="tag">${c.category}</span>
              </div>
              <h3>${c.title}</h3>
              <p>${c.instructor}</p>
              <div class="course-meta">
                <span>👥 ${c.students} students</span>
                <span>⏱ ${c.weeks} weeks</span>
              </div>
            </div>
          </div>
        `;
      });
      
      const countEl = document.querySelector(".page-container > p");
      if(countEl) countEl.innerText = `Showing ${filtered.length} of ${courses.length} courses`;
    }
    
    if (searchInput) searchInput.addEventListener("input", render);
    if (categorySelect) categorySelect.addEventListener("change", render);
    
    render();
  } catch (e) {
    console.error("Failed to load courses");
  }
}

function openCourse(id, title, instructor) {
  const user = getUser();
  if(!user) {
    alert("Please log in to access course materials.");
    return window.location.href = "login.html";
  }
  localStorage.setItem("currentCourse", JSON.stringify({ id, title, instructor }));
  window.location.href = "course_content.html";
}

// --- COURSE CONTENT ---
async function loadCourseContent() {
  const course = JSON.parse(localStorage.getItem("currentCourse"));
  if (!course) return window.location.href = "courses.html";
  
  document.getElementById("contentCourseTitle").innerText = course.title;
  document.getElementById("contentCourseInstructor").innerText = "Instructed by " + course.instructor;
  
  try {
    const courseRes = await fetch(`${API_URL}/courses/${course.id}?_t=` + new Date().getTime());
    const courseData = await courseRes.json();
    
    const quizRes = await fetch(`${API_URL}/quizzes/${course.id}?_t=` + new Date().getTime());
    const quizzes = await quizRes.json();
    
    window.currentCourseData = courseData;
    window.currentQuizzes = quizzes;
    
    const sidebar = document.getElementById("moduleList");
    if(sidebar) {
      sidebar.innerHTML = `
        <div class="module-item active" onclick="switchModule(0)">
          <div class="module-icon">▶️</div>
          <div>Interactive Video</div>
        </div>
        <div class="module-item" onclick="switchModule(1)">
          <div class="module-icon">📄</div>
          <div>Lecture Notes</div>
        </div>
        <div class="module-item" onclick="switchModule(2)">
          <div class="module-icon">📝</div>
          <div>Course Quiz</div>
        </div>
      `;
    }
    
    switchModule(0);
  } catch (e) {
    console.error("Failed to load course details");
  }
}

window.switchModule = function(index) {
  const items = document.querySelectorAll('.module-item');
  if(items.length > 0) {
    items.forEach(el => el.classList.remove('active'));
    if(items[index]) items[index].classList.add('active');
  }
  
  const container = document.getElementById("mainContentArea");
  if(!container) return;
  
  const course = window.currentCourseData;
  const quizzes = window.currentQuizzes;
  
  if (index === 0) {
    container.innerHTML = `
      <h2 style="margin-top: 0;">Interactive Video Lesson</h2>
      <div style="width: 100%; background: #0F172A; border-radius: 12px; margin-bottom: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
        <video controls style="width: 100%; display: block; max-height: 450px;">
          <source src="${course.video_url || 'videos/cs_intro.mp4'}" type="video/mp4">
          Your browser does not support HTML5 video.
        </video>
      </div>
    `;
  } else if (index === 1) {
    container.innerHTML = `
      <h2 style="margin-top: 0;">Lecture Notes</h2>
      <div class="notes-section" style="background: #F8FAFC; padding: 32px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);">
        ${course.notes || "<p>No notes available.</p>"}
      </div>
    `;
  } else if (index === 2) {
    let quizHtml = "";
    if (quizzes && quizzes.length > 0) {
      quizHtml += `<div class='quiz-card' id='quizContainer'>
        <h3 style="margin-top:0; color: var(--primary-blue);">Course Quiz</h3>
        <p>Answer the following ${quizzes.length} questions to get your grade.</p>
        <form id="quizForm">`;
        
      quizzes.forEach((q, i) => {
        quizHtml += `
          <h4 style="margin-top: 24px; margin-bottom: 12px;">Q${i+1}: ${q.question}</h4>
        `;
        q.options.forEach(opt => {
          quizHtml += `
            <label style='display:block; margin-bottom: 8px; cursor: pointer;'>
              <input type='radio' name='q_${q.id}' value='${opt}' required> ${opt}
            </label>
          `;
        });
      });
      
      quizHtml += `
          <button type="submit" class='btn' style='margin-top: 24px; width: 100%;'>Submit Answers</button>
        </form>
      </div>`;
    } else {
      quizHtml = `<div class='quiz-card'><p>No quizzes available for this course yet.</p></div>`;
    }
    
    container.innerHTML = quizHtml;

    const quizForm = document.getElementById("quizForm");
    if (quizForm) {
      quizForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const user = getUser();
        if (!user) {
          alert("Please log in to submit the quiz.");
          return;
        }
        
        const formData = new FormData(quizForm);
        const answers = {};
        for (let [key, value] of formData.entries()) {
          const qId = key.replace('q_', '');
          answers[qId] = value;
        }
        
        try {
          const response = await fetch(`${API_URL}/quizzes/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.id,
              course_id: course.id,
              answers: answers
            })
          });
          const result = await response.json();
          
          if (result.success) {
            document.getElementById('quizContainer').innerHTML = `
              <div style="text-align:center; padding: 20px;">
                <h3 style="color: var(--success-color);">Quiz Submitted Successfully!</h3>
                <p style="font-size: 24px; font-weight: bold;">Your Score: ${result.score} / ${result.total}</p>
                <p style="font-size: 18px;">Grade: ${result.grade.toFixed(2)}%</p>
                <p style="color: var(--text-light); margin-top: 16px;">This grade has been saved to your student profile.</p>
              </div>
            `;
          } else {
            alert("Error submitting quiz: " + result.message);
          }
        } catch (err) {
          alert("Failed to submit quiz.");
        }
      });
    }
  }
};

// --- FORUM ---
async function loadForum() {
  const container = document.querySelector(".forum-list");
  if (!container) return;
  
  // Create New Post UI
  const newPostHtml = `
    <div class="card" style="margin-bottom: 24px;">
      <h3>Create New Discussion</h3>
      <input type="text" id="postTitle" class="form-control" placeholder="Discussion Title" style="margin-bottom: 12px;">
      <textarea id="postContent" class="form-control" placeholder="What's on your mind?" style="margin-bottom: 12px; height: 100px; resize: vertical;"></textarea>
      <button class="btn" onclick="submitForumPost()">Post Discussion</button>
    </div>
  `;
  container.insertAdjacentHTML('beforebegin', newPostHtml);

  // Load Posts
  try {
    const response = await fetch(`${API_URL}/forum?_t=` + new Date().getTime());
    const posts = await response.json();
    container.innerHTML = "";
    posts.forEach(p => {
      container.innerHTML += `
        <div class="forum-card" style="cursor: pointer; position: relative;" onclick="viewPost(${p.id})">
          <div class="forum-header" style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;">${p.title}</h3>
            <span style="font-size: 14px; color: var(--primary-blue); font-weight: bold;">View & Reply ➔</span>
          </div>
          <div class="forum-body" style="margin: 12px 0;">${p.content}</div>
          <div class="forum-meta">
            <div class="avatar" style="background: var(--primary-blue);">${p.author.charAt(0).toUpperCase()}</div>
            <span>${p.author}</span>
            <span class="meta-divider">•</span>
            <span>${new Date(p.timestamp).toLocaleString()}</span>
          </div>
        </div>
      `;
    });
  } catch (e) {
    console.error("Failed to load forum");
  }
}

async function submitForumPost() {
  const user = getUser();
  if (!user) {
    alert("Please log in to post.");
    return window.location.href = "login.html";
  }
  
  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;
  
  if (!title || !content) return alert("Fields cannot be empty.");
  
  await fetch(`${API_URL}/forum`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: user.id, title, content })
  });
  
  window.location.reload();
}

function viewPost(id) {
  localStorage.setItem("currentPostId", id);
  window.location.href = "replies.html";
}

// --- REPLIES ---
async function loadReplies() {
  const postId = localStorage.getItem("currentPostId");
  if (!postId) return window.location.href = "forum.html";
  
  try {
    const response = await fetch(`${API_URL}/forum/${postId}?_t=` + new Date().getTime());
    const post = await response.json();
    
    const titleEl = document.getElementById("replyTitle");
    const metaEl = document.getElementById("replyMeta");
    if(titleEl) titleEl.innerText = post.title;
    if(metaEl) metaEl.innerText = `Posted by ${post.author} on ${new Date(post.timestamp).toLocaleString()}`;

    const container = document.querySelector(".reply-list") || createReplyContainer();
    
    container.innerHTML = `<div class="card" style="background: #EFF6FF; border: 1px solid #BFDBFE; margin-bottom: 24px;"><strong>Original Post:</strong><br><br>${post.content}</div>`;
    
    post.replies.forEach(r => {
      container.innerHTML += `
        <div class="forum-card">
          <div class="forum-body">${r.content}</div>
          <div class="forum-meta" style="margin-top: 12px;">
            <div class="avatar" style="background: var(--primary-blue);">${r.author.charAt(0).toUpperCase()}</div>
            <span>${r.author}</span>
            <span class="meta-divider">•</span>
            <span>${new Date(r.timestamp).toLocaleString()}</span>
          </div>
        </div>
      `;
    });
    
    // Add Reply Box
    container.innerHTML += `
      <div class="card" style="margin-top: 24px;">
        <h3>Add a Reply</h3>
        <textarea id="replyContent" class="form-control" placeholder="Write a reply..." style="height: 100px; margin-bottom: 12px; resize: vertical;"></textarea>
        <button class="btn" onclick="submitReply(${postId})">Post Reply</button>
      </div>
    `;
    
  } catch (e) {
    console.error("Failed to load replies");
  }
}

function createReplyContainer() {
  const div = document.createElement("div");
  div.className = "reply-list";
  document.querySelector(".page-container").appendChild(div);
  return div;
}

async function submitReply(postId) {
  const user = getUser();
  if (!user) {
    alert("Please log in to reply.");
    return window.location.href = "login.html";
  }
  const content = document.getElementById("replyContent").value;
  if (!content) return alert("Reply cannot be empty.");
  
  await fetch(`${API_URL}/forum/${postId}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: user.id, content })
  });
  
  window.location.reload();
}

// --- BOOKSTORE MARKETPLACE ---
async function loadBooks() {
  const container = document.querySelector(".grid");
  if (!container) return;
  
  // Add Sell Button
  const header = document.querySelector(".page-header");
  const user = getUser();
  if (user && header) {
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    if(!document.querySelector(".sell-btn")) {
      header.innerHTML += `<button class="btn sell-btn" onclick="openSellModal()">+ Sell a Book</button>`;
    }
  }

  try {
    const user = getUser();
    const url = user ? `${API_URL}/books?user_id=${user.id}&_t=` + new Date().getTime() : `${API_URL}/books?_t=` + new Date().getTime();
    const response = await fetch(url);
    const books = await response.json();
    
    const searchInput = document.getElementById("bookSearchInput");
    const categorySelect = document.getElementById("bookCategorySelect");
    
    if (categorySelect) {
      const categories = [...new Set(books.map(b => b.category))];
      categorySelect.innerHTML = `<option value="All">All Categories</option>`;
      categories.forEach(c => {
        categorySelect.innerHTML += `<option value="${c}">${c}</option>`;
      });
    }
    
    function render() {
      const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
      const selectedCategory = categorySelect ? categorySelect.value : "All";
      
      const filtered = books.filter(b => {
        const matchesSearch = b.title.toLowerCase().includes(searchTerm) || b.seller_name.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === "All" || b.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

      container.innerHTML = "";
      filtered.forEach(b => {
        const isFree = b.price === 0;
        const canRead = b.is_purchased;
        
        let actionButton = `<button class="btn" onclick="addToCart(${b.id}, '${b.title.replace(/'/g, "\\'")}', ${b.price}, '${b.image_url}')">Add to Cart</button>`;
        if (canRead) {
          actionButton = `<button class="btn" style="background: var(--success-color);" onclick="readBook(${b.id})">Read Now</button>`;
        }

        container.innerHTML += `
          <div class="card">
            <div class="book-cover" style="background-image: url('${b.image_url}'); height: 200px; background-size: cover; background-position: center; border-radius: 8px 8px 0 0;"></div>
            <div class="book-content" style="padding: 16px;">
              <div class="course-tags" style="margin-bottom: 8px;">
                <span class="tag">${b.category}</span>
              </div>
              <h3 style="font-size: 16px; margin: 0 0 4px;">${b.title}</h3>
              <p style="color: var(--text-light); font-size: 13px; margin: 0 0 12px;">Seller: ${b.seller_name}</p>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="book-price" style="font-weight: 700; font-size: 18px; color: var(--primary-blue);">
                  ${isFree ? 'FREE' : '$' + b.price.toFixed(2)}
                  ${canRead && !isFree ? '<span style="font-size: 11px; color: var(--success-color); margin-left: 4px;">(PAID)</span>' : ''}
                </div>
                ${actionButton}
              </div>
            </div>
          </div>
        `;
      });
      document.querySelector(".page-container > p").innerText = `Showing ${filtered.length} of ${books.length} books`;
    }
    
    if (searchInput) searchInput.addEventListener("input", render);
    if (categorySelect) categorySelect.addEventListener("change", render);
    
    render();
  } catch (e) {
    console.error("Failed to load books");
  }
}

function addToCart(id, title, price, image_url) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push({ id, title, price, image_url });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(`${title} added to cart!`);
}

async function readBook(bookId) {
  const user = getUser();
  const userIdParam = user ? `?user_id=${user.id}` : '';
  try {
    const response = await fetch(`${API_URL}/books/${bookId}/content${userIdParam}`);
    const result = await response.json();
    
    if (result.success) {
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; padding: 40px; text-align: left;">
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
          <h2 style="margin-bottom: 24px; border-bottom: 2px solid var(--primary-blue); padding-bottom: 12px;">Book Reader</h2>
          <div style="font-size: 18px; line-height: 1.8; color: var(--text-dark); font-family: 'Georgia', serif;">
            ${result.content}
          </div>
          <div style="margin-top: 40px; text-align: center;">
            <button class="btn" onclick="this.closest('.modal-overlay').remove()">Close Reader</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      alert(result.message);
    }
  } catch (err) {
    alert("Failed to open book reader.");
  }
}

function openSellModal() {
  if (document.getElementById('sellModal')) {
    document.getElementById('sellModal').style.display = 'flex';
    return;
  }
  
  const modalHtml = `
    <div id="sellModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Sell a Book</h3>
          <button class="close-btn" onclick="document.getElementById('sellModal').style.display='none'">&times;</button>
        </div>
        <form id="sellBookForm">
          <div class="form-group"><input type="text" id="bookTitle" class="form-control" placeholder="Book Title" required></div>
          <div class="form-group"><input type="number" id="bookPrice" step="0.01" class="form-control" placeholder="Price ($)" required></div>
          <div class="form-group"><input type="text" id="bookCategory" class="form-control" placeholder="Category (e.g., Mathematics)" required></div>
          <div class="form-group"><input type="url" id="bookImage" class="form-control" placeholder="Image URL (optional)"></div>
          <button type="submit" class="btn btn-block">List Book for Sale</button>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  document.getElementById("sellBookForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = getUser();
    const defaultImage = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";
    await fetch(`${API_URL}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seller_id: user.id,
        title: document.getElementById("bookTitle").value,
        price: parseFloat(document.getElementById("bookPrice").value),
        category: document.getElementById("bookCategory").value,
        image_url: document.getElementById("bookImage").value || defaultImage
      })
    });
    window.location.reload();
  });
}

// --- CART & PURCHASES ---
async function loadCartAndPurchases() {
  const cartContainer = document.querySelector(".cart-items");
  if (!cartContainer) return;
  
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = 0;
  cartContainer.innerHTML = "";
  
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px;">
        <p style="color: var(--text-light); font-size: 16px;">Your cart is empty.</p>
        <a href="bookstore.html" class="btn" style="margin-top: 16px;">Browse Bookstore</a>
      </div>
    `;
    updateOrderSummary(0);
  } else {
    cart.forEach((item, index) => {
      cartContainer.innerHTML += `
        <div class="cart-item">
          <div class="cart-item-image" style="background-image: url('${item.image_url}');"></div>
          <div class="cart-item-details">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <h3 class="cart-item-title">${item.title}</h3>
              <div style="font-weight: 700; font-size: 18px;">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            <div class="cart-item-actions">
              <button class="remove-btn" onclick="removeFromCart(${index})">🗑 Remove</button>
            </div>
          </div>
        </div>
      `;
      total += item.price;
    });
    updateOrderSummary(total);
  }
  
  // Fetch and show purchase history
  const user = getUser();
  if (user) {
    try {
      const response = await fetch(`${API_URL}/purchases/${user.id}`);
      const purchases = await response.json();
      
      const pageContainer = document.querySelector(".page-container");
      
      if (purchases.length > 0) {
        let historyHtml = `
          <h2 style="margin-top: 48px; margin-bottom: 24px;">Your Purchase History</h2>
          <div class="grid" style="grid-template-columns: repeat(3, 1fr);">
        `;
        
        purchases.forEach(p => {
          historyHtml += `
            <div class="card" style="display: flex; gap: 16px; align-items: center; justify-content: space-between; padding: 12px;">
              <div style="display: flex; gap: 16px; align-items: center;">
                <div style="width: 50px; height: 70px; background-image: url('${p.image_url}'); background-size: cover; border-radius: 4px;"></div>
                <div>
                  <h4 style="margin: 0 0 2px; font-size: 14px;">${p.title}</h4>
                  <div style="color: var(--text-light); font-size: 11px;">Purchased: ${new Date(p.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
              <button class="btn" style="padding: 6px 12px; font-size: 12px; background: var(--success-color);" onclick="readBook(${p.book_id})">Read</button>
            </div>
          `;
        });
        
        historyHtml += `</div>`;
        pageContainer.insertAdjacentHTML('beforeend', historyHtml);
      }
    } catch (e) {
      console.error("Failed to load history");
    }
  }
}

function updateOrderSummary(subtotal) {
  const tax = subtotal * 0.08;
  const shipping = subtotal > 0 && subtotal < 100 ? 9.99 : 0;
  const total = subtotal > 0 ? subtotal + tax + shipping : 0;
  
  const summaryBox = document.querySelector(".order-summary");
  if (!summaryBox) return;
  
  summaryBox.innerHTML = `
    <h3>Order Summary</h3>
    <div class="summary-row">
      <span>Subtotal</span>
      <span>$${subtotal.toFixed(2)}</span>
    </div>
    <div class="summary-row">
      <span>Tax (8%)</span>
      <span>$${tax.toFixed(2)}</span>
    </div>
    <div class="summary-row">
      <span>Shipping</span>
      <span>${shipping === 0 ? "Free" : "$" + shipping.toFixed(2)}</span>
    </div>
    <div class="summary-row total">
      <span>Total</span>
      <span>$${total.toFixed(2)}</span>
    </div>
    <button class="btn btn-block" style="font-size: 16px; padding: 14px;" onclick="checkout()" ${total === 0 ? 'disabled' : ''}>Proceed to Checkout</button>
    <div class="free-shipping-text">Free shipping on orders over $100</div>
  `;
}

function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  window.location.reload();
}

async function checkout() {
  const user = getUser();
  if (!user) {
    alert("Please log in to purchase.");
    return window.location.href = "login.html";
  }
  
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) return alert("Cart is empty");
  
  const book_ids = cart.map(item => item.id);
  
  try {
    const response = await fetch(`${API_URL}/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, book_ids })
    });
    
    if (response.ok) {
      alert("Payment Successful!");
      localStorage.removeItem("cart");
      window.location.reload();
    } else {
      alert("Checkout failed. Please try again.");
    }
  } catch (err) {
    alert("Checkout failed due to connection error.");
  }
}

// --- END OF SCRIPT ---
