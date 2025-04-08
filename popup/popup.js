document.addEventListener("DOMContentLoaded", () => {
    const bangList = document.getElementById("bang-list");
    const addBangBtn = document.getElementById("add-bang");
    const bangKeyInput = document.getElementById("bang-key");
    const bangUrlInput = document.getElementById("bang-url");
    const toggleThemeBtn = document.getElementById("toggle-theme");
    const errorMessage = document.getElementById("error-message");

    function validateInputs() {
        const bang = bangKeyInput.value.trim();
        const url = bangUrlInput.value.trim();

        let error = "";

        if (!bang.startsWith("!")) {
            error = "Bang must start with '!'.";
        } else if (/\s/.test(bang)) {
            error = "Bang cannot contain spaces.";
        } else if (!/^https?:\/\/.+/.test(url)) {
            error = "URL must start with http:// or https://";
        } else if (!url.includes("{query}")) {
            error = "URL must include '{query}' where the search goes.";
        }

        if (error) {
            errorMessage.textContent = error;
            addBangBtn.disabled = true;
        } else {
            errorMessage.textContent = "";
            addBangBtn.disabled = false;
        }
    }

    bangKeyInput.addEventListener("input", validateInputs);
    bangUrlInput.addEventListener("input", validateInputs);

    function loadBangs() {
        browser.storage.sync.get("customBangs").then((data) => {
            const customBangs = data.customBangs || {};
            bangList.innerHTML = "";

            const entries = Object.entries(customBangs);

            if (entries.length === 0) {
                const emptyMsg = document.createElement("li");
                emptyMsg.textContent = "No custom bangs added yet.";
                emptyMsg.className = "empty-msg";
                bangList.appendChild(emptyMsg);
                return;
            }

            for (const [bang, url] of entries) {
                const li = document.createElement("li");
                li.innerHTML = `
                    <div class="bang-item">
                        <span class="bang-key">${bang}</span>
                        <span class="bang-url" title="${url}">${url}</span>
                        <button class="delete" data-bang="${bang}" title="Delete this bang">
                            <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 0 24 24" fill="white">
                                <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7a1 1 0 10-1.41 1.41L10.59 12l-4.89 4.89a1 1 0 101.41 1.41L12 13.41l4.89 4.89a1 1 0 001.41-1.41L13.41 12l4.89-4.89a1 1 0 000-1.4z"/>
                            </svg>
                        </button>
                    </div>`;
                bangList.appendChild(li);
            }

            document.querySelectorAll(".delete").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    const bangToRemove = e.currentTarget.dataset.bang;
                    browser.storage.sync.get("customBangs").then((data) => {
                        const customBangs = data.customBangs || {};
                        delete customBangs[bangToRemove];
                        browser.storage.sync.set({ customBangs }).then(loadBangs);
                    });
                });
            });
        });
    }

    addBangBtn.addEventListener("click", () => {
        const bang = bangKeyInput.value.trim();
        const url = bangUrlInput.value.trim();

        browser.storage.sync.get("customBangs").then((data) => {
            const customBangs = data.customBangs || {};

            if (customBangs[bang]) {
                const confirmOverwrite = confirm(`Bang "${bang}" already exists. Overwrite?`);
                if (!confirmOverwrite) return;
            }

            customBangs[bang] = url;
            browser.storage.sync.set({ customBangs }).then(() => {
                bangKeyInput.value = "";
                bangUrlInput.value = "";
                addBangBtn.disabled = true;
                loadBangs();
            });
        });
    });

    function updateThemeIcon(theme) {
        const sunIcon = document.getElementById("sun-icon");
        const moonIcon = document.getElementById("moon-icon");
        sunIcon.style.display = theme === "light" ? "block" : "none";
        moonIcon.style.display = theme === "dark" ? "block" : "none";
    }

    toggleThemeBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const nextTheme = currentTheme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", nextTheme);
        browser.storage.local.set({ theme: nextTheme });
        updateThemeIcon(nextTheme);
    });

    browser.storage.local.get("theme").then((data) => {
        const theme = data.theme || "dark";
        document.documentElement.setAttribute("data-theme", theme);
        updateThemeIcon(theme);
    });

    validateInputs();
    loadBangs();
});
