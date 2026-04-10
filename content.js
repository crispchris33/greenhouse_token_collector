function extractBoardToken(url) {
    try {
        const patterns = [
            /job-boards\.greenhouse\.io\/([^\/\?]+)/,
            /boards\.greenhouse\.io\/([^\/\?]+)/,
            /greenhouse\.io\/([^\/\?]+)\/jobs/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1].toLowerCase().trim();
            }
        }
    } catch (error) {}

    return null;
}

function extractFromCurrentUrl() {
    const token = extractBoardToken(window.location.href);
    return token ? [token] : [];
}

function extractFromPageLinks() {
    const tokens = [];

    document.querySelectorAll("a[href]").forEach((link) => {
        const token = extractBoardToken(link.href);
        if (token) {
            tokens.push(token);
        }
    });

    return tokens;
}

function extractFromDataPage() {
    const appDiv = document.querySelector("#app");
    if (!appDiv) {
        return [];
    }

    const dataPage = appDiv.getAttribute("data-page");
    if (!dataPage) {
        return [];
    }

    try {
        const parsed = JSON.parse(dataPage);

        const jobPosts =
            parsed?.props?.jobPosts?.jobPosts ||
            [];

        const tokens = [];

        jobPosts.forEach((job) => {
            const possibleUrls = [
                job.absolute_url,
                job.url,
                job.job_post_absolute_url,
                job.external_url
            ];

            possibleUrls.forEach((possibleUrl) => {
                if (possibleUrl) {
                    const token = extractBoardToken(possibleUrl);
                    if (token) {
                        tokens.push(token);
                    }
                }
            });
        });

        return tokens;
    } catch (error) {
        return [];
    }
}

function saveTokens(foundTokens) {
    chrome.storage.local.get(["collector_enabled", "board_tokens"], (result) => {
        if (!result.collector_enabled) {
            return;
        }

        const existingTokens = new Set(result.board_tokens || []);
        let changed = false;

        foundTokens.forEach((token) => {
            if (!existingTokens.has(token)) {
                existingTokens.add(token);
                changed = true;
            }
        });

        if (changed) {
            chrome.storage.local.set({
                board_tokens: Array.from(existingTokens)
            });
        }
    });
}

function collectTokens() {
    const foundTokens = new Set();

    extractFromCurrentUrl().forEach((token) => foundTokens.add(token));
    extractFromPageLinks().forEach((token) => foundTokens.add(token));
    extractFromDataPage().forEach((token) => foundTokens.add(token));

    if (foundTokens.size > 0) {
        saveTokens(foundTokens);
    }
}

collectTokens();
setTimeout(collectTokens, 2000);
setTimeout(collectTokens, 5000);
setTimeout(collectTokens, 8000);

const observer = new MutationObserver(() => {
    collectTokens();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});