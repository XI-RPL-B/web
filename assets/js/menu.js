// =========================================================
// MENU
// =========================================================

window.addEventListener("DOMContentLoaded", function () {

    const user = Auth.require();
    if (!user) return;

    document.getElementById("logoutBtn")
        .addEventListener("click", function (e) {

            e.preventDefault();

            if (confirm("Yakin ingin logout?")) {
                Auth.logout();
            }
        });
});
