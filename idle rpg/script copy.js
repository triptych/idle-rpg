// Get the player avatar element
const playerAvatar = document.getElementById('player-avatar');

// Get the emoji picker element
const emojiPicker = document.getElementById('emoji-picker');

// Hide the emoji picker by default
emojiPicker.style.display = 'none';

// Add a click event listener to the player avatar
playerAvatar.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
});

// Add a click event listener to each emoji in the emoji picker
const emojiElements = document.querySelectorAll('.emoji');
emojiElements.forEach(emoji => {
    emoji.addEventListener('click', () => {
        const selectedEmoji = emoji.getAttribute('data-emoji');
        playerAvatar.textContent = selectedEmoji;
        emojiPicker.style.display = 'none';
    });
});

// ... (previous JavaScript code) ...

// Get the progress elements
const xpProgress = document.getElementById('xp-progress');
const locationProgress = document.getElementById('location-progress');

// Get the location name element
const locationName = document.getElementById('location-name');




// Get the inventory progress element
const inventoryProgress = document.getElementById('inventory-progress');

// Get the inventory list element
const inventoryList = document.getElementById('inventory-list');

// Load items from JSON file
fetch('items.json')
    .then(response => response.json())
    .then(items => {
        // Update inventory every minute
        setInterval(() => {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            addItemToInventory(randomItem);
            inventoryProgress.style.width = '0';
        }, 60 * 1000);

        // Update inventory progress every second
        setInterval(() => {
            const currentWidth = parseInt(inventoryProgress.style.width) || 0;
            const newWidth = currentWidth + (100 / 60);
            inventoryProgress.style.width = `${newWidth}%`;
        }, 1000);
    });

// Add item to inventory
function addItemToInventory(item) {
    const inventoryItem = document.querySelector(`#inventory-list li[data-item-id="${item.id}"]`);

    if (inventoryItem) {
        const quantityElement = inventoryItem.querySelector('.item-quantity');
        const currentQuantity = parseInt(quantityElement.textContent);
        quantityElement.textContent = currentQuantity + 1;
    } else {
        const li = document.createElement('li');
        li.setAttribute('data-item-id', item.id);
        li.innerHTML = `${item.name} <span class="item-quantity">1</span>`;
        inventoryList.appendChild(li);
    }

    saveInventory();
}

// Save inventory to local storage
function saveInventory() {
    const inventoryItems = getInventoryItems();
    localStorage.setItem('inventory', JSON.stringify(inventoryItems));
}

// Get the player name element
const playerName = document.getElementById('player-name');

// Add click event listener to player name
playerName.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = playerName.textContent;
    playerName.textContent = '';
    playerName.appendChild(input);
    input.focus();

    // Save player name when focus leaves the input
    input.addEventListener('blur', () => {
        playerName.textContent = input.value;
        savePlayerState();
    });
});


// Load locations from JSON file
fetch('locations.json')
    .then(response => response.json())
    .then(locations => {
        // Set the initial location
        let currentLocationIndex = 0;
        displayLocation(locations[currentLocationIndex]);

        // Update location every hour
        setInterval(() => {
            currentLocationIndex = (currentLocationIndex + 1) % locations.length;
            displayLocation(locations[currentLocationIndex]);
            locationProgress.style.width = '0';
        }, 60 * 60 * 1000);

        // Update location progress every minute
        setInterval(() => {
            const currentWidth = parseInt(locationProgress.style.width) || 0;
            const newWidth = currentWidth + (100 / 60);
            locationProgress.style.width = `${newWidth}%`;
        }, 60 * 1000);
    });

// Display the location
function displayLocation(location) {
    locationName.textContent = location.name;
}

// Update experience every 30 seconds
setInterval(() => {
    const currentXP = parseInt(document.getElementById('player-xp').textContent);
    const newXP = currentXP + 1;
    document.getElementById('player-xp').textContent = newXP;
    xpProgress.style.width = '0';
    checkLevelUp(newXP);
    savePlayerState();
}, 30 * 1000);
// Update experience progress every second
setInterval(() => {
    const currentWidth = parseInt(xpProgress.style.width) || 0;
    const newWidth = currentWidth + (100 / 30);
    xpProgress.style.width = `${newWidth}%`;
}, 1000);

// Save player state to local storage
function savePlayerState() {
    const playerState = {
        name: document.getElementById('player-name').textContent,
        class: document.getElementById('player-class').textContent,
        hp: document.getElementById('player-hp').textContent,
        mana: document.getElementById('player-mana').textContent,
        hitPoints: document.getElementById('player-hit-points').textContent,
        xp: document.getElementById('player-xp').textContent,
        level: document.getElementById('player-level').textContent,
        avatar: document.getElementById('player-avatar').textContent,
        inventory: getInventoryItems(),
        monstersFought: parseInt(monstersFought.textContent)

    };
    playerState.name = document.getElementById('player-name').textContent;

    localStorage.setItem('playerState', JSON.stringify(playerState));
}

function loadPlayerState() {
    const playerState = JSON.parse(localStorage.getItem('playerState'));

    if (playerState) {
        document.getElementById('player-name').textContent = playerState.name;
        document.getElementById('player-class').textContent = playerState.class;
        document.getElementById('player-hp').textContent = playerState.hp;
        document.getElementById('player-mana').textContent = playerState.mana;
        document.getElementById('player-hit-points').textContent = playerState.hitPoints;
        document.getElementById('player-xp').textContent = playerState.xp;
        document.getElementById('player-level').textContent = playerState.level;
        document.getElementById('player-avatar').textContent = playerState.avatar;
        document.getElementById('monsters-fought').textContent = playerState.monstersFought || 0;

        
        if (playerState.inventory) {
            loadInventoryItems(playerState.inventory);
        }
    }
}


// Get inventory items
function getInventoryItems() {
    const inventoryItems = [];
    const inventoryItemElements = document.querySelectorAll('#inventory-list li');
    inventoryItemElements.forEach(item => {
        const itemId = item.getAttribute('data-item-id');
        const itemQuantity = parseInt(item.querySelector('.item-quantity').textContent);
        inventoryItems.push({ id: itemId, quantity: itemQuantity });
    });
    return inventoryItems;
}

// Load inventory items
async function loadInventoryItems(inventoryItems) {
    inventoryList.innerHTML = '';

    for (const item of inventoryItems) {
        const itemName = await getItemName(item.id);
        const li = document.createElement('li');
        li.setAttribute('data-item-id', item.id);
        li.innerHTML = `${itemName} <span class="item-quantity">${item.quantity}</span>`;
        inventoryList.appendChild(li);
    }
}

// Get item name by ID
async function getItemName(itemId) {
    const response = await fetch('items.json');
    const items = await response.json();
    const item = items.find(item => item.id === parseInt(itemId));
    return item ? item.name : '';
}

// Check if the player should level up
function checkLevelUp(xp) {
    const currentLevel = parseInt(document.getElementById('player-level').textContent);
    const requiredXP = calculateRequiredXP(currentLevel);

    if (xp >= requiredXP) {
        const newLevel = currentLevel + 1;
        document.getElementById('player-level').textContent = newLevel;
        alert(`Congratulations! You have reached level ${newLevel}!`);
    }
}

// Calculate the required XP for the next level
function calculateRequiredXP(level) {
    // You can modify this formula based on your desired leveling algorithm
    return Math.floor(100 * Math.pow(1.1, level - 1));
}


// Load player state on page load
loadPlayerState();


// Get the monster elements
const monsterName = document.getElementById('monster-name');
const monsterProgress = document.getElementById('monster-progress');
const monstersFought = document.getElementById('monsters-fought');

// Load monsters from JSON file
fetch('monsters.json')
    .then(response => response.json())
    .then(monsters => {
        let currentMonster = null;
        let monsterTimer = null;

        // Start a new monster encounter
        function startMonsterEncounter() {
            currentMonster = monsters[Math.floor(Math.random() * monsters.length)];
            monsterName.textContent = currentMonster.name;
            monsterProgress.style.width = '0';

            const encounterDuration = Math.floor(Math.random() * (600 - 30 + 1)) + 30; // Random duration between 30 seconds and 10 minutes
            const progressIncrement = 100 / encounterDuration;

            monsterTimer = setInterval(() => {
                const currentWidth = parseFloat(monsterProgress.style.width) || 0;
                const newWidth = currentWidth + progressIncrement;
                monsterProgress.style.width = `${newWidth}%`;

                if (newWidth >= 100) {
                    clearInterval(monsterTimer);
                    monstersFought.textContent = parseInt(monstersFought.textContent) + 1;
                    savePlayerState();
                    startMonsterEncounter();
                }
            }, 1000);
        }

        // Start the initial monster encounter
        startMonsterEncounter();
    });