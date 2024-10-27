window.addEventListener("scroll", () => {
    const header = document.getElementById("header");
    const scrollPosition = window.scrollY;

    if (scrollPosition > 0) {
        header.classList.add("border-b");
    } else {
        header.classList.remove("border-b");
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
        // CLOSE CASE
        searchIconInner.classList.remove("bx-left-arrow-alt");
        searchIconInner.classList.add("bx-search");
        cartIcon.classList.remove("hidden");

        if (signInBtn) signInBtn.classList.remove("hidden"); // Check if sign-in button exists
        searchBtn.classList.add("hidden");

        if (currentUserAvatar) currentUserAvatar.classList.remove("hidden");
    } else {
        // OPEN
        searchIconInner.classList.remove("bx-search");
        searchIconInner.classList.add("bx-left-arrow-alt");
        cartIcon.classList.add("hidden"); // Hide cart icon

        if (signInBtn) signInBtn.classList.add("hidden"); // Check if sign-in button exists
        if (currentUserAvatar) {
            currentUserAvatar.classList.add("hidden"); // Hide avatar only if it exists
        }

        searchInput.focus();
        searchBtn.classList.remove("hidden");
    }
});
