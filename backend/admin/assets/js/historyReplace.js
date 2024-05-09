// stupid hack
document.addEventListener("DOMContentLoaded", (e) => {
    const menuTags = document.querySelectorAll("nav>ul>li>a");

    menuTags.forEach((el) => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            location.replace(e.target.href);
        });
    });
});
