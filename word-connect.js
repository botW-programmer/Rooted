const API_KEY = 'AIzaSyBKzo3gm8UrfoMOkpOY4kJ8pqlFqivpM14';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const word1Input = document.getElementById('word1-input');
const word2Input = document.getElementById('word2-input');
const searchBtn = document.getElementById('search-btn');
const resultsCard = document.getElementById('results-card');
const resultTitle = document.getElementById('result-title');
const connectionStory = document.getElementById('connection-story');
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

const offlineFallback = {
    "tea-silk": "<p>Tea and Silk share a profound historical connection as the two most coveted commodities of ancient China.</p><h3>The Silk Road</h3><ul><li>Both were primary exports driving the creation of the Silk Road, a massive Eurasian trade network.</li><li>This trade facilitated the exchange of commerce, religion, and groundbreaking technology between East and West.</li></ul><h3>Cultural Diplomacy</h3><ul><li>High-quality silk and premium tea were often presented together as imperial gifts to foreign dignitaries.</li><li>These gifts functioned as early global diplomacy, symbolizing the immense wealth and refinement of the empire.</li></ul>"
};

async function findConnection() {
    const word1 = word1Input.value.trim();
    const word2 = word2Input.value.trim();
    
    if (!word1 || !word2) {
        searchBtn.textContent = "Enter two words";
        searchBtn.style.backgroundColor = "#ff9a9e"; // Turn red
        
        setTimeout(() => { 
            searchBtn.textContent = "Connect"; 
            searchBtn.style.backgroundColor = ""; // Reset color
        }, 2000);
        return; 
    }

    searchBtn.textContent = "Connecting...";
    searchBtn.disabled = true;
    resultsCard.classList.remove('hidden');

    resultTitle.innerHTML = `<span style="color:#aad576">${word1}</span> / <span style="color:#aad576">${word2}</span>`;
    connectionStory.innerHTML = "<em>Finding connections...</em>";

    const promptText = `Analyze the historical, linguistic, cultural, or thematic connections between the words "${word1}" and "${word2}". Make it fascinating, concise, and highly scannable. Format STRICTLY as raw HTML. Start with exactly ONE short <p> sentence summarizing their deepest connection. Then, provide 2 to 3 fascinating points using <h3> tags for the subheadings. Under each subheading, you MUST provide an unordered list (<ul>) with exactly 2 punchy, highly informative bullet points (<li>). Do NOT write long paragraphs. Do NOT use markdown.`;
    
    const requestBody = { contents: [{ parts: [{ text: promptText }] }] };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody) 
        });

        if (!response.ok) throw new Error("API Limit Hit");

        const data = await response.json();
        connectionStory.innerHTML = data.candidates[0].content.parts[0].text;
        
    } catch (error) {
        const key = `${word1.toLowerCase()}-${word2.toLowerCase()}`;
        const reverseKey = `${word2.toLowerCase()}-${word1.toLowerCase()}`;
        
        if (offlineFallback[key]) {
            connectionStory.innerHTML = offlineFallback[key];
        } else if (offlineFallback[reverseKey]) {
             connectionStory.innerHTML = offlineFallback[reverseKey];
        } else {
            connectionStory.innerHTML = "<p><em>Error:</em> The archives are currently offline (API Limit reached). Try connecting 'Tea' and 'Silk' to test the offline layout!</p>";
        }
    }

    searchBtn.textContent = "Connect";
    searchBtn.disabled = false;
}

searchBtn.addEventListener('click', findConnection);
word1Input.addEventListener('keypress', (e) => { if (e.key === 'Enter') findConnection(); });
word2Input.addEventListener('keypress', (e) => { if (e.key === 'Enter') findConnection(); });

menuBtn.addEventListener('click', (event) => {
    event.stopPropagation(); 
    sidebar.classList.toggle('open');
});

document.addEventListener('click', (event) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && event.target !== menuBtn) {
        sidebar.classList.remove('open');
    }
});