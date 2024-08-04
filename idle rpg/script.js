// Get DOM elements
const playerAvatar = document.getElementById('player-avatar');
const emojiPicker = document.getElementById('emoji-picker');
const playerName = document.getElementById('player-name');
const playerXP = document.getElementById('player-xp');
const playerLevel = document.getElementById('player-level');
const xpProgress = document.getElementById('xp-progress');
const inventoryList = document.getElementById('inventory-list');
const inventoryProgress = document.getElementById('inventory-progress');
const locationName = document.getElementById('location-name');
const locationProgress = document.getElementById('location-progress');
const monsterName = document.getElementById('monster-name');
const monsterProgress = document.getElementById('monster-progress');
const monstersFought = document.getElementById('monsters-fought');
const closePickerButton = document.getElementById('close-picker');

// Variables
let playerState = {};
let locations = [];
let items = [];
let monsters = [];
let currentLocationIndex = 0;
let currentMonster = null;
let monsterTimer = null;

// Event listeners
playerAvatar.addEventListener('click', () => {
    emojiPicker.showModal();
});

closePickerButton.addEventListener('click', () => {
    emojiPicker.close();
});

emojiPicker.addEventListener('click', (event) => {
    if (event.target.classList.contains('emoji')) {
        const selectedEmoji = event.target.getAttribute('data-emoji');
        playerAvatar.textContent = selectedEmoji;
        savePlayerState();
        emojiPicker.close();
    }
});
playerName.addEventListener('click', editPlayerName);

// Functions
// function toggleEmojiPicker() {
//     emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
// }

// function selectEmoji(event) {
//     if (event.target.classList.contains('emoji')) {
//         const selectedEmoji = event.target.getAttribute('data-emoji');
//         playerAvatar.textContent = selectedEmoji;
//         savePlayerState();
//     }
// }

function editPlayerName() {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = playerName.textContent;
    playerName.textContent = '';
    playerName.appendChild(input);
    input.focus();

    input.addEventListener('blur', () => {
        playerName.textContent = input.value;
        savePlayerState();
    });
}

function loadPlayerState() {
    const savedState = localStorage.getItem('playerState');
    console.log('Saved player state:', savedState);

    if (savedState) {
        playerState = JSON.parse(savedState);
        console.log('Loaded player state:', playerState);

        if (playerState.name) {
    playerName.textContent = playerState.name;
    document.title = `Idle RPG - ${playerState.name}`;
}
        if (playerState.avatar) playerAvatar.textContent = playerState.avatar;
        if (playerState.xp) playerXP.textContent = playerState.xp;
        if (playerState.level) playerLevel.textContent = playerState.level;
        if (playerState.monstersFought) monstersFought.textContent = playerState.monstersFought;

        if (playerState.inventory) {
            loadInventoryItems(playerState.inventory);
        }
    }
}

function savePlayerState() {
    playerState.name = playerName.textContent;
    playerState.avatar = playerAvatar.textContent;
    playerState.xp = playerXP.textContent;
    playerState.level = playerLevel.textContent;
    playerState.monstersFought = parseInt(monstersFought.textContent);
    playerState.inventory = getInventoryItems();

    console.log('Player state before saving:', playerState);

    localStorage.setItem('playerState', JSON.stringify(playerState));
}

async function loadInventoryItems(inventoryItems) {
    inventoryList.innerHTML = '';
    for (const item of inventoryItems) {
        const itemData = items.find(i => i.id === parseInt(item.id));
        if (itemData) {
            const li = document.createElement('li');
            li.setAttribute('data-item-id', item.id);
            li.innerHTML = `${itemData.name} <span class="item-quantity">${item.quantity}</span>`;
            inventoryList.appendChild(li);
        }
    }
}

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
    savePlayerState();
}

function displayLocation(location) {
    locationName.textContent = location.name;
}

function checkLevelUp(xp) {
    const requiredXP = calculateRequiredXP(parseInt(playerLevel.textContent));
    if (xp >= requiredXP) {
        playerLevel.textContent = parseInt(playerLevel.textContent) + 1;
        alert(`Congratulations! You have reached level ${playerLevel.textContent}!`);
    }
}

function calculateRequiredXP(level) {
    return Math.floor(100 * Math.pow(1.1, level - 1));
}

function startMonsterEncounter() {
    currentMonster = monsters[Math.floor(Math.random() * monsters.length)];
    monsterName.textContent = currentMonster.name;
    monsterProgress.style.width = '0';

    const encounterDuration = Math.floor(Math.random() * (600 - 30 + 1)) + 30;
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

// Fetch data and start game
Promise.all([
    fetch('locations.json').then(response => response.json()),
    fetch('items.json').then(response => response.json()),
    fetch('monsters.json').then(response => response.json())
])
.then(([fetchedLocations, fetchedItems, fetchedMonsters]) => {
    locations = fetchedLocations;
    items = fetchedItems;
    monsters = fetchedMonsters;

    loadPlayerState();
    displayLocation(locations[currentLocationIndex]);
    startMonsterEncounter();

    setInterval(() => {
        const currentXP = parseInt(playerXP.textContent);
        const newXP = currentXP + 1;
        playerXP.textContent = newXP;
        xpProgress.style.width = '0';
        checkLevelUp(newXP);
        savePlayerState();
    }, 30 * 1000);

    setInterval(() => {
        const currentWidth = parseInt(xpProgress.style.width) || 0;
        const newWidth = currentWidth + (100 / 30);
        xpProgress.style.width = `${newWidth}%`;
    }, 1000);

    setInterval(() => {
        currentLocationIndex = (currentLocationIndex + 1) % locations.length;
        displayLocation(locations[currentLocationIndex]);
        locationProgress.style.width = '0';
    }, 60 * 60 * 1000);

    setInterval(() => {
        const currentWidth = parseInt(locationProgress.style.width) || 0;
        const newWidth = currentWidth + (100 / 60);
        locationProgress.style.width = `${newWidth}%`;
    }, 60 * 1000);

    setInterval(() => {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        addItemToInventory(randomItem);
        inventoryProgress.style.width = '0';
    }, 60 * 1000);

    setInterval(() => {
        const currentWidth = parseInt(inventoryProgress.style.width) || 0;
        const newWidth = currentWidth + (100 / 60);
        inventoryProgress.style.width = `${newWidth}%`;
    }, 1000);
});


const helpIcon = document.getElementById('help-icon');
const helpDialog = document.getElementById('help-dialog');
const closeHelpButton = document.getElementById('close-help');

helpIcon.addEventListener('click', () => {
    helpDialog.showModal();
});

closeHelpButton.addEventListener('click', () => {
    helpDialog.close();
});