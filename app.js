const API_KEY = 'AIzaSyBKzo3gm8UrfoMOkpOY4kJ8pqlFqivpM14';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const mindmapArea = document.getElementById('mindmap-area');
const generateBtn = document.getElementById('generate-btn');
const wordModal = document.getElementById('word-modal');
const closeBtn = document.getElementById('close-btn');
const modalTitle = document.getElementById('modal-title');
const modalHistory = document.getElementById('modal-history');
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

const leafColors = ['#aad576', '#90a955', '#a3b18a', '#b5c99a', '#87986a', '#97a97c'];

// fallback dictionary
const offlineDictionary = {
    "Komorebi": "<p><em>Pronunciation:</em> /koh-moh-reh-bee/</p><ul><li><strong>Origin:</strong> Japanese.</li><li>Refers to the visual effect of sunlight filtering through the leaves of trees.</li><li>Celebrates a fleeting, beautiful moment in nature.</li></ul>",
    "Ubuntu": "<p><em>Pronunciation:</em> /oo-boon-too/</p><ul><li><strong>Origin:</strong> Nguni Bantu.</li><li>Roughly translates to 'I am because we are.'</li><li>A profound philosophy emphasizing universal human connection and mutual caring.</li></ul>",
    "Meraki": "<p><em>Pronunciation:</em> /may-rah-kee/</p><ul><li><strong>Origin:</strong> Greek.</li><li>Means doing something with soul, creativity, or absolute love.</li><li>Used when you put a piece of yourself into your work.</li></ul>",
    "Hygge": "<p><em>Pronunciation:</em> /hoo-gah/</p><ul><li><strong>Origin:</strong> Danish.</li><li>A quality of deep coziness and comfortable conviviality.</li><li>Engenders a feeling of contentment and well-being.</li></ul>",
    "Sonder": "<p><em>Pronunciation:</em> /sawn-der/</p><ul><li><strong>Origin:</strong> English.</li><li>The profound realization that each random passerby has a life as vivid and complex as your own.</li></ul>",
    "Tsundoku": "<p><em>Pronunciation:</em> /tsoon-doh-koo/</p><ul><li><strong>Origin:</strong> Japanese.</li><li>The act of acquiring reading materials but letting them pile up without reading them.</li></ul>",
    "Wabi-sabi": "<p><em>Pronunciation:</em> /wah-bee-sah-bee/</p><ul><li><strong>Origin:</strong> Japanese.</li><li>A world view centered on the acceptance of transience and imperfection.</li><li>Finding beauty in things that are incomplete.</li></ul>",
    "Saudade": "<p><em>Pronunciation:</em> /sow-dah-djee/</p><ul><li><strong>Origin:</strong> Portuguese.</li><li>A deep emotional state of melancholic longing for a person or thing that is absent.</li></ul>",
    "Yūgen": "<p><em>Pronunciation:</em> /yoo-gehn/</p><ul><li><strong>Origin:</strong> Japanese.</li><li>A profound, mysterious sense of the beauty of the universe and the sad beauty of human suffering.</li></ul>",
    "Fernweh": "<p><em>Pronunciation:</em> /feirn-vey/</p><ul><li><strong>Origin:</strong> German.</li><li>An intense crave for travel; being homesick for a place you've never been.</li></ul>",
    "Ikigai": "<p><em>Pronunciation:</em> /ee-kee-guy/</p><ul><li><strong>Origin:</strong> Japanese.</li><li>A reason for being; the thing that gets you up in the morning.</li></ul>",
    "Hózhó": "<p><em>Pronunciation:</em> /hoh-zhoh/</p><ul><li><strong>Origin:</strong> Navajo.</li><li>A complex concept meaning a state of balance, beauty, and harmony with the world.</li></ul>",
    "Dadirri": "<p><em>Pronunciation:</em> /dah-dee-ree/</p><ul><li><strong>Origin:</strong> Aboriginal Australian.</li><li>Inner, deep listening and quiet, still awareness.</li></ul>",
    "Sila": "<p><em>Pronunciation:</em> /see-lah/</p><ul><li><strong>Origin:</strong> Inuktitut.</li><li>A multifaceted word meaning the weather, consciousness, or the breath of the world.</li></ul>",
    "Friluftsliv": "<p><em>Pronunciation:</em> /free-loofts-leev/</p><ul><li><strong>Origin:</strong> Norwegian.</li><li>Literally 'free air life'; the cultural value of spending time outdoors for spiritual and physical wellbeing.</li></ul>",
    "Ukiyo": "<p><em>Pronunciation:</em> /oo-kee-yoh/</p><ul><li><strong>Origin:</strong> Japanese.</li><li>'The floating world'; living in the moment, detached from the bothers of life.</li></ul>",
    "Gökotta": "<p><em>Pronunciation:</em> /yuh-koht-tah/</p><ul><li><strong>Origin:</strong> Swedish.</li><li>The act of waking up early in the morning specifically to hear the first birds sing.</li></ul>",
    "Tartle": "<p><em>Pronunciation:</em> /tar-tuhl/</p><ul><li><strong>Origin:</strong> Scottish.</li><li>The socially awkward hesitation when introducing someone whose name you have momentarily forgotten.</li></ul>",
    "Ya'aburnee": "<p><em>Pronunciation:</em> /yah-ah-boor-nee/</p><ul><li><strong>Origin:</strong> Arabic.</li><li>Literally 'you bury me'; the beautiful, slightly dark hope that you will die before someone you love because you couldn't live without them.</li></ul>",
    "Forelsket": "<p><em>Pronunciation:</em> /for-ell-sket/</p><ul><li><strong>Origin:</strong> Norwegian.</li><li>The overwhelming, intoxicating euphoria experienced as you begin to fall in love.</li></ul>",
    "Toska": "<p><em>Pronunciation:</em> /tohs-kah/</p><ul><li><strong>Origin:</strong> Russian.</li><li>A sensation of great spiritual anguish or dull ache of the soul, often without a specific cause.</li></ul>",
    "Yuanfen": "<p><em>Pronunciation:</em> /yoo-en-fuhn/</p><ul><li><strong>Origin:</strong> Chinese.</li><li>The invisible, binding force or destiny that dictates human encounters and relationships.</li></ul>",
    "Fika": "<p><em>Pronunciation:</em> /fee-kah/</p><ul><li><strong>Origin:</strong> Swedish.</li><li>Taking a dedicated break with friends or colleagues for coffee and a sweet bite to eat.</li></ul>",
    "Ayurnamat": "<p><em>Pronunciation:</em> /ah-yoor-nah-maht/</p><ul><li><strong>Origin:</strong> Inuktitut.</li><li>The calming philosophy that there is no point in worrying about events that cannot be changed.</li></ul>",
    "Querencia": "<p><em>Pronunciation:</em> /keh-ren-see-ah/</p><ul><li><strong>Origin:</strong> Spanish.</li><li>A metaphysical or physical place where one feels entirely secure, and from which one draws inner strength.</li></ul>"
};

// API/leaf logic
async function fetchWordsFromAPI() {
    generateBtn.textContent = "Floating leaves...";
    generateBtn.disabled = true; 
    
    document.querySelectorAll('.word-node').forEach(node => node.remove());

    const themes = ["nature and the earth", "human emotions and love", "time and space", "family and friendship", "food and gathering"];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    
    const promptText = `Give me exactly 25 beautiful, unique, and culturally significant words from different languages around the world related to the theme of "${randomTheme}". Provide ONLY the words, separated by commas, with no definitions, no bullet points, and no extra text.`;

    const requestBody = { contents: [{ parts: [{ text: promptText }] }] };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;
        let aiWordsArray = generatedText.split(',').map(word => word.trim());
        
        scatterWords(aiWordsArray);

    } catch (error) {
        console.warn("API Failed, switching to Offline Fallback Mode:", error.message);
        const fallbackWords = Object.keys(offlineDictionary);
        scatterWords(fallbackWords);
    }

    generateBtn.textContent = "Float New Leaves";
    generateBtn.disabled = false;
}

function scatterWords(wordsArray) {
    document.querySelectorAll('.word-node').forEach(node => node.remove());
    
    const placedPositions = [];
    const minDistance = 12;

    wordsArray.forEach((word, index) => {
        const node = document.createElement('div');
        node.classList.add('word-node');
        node.textContent = word;

        const randomColor = leafColors[Math.floor(Math.random() * leafColors.length)];
        node.style.backgroundColor = randomColor;
        
        const randomRotation = Math.floor(Math.random() * 60) - 30; 
        node.style.setProperty('--base-rot', `${randomRotation}deg`);
        
        const swayDuration = 3 + Math.random() * 3; 
        node.style.animation = `growLeaf 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards, sway ${swayDuration}s ease-in-out infinite alternate`;
        node.style.animationDelay = `${index * 0.05}s, 0.8s`; 

        let randomTop, randomLeft;
        let overlapping = true;
        let attempts = 0;

        while (overlapping && attempts < 150) {

            randomTop = Math.floor(Math.random() * 70) + 5; 
            
            randomLeft = Math.floor(Math.random() * 80) + 10; 
            
            overlapping = false; 

            for (let i = 0; i < placedPositions.length; i++) {
                const existingPos = placedPositions[i];
                const dx = randomLeft - existingPos.left;
                const dy = randomTop - existingPos.top;
                if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
                    overlapping = true;
                    break;
                }
            }
            attempts++;
        }

        placedPositions.push({ top: randomTop, left: randomLeft });
        
        node.style.top = `${randomTop}%`;
        node.style.left = `${randomLeft}%`;
        node.addEventListener('click', () => openModal(word));
        mindmapArea.appendChild(node);
    });
}

function openModal(word) {
    wordModal.classList.remove('hidden');
    modalTitle.textContent = word;
    modalHistory.innerHTML = "<em>Connecting to archives...</em>";
    fetchWordHistory(word);
}

async function fetchWordHistory(word) {
    const promptText = `Provide the phonetic pronunciation, history, etymology, and cultural significance of the word "${word}". Make it extremely easy to understand. Format the response STRICTLY as raw HTML: Put the Romanized phonetic pronunciation (using standard English alphabet letters, not IPA symbols or native scripts) in a <p> tag exactly like this: <p><em>Pronunciation:</em> /example/</p>. Then, provide the rest of the information as an unordered list (<ul>) with 3 to 4 easy-to-read bullet points (<li>). Do NOT use any markdown formatting like asterisks or code blocks.`;
    
    const requestBody = { contents: [{ parts: [{ text: promptText }] }] };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody) 
        });

        if (!response.ok) throw new Error("API Limit Hit");

        const data = await response.json();
        const rawHTML = data.candidates[0].content.parts[0].text;
        
        modalHistory.innerHTML = rawHTML;
        
    } catch (error) {
        if (offlineDictionary[word]) {
            modalHistory.innerHTML = offlineDictionary[word];
        } else {
            modalHistory.innerHTML = "<p><em>Error:</em> We couldn't connect to the live AI archives right now, and this word isn't in our offline dictionary yet! Please try again later.</p>";
        }
    }
}

closeBtn.addEventListener('click', () => wordModal.classList.add('hidden'));
wordModal.addEventListener('click', (event) => {
    if (event.target === wordModal) wordModal.classList.add('hidden');
});
generateBtn.addEventListener('click', fetchWordsFromAPI);

menuBtn.addEventListener('click', (event) => {
    event.stopPropagation(); 
    sidebar.classList.toggle('open');
});

document.addEventListener('click', (event) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && event.target !== menuBtn) {
        sidebar.classList.remove('open');
    }
});

fetchWordsFromAPI();