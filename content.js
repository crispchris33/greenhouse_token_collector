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
    } catch (error) {
        // ignore parse errors
    }

    return null;
}

function collectTokens() {
    chrome.storage.local.get(["collector_enabled", "board_tokens"], (result) => {
        if (!result.collector_enabled) {
            return;
        }

        const existingTokens = new Set(result.board_tokens || []);
        const foundTokens = new Set();

        const currentPageToken = extractBoardToken(window.location.href);
        if (currentPageToken) {
            foundTokens.add(currentPageToken);
        }

        document.querySelectorAll("a[href]").forEach((link) => {
            const token = extractBoardToken(link.href);
            if (token) {
                foundTokens.add(token);
            }
        });

        if (foundTokens.size > 0) {
            foundTokens.forEach((token) => existingTokens.add(token));

            chrome.storage.local.set({
                board_tokens: Array.from(existingTokens)
            });
        }
    });
}

collectTokens();
setTimeout(collectTokens, 3000);
