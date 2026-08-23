// =========================================================
// NAVBAR BAWAH
// =========================================================
// Menu aktif ditentukan otomatis dari halaman yang dibuka.
// Penanda (pil) bergeser dengan transform agar mulus.
// =========================================================

window.addEventListener("DOMContentLoaded", function () {

    const navItems  = document.querySelectorAll(".nav-item");
    const indicator = document.querySelector(".bottom-nav .indicator");

    if (!navItems.length) return;

    const halaman = (
        window.location.pathname.split("/").pop() || "dashboard.html"
    ).toLowerCase();

    function setAktif(index) {

        navItems.forEach(function (nav, i) {
            nav.classList.toggle("active", i === index);
        });

        if (indicator) {
            // Arah geser (mendatar / menurun) ditentukan CSS,
            // supaya tata letak HP dan laptop bisa berbeda.
            indicator.style.opacity = "1";
            indicator.style.setProperty("--i", index);
        }
    }

    let aktif = -1;

    navItems.forEach(function (item, index) {

        const target = (item.getAttribute("href") || "").toLowerCase();

        if (target && target !== "#" && target === halaman) aktif = index;

        item.addEventListener("click", function () {
            setAktif(index);
        });
    });

    if (aktif === -1) {
        // Halaman di luar lima menu utama (mis. Data Siswa)
        if (indicator) indicator.style.opacity = "0";
        return;
    }

    setAktif(aktif);
});
