function getUserBangs(callback) {
    browser.storage.sync.get("customBangs", (data) => {
        callback(data.customBangs || {});
    });
}

browser.webRequest.onBeforeRequest.addListener(
    (details) => {
        return new Promise((resolve) => {
            getUserBangs((userBangs) => {
                const url = new URL(details.url);
                const params = new URLSearchParams(url.search);
                let query = params.get("q");

                if (query) {
                    for (const [bang, redirectUrl] of Object.entries(userBangs)) {
                        if (query.startsWith(bang)) {
                            const newQuery = query.replace(bang, "").trim();
                            resolve({ redirectUrl: redirectUrl.replace("{query}", encodeURIComponent(newQuery)) });
                            return;
                        }
                    }
                }
                resolve({});
            });
        });
    },
    { urls: ["*://www.google.com/search*"] },
    ["blocking"]
);
