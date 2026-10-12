const hamburgerBtn = document.getElementById("hamburger-btn");
const navLinks = document.getElementById("nav-links");

// Di halaman login, kedua elemen ini gak ada.
// Guard biar gak error.
if (hamburgerBtn && navLinks) {
  hamburgerBtn.addEventListener("click", () => {
    const sedangTerbuka = navLinks.classList.toggle("nav-open");
    hamburgerBtn.classList.toggle("open", sedangTerbuka);
    hamburgerBtn.setAttribute("aria-expanded", sedangTerbuka);
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("nav-open");
      hamburgerBtn.classList.remove("open");
      hamburgerBtn.setAttribute("aria-expanded", "false");
    });
  });
}