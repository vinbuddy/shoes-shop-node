window.addEventListener("scroll", () => {
    const header = document.getElementById("header");
    const scrollPosition = window.scrollY;

    if (scrollPosition > 0) {
        header.classList.add("backdrop-blur");
        header.classList.add("bg-white/30");
    } else {
        header.classList.remove("backdrop-blur");
        header.classList.remove("bg-white/30");
    }
});

const currentUserAvatar = document.getElementById("current-user-avatar");
const searchIcon = document.getElementById("search-icon");
const searchInput = document.getElementById("search-input");
const cartIcon = document.getElementById("cart-icon");
const searchIconInner = document.getElementById("search-icon-inner");

const signInBtn = document.getElementById("sign-in-btn");
const searchBtn = document.getElementById("search-btn");

searchIcon.addEventListener("click", () => {
    // Toggle visibility of the search input
    searchInput.classList.toggle("hidden");

    if (searchInput.classList.contains("hidden")) {
        // Open
        searchIconInner.classList.remove("bx-left-arrow-alt");
        searchIconInner.classList.add("bx-search");
        cartIcon.classList.remove("hidden");

        signInBtn.classList.remove("hidden");
        currentUserAvatar.classList.remove("hidden");

        searchBtn.classList.add("hidden");
    } else {
        // Close
        searchIconInner.classList.remove("bx-search");
        searchIconInner.classList.add("bx-left-arrow-alt");
        cartIcon.classList.add("hidden"); // Hide cart icon
        searchInput.focus();

        signInBtn.classList.add("hidden");
        currentUserAvatar.classList.add("hidden");
        searchBtn.classList.remove("hidden");
    }
});
