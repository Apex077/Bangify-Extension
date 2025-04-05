document.addEventListener("DOMContentLoaded", () => {
    const bangList = document.getElementById("bang-list");
    const addBangBtn = document.getElementById("add-bang");
    const bangKeyInput = document.getElementById("bang-key");
    const bangUrlInput = document.getElementById("bang-url");
    const toggleThemeBtn = document.getElementById("toggle-theme");

    // Function to load and display custom bangs
    function loadBangs() {
        browser.storage.sync.get("customBangs").then((data) => {
            const customBangs = data.customBangs || {};
            bangList.innerHTML = "";

            for (const [bang, url] of Object.entries(customBangs)) {
                const li = document.createElement("li");
                li.innerHTML = `<strong>${bang}</strong> → ${url} 
                          <button class="delete" data-bang="${bang}">❌</button>`;
                bangList.appendChild(li);
            }

            document.querySelectorAll(".delete").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    const bangToRemove = e.target.dataset.bang;
                    delete customBangs[bangToRemove];
                    browser.storage.sync.set({ customBangs }).then(loadBangs);
                });
            });
        });
    }

    // Function to update the theme icon based on the current theme
    function updateThemeIcon(theme) {
        const sunIcon = document.getElementById("sun-icon");
        const moonIcon = document.getElementById("moon-icon");
        sunIcon.style.display = theme === "light" ? "block" : "none";
        moonIcon.style.display = theme === "dark" ? "block" : "none";
    }

    // Event listener for adding a new custom bang
    addBangBtn.addEventListener("click", () => {
        const bang = bangKeyInput.value.trim();
        const url = bangUrlInput.value.trim();

        if (bang && url) {
            browser.storage.sync.get("customBangs").then((data) => {
                const customBangs = data.customBangs || {};
                customBangs[bang] = url;
                browser.storage.sync.set({ customBangs }).then(() => {
                    bangKeyInput.value = "";
                    bangUrlInput.value = "";
                    loadBangs();
                });
            });
        }
    });

    // Event listener for toggling the theme
    toggleThemeBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const nextTheme = currentTheme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", nextTheme);
        browser.storage.local.set({ theme: nextTheme });
        updateThemeIcon(nextTheme);
    });

    // On load, set the default theme to dark and update the icon
    browser.storage.local.get("theme").then((data) => {
        const theme = data.theme || "dark"; // Default to dark theme
        document.documentElement.setAttribute("data-theme", theme);
        updateThemeIcon(theme);
    });

    loadBangs();
});
