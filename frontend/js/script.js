let count = 0;

function addToCart(){
  count++;
  document.getElementById("cartCount").innerText = count;
}

function addPost(){
  let input = document.getElementById("postInput");
  if(input.value.trim() !== ""){
    let div = document.createElement("div");
    div.className = "card";
    div.innerText = input.value;
    document.getElementById("posts").appendChild(div);
    input.value = "";
  }
}

function login(){
  let u = document.getElementById("user").value;
  let p = document.getElementById("pass").value;

  if(u==="admin" && p==="1234"){
    document.getElementById("msg").innerText="Login Success";
  } else {
    document.getElementById("msg").innerText="Invalid Login";
  }
} 

document.addEventListener("DOMContentLoaded", function () {

  function setupFilter(toggleId, menuId, searchId, containerId, cardClass) {
    const toggleBtn = document.getElementById(toggleId);
    const menu = document.getElementById(menuId);
    const searchInput = document.getElementById(searchId);
    const container = document.getElementById(containerId);

    if (!toggleBtn || !menu || !searchInput || !container) return;

    const cards = container.querySelectorAll(cardClass);
    let currentCategory = "all";

    toggleBtn.addEventListener("click", () => {
      menu.style.display = menu.style.display === "flex" ? "none" : "flex";
    });

    menu.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") {
        currentCategory = e.target.dataset.category;
        toggleBtn.innerText = e.target.innerText + " ⏷";
        menu.style.display = "none";
        filter();
      }
    });

    searchInput.addEventListener("input", filter);

    function filter() {
      const keyword = searchInput.value.toLowerCase();

      cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        const category = card.dataset.category;

        const matchCategory = currentCategory === "all" || category === currentCategory;
        const matchSearch = text.includes(keyword);

        card.style.display = (matchCategory && matchSearch) ? "block" : "none";
      });
    }
  }

  setupFilter("filterToggle", "filterMenu", "searchInput", "courseList", ".course-card");

  setupFilter("bookFilterToggle", "bookFilterMenu", "bookSearch", "bookList", ".card");

});

document.addEventListener("DOMContentLoaded", function () {

  const postsContainer = document.getElementById("posts");

  if (postsContainer) {
    let posts = JSON.parse(localStorage.getItem("forumPosts")) || [];

    if (posts.length === 0) {
      posts = [
        {
          title: "How to learn HTML?",
          author: "Alice",
          replies: ["Start with basics", "Practice daily"]
        },
        {
          title: "Best database for project?",
          author: "Bob",
          replies: ["MySQL is good", "Try MongoDB"]
        }
      ];
      localStorage.setItem("forumPosts", JSON.stringify(posts));
    }

    renderPosts(posts);
  }
});


function renderPosts(posts) {
  const container = document.getElementById("posts");
  container.innerHTML = "";

  posts.forEach((post, index) => {
    const div = document.createElement("div");
    div.className = "card forum-post";

    div.innerHTML = `
      <h3>${post.title}</h3>
      <p>Posted by: ${post.author}</p>
    `;

    div.onclick = () => {
      localStorage.setItem("currentPostIndex", index);
      window.location.href = "replies.html";
    };

    container.appendChild(div);
  });
}


function addPost() {
  const titleInput = document.getElementById("postInput");
  const authorInput = document.getElementById("authorInput");

  if (titleInput.value.trim() === "" || authorInput.value.trim() === "") {
    alert("Please fill out this field");
    return;
  }

  let posts = JSON.parse(localStorage.getItem("forumPosts")) || [];

  const newPost = {
    title: titleInput.value,
    author: authorInput.value,
    replies: []
  };

  posts.push(newPost);
  localStorage.setItem("forumPosts", JSON.stringify(posts));

  titleInput.value = "";
  authorInput.value = "";

  renderPosts(posts);
}

document.addEventListener("DOMContentLoaded", function () {

  const postTitle = document.getElementById("postTitle");

  if (postTitle) {
    let posts = JSON.parse(localStorage.getItem("forumPosts")) || [];
    let index = localStorage.getItem("currentPostIndex");

    if (index === null) return;

    const post = posts[index];

    postTitle.innerText = post.title;

    document.getElementById("postAuthor").innerText = "Posted by: " + post.author;

    renderReplies(post.replies);
  }
});


function renderReplies(replies) {
  const container = document.getElementById("replyList");
  container.innerHTML = "";

  replies.forEach(reply => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerText = reply;
    container.appendChild(div);
  });
}


function addReply() {
  const replyInput = document.getElementById("replyInput");
  const authorInput = document.getElementById("replyAuthor");

  if (replyInput.value.trim() === "" || authorInput.value.trim() === "") {
    alert("Please fill out this field");
    return;
  }

  let posts = JSON.parse(localStorage.getItem("forumPosts")) || [];
  let index = localStorage.getItem("currentPostIndex");

  posts[index].replies.push(
    authorInput.value + ": " + replyInput.value
  );

  localStorage.setItem("forumPosts", JSON.stringify(posts));

  replyInput.value = "";
  authorInput.value = "";

  renderReplies(posts[index].replies);
}

function addToCart(name, price) {

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.push({ name: name, price: price });

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartCount();
}

function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let count = cart.length;

  const badge = document.getElementById("cartCount");
  if (badge) badge.innerText = count;
}

document.addEventListener("DOMContentLoaded", updateCartCount);

document.addEventListener("DOMContentLoaded", function () {

  const container = document.getElementById("cartItems");
  if (!container) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let total = 0;
  container.innerHTML = "";

  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerText = item.name + " - $" + item.price;
    container.appendChild(div);

    total += item.price;
  });

  document.getElementById("total").innerText = "Total: $" + total;
});

function checkout() {
  alert("Payment Successful!");
  localStorage.removeItem("cart");
  location.reload();
}

function clearCart() {
  localStorage.removeItem("cart");
  location.reload();
}