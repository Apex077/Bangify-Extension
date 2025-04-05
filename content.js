function getUserBangs(callback) {
    browser.storage.sync.get("customBangs", (data) => {
        callback(data.customBangs || {});
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const searchBox = document.querySelector("input[name=q]");
    if (!searchBox) return;

    getUserBangs((userBangs) => {
        const bangsList = Object.keys(userBangs);

        searchBox.addEventListener("input", () => {
            let value = searchBox.value.toLowerCase();
            let match = bangsList.find((b) => value.startsWith(b));

            searchBox.style.border = match ? "2px solid blue" : "";
        });
    });
});
