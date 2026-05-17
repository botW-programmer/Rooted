const API_KEY = 'AIzaSyDRy5sudw4Ny1YeZXUZoKBMCyGI7nJOgb4';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const nameInput = document.getElementById('name-input') || document.getElementById('word-input');
const searchBtn = document.getElementById('search-btn');
const resultsCard = document.getElementById('results-card');
const resultTitle = document.getElementById('result-title');
const historyContent = document.getElementById('history-content');
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

const offlineFallback = {
    "mark": "<p><strong>Origin:</strong> Latin (Marcus)</p><h3>Ancient Roots</h3><ul><li>Derived from Mars, the ancient Roman god of war and agriculture.</li><li>It was one of the most popular praenomina (personal names) in the Roman Republic and Empire.</li></ul><h3>Cultural Journey</h3><ul><li>The name spread globally alongside early Christianity, heavily popularized by Saint Mark the Evangelist.</li><li>It has evolved into dozens of variations across cultures, including Marc (French), Marco (Italian), and Markus (German).</li></ul>"
};

async function findNameHistory() {
    const name = nameInput.value.trim();
    if (!name) return;

    searchBtn.textContent = "Searching...";
    searchBtn.disabled = true;
    resultsCard.classList.remove('hidden');
    resultTitle.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    historyContent.innerHTML = "<em>Checking databases...</em>";

    const promptText = `Analyze the history, origin, and cultural journey of the personal name "${name}". Format STRICTLY as raw HTML. Start with a short <p> explaining the language of origin and meaning. Then, provide exactly 2 subheadings using <h3> tags (e.g., Ancient Roots, Cultural Journey). Under each subheading, use an unordered list (<ul>) with exactly 2 fascinating bullet points (<li>). Do NOT write long paragraphs. Do NOT use markdown.`;
    
    const requestBody = { contents: [{ parts: [{ text: promptText }] }] };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody) 
        });

        if (!response.ok) throw new Error("API Limit Hit or Invalid Key");

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            historyContent.innerHTML = data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Invalid API Response");
        }
        
    } catch (error) {
        const lowerName = name.toLowerCase();
        
        if (offlineFallback[lowerName]) {
            historyContent.innerHTML = offlineFallback[lowerName];
        } else {
            historyContent.innerHTML = `<p><em>Error:</em> The archives are currently offline (API unreachable). Try searching the name 'Mark' to test the offline layout!</p>`;
        }
        console.error("Search Error:", error);
    }

    searchBtn.textContent = "Search";
    searchBtn.disabled = false;
}

searchBtn.addEventListener('click', findNameHistory);
nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') findNameHistory(); });

menuBtn.addEventListener('click', (event) => {
    event.stopPropagation(); 
    sidebar.classList.toggle('open');
});

document.addEventListener('click', (event) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && event.target !== menuBtn) {
        sidebar.classList.remove('open');
    }
});