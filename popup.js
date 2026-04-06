function loadState() {
    chrome.storage.local.get(["collector_enabled"], (result) => {
        document.getElementById("toggle").checked = !!result.collector_enabled;
    });
}

document.getElementById("toggle").addEventListener("change", (event) => {
    chrome.storage.local.set({
        collector_enabled: event.target.checked
    });
});

document.getElementById("export").addEventListener("click", () => {
    chrome.storage.local.get(["board_tokens"], (result) => {
        const tokens = result.board_tokens || [];

        const blob = new Blob(
            [JSON.stringify(tokens, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);

        chrome.downloads.download({
            url: url,
            filename: "board_tokens.json",
            saveAs: true
        });
    });
});

loadState();
