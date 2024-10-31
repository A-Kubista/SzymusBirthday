// Initialize variables
let videoPlayed = false;
let revealedCount = 0;
let revealedSets = 0;
let currentRow = 0;
const SETS_BEFORE_VIDEO = 2;
const totalCards = 3;
const CARDS_PER_ROW = 3;

// Generate image arrays with numbered format
const allImagePairs = Array.from({ length: 14 }, (_, i) => ({
    top: `${i + 1}.jpg`,
    bottom: `${i + 1}.jpg`,
    caption: `Picture ${i + 1}`
}));

const headImages = Array.from({ length: 14 }, (_, i) => `${i + 1}.jpg`);

// Prevent right click and other interactions
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
});

// Utility functions
function playYeeySound() {
    const sound = document.getElementById('yeeySound');
    sound.currentTime = 0;
    sound.play();
}

function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffbe0b', '#ff006e', '#8338ec'];
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-10px';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    document.body.appendChild(confetti);

    const animation = confetti.animate([
        { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${Math.random() * 300 - 150}px, ${window.innerHeight + 10}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
    ], {
        duration: Math.random() * 2000 + 1500,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });

    animation.onfinish = () => confetti.remove();
}

function spawnConfetti() {
    for (let i = 0; i < 50; i++) {
        createConfetti();
    }
}

function calculateScratchPercentage(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparentPixels++;
    }
    
    return (transparentPixels / (canvas.width * canvas.height)) * 100;
}

// Video handling
function playBirthdayVideo() {
    const videoContainer = document.getElementById('videoContainer');
    const video = document.getElementById('birthdayVideo');
    videoContainer.classList.add('visible');
    video.play();
    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => spawnConfetti(), i * 500);
    }
}

// Card management functions
function checkAllRevealed() {
    if (revealedCount >= totalCards) {
        revealedCount = 0;
        revealedSets++;
        
        // Get current cards and make them spin
        const currentCards = document.querySelectorAll(`.scratch-container[data-row="${currentRow}"]`);
        currentCards.forEach(container => {
            container.classList.add('spinning');
            container.style.pointerEvents = 'none';
        });
        
        if (revealedSets >= SETS_BEFORE_VIDEO && !videoPlayed) {
            videoPlayed = true;
            setTimeout(() => {
                playBirthdayVideo();
            }, 2000);
        } else {
            // Create new row of cards
            currentRow++;
            createNewRow();
        }
    }
}

function createNewRow() {
    const gallery = document.getElementById('gallery');
    
    // Create row container
    const rowDiv = document.createElement('div');
    rowDiv.className = 'card-row';
    
    gallery.appendChild(rowDiv);
    
    // Add new cards to the row
    const shuffled = [...allImagePairs].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, totalCards);
    selected.forEach((pair, index) => {
        createScratchCard(pair, index, true, rowDiv);
    });

    // Smooth scroll to the new row
    setTimeout(() => {
        rowDiv.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
        });
    }, 100);
}

function createScratchCard(pair, index, animate = false, rowContainer) {
    const container = document.createElement('div');
    container.className = 'scratch-container';
    if (animate) container.classList.add('slide-in');
    container.setAttribute('data-row', currentRow);
    
    let time = index * 1000;

    function updateBounce() {
        if (!container.classList.contains('spinning')) {
            time += 0.05;
            const newY = Math.sin(time) * 20;
            container.style.transform = `translateY(${newY}px)`;
        }
        requestAnimationFrame(updateBounce);
    }

    requestAnimationFrame(updateBounce);
    
    const bottomImg = document.createElement('img');
    bottomImg.src = pair.bottom;
    bottomImg.className = 'bottom-image';
    bottomImg.alt = pair.caption;
    bottomImg.draggable = false;
    
    bottomImg.onerror = function() {
        console.error(`Failed to load image: ${pair.bottom}`);
        this.src = 'fallback.jpg';
    };
    
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    
    container.appendChild(bottomImg);
    container.appendChild(canvas);
    rowContainer.appendChild(container);

    let revealed = false;
    const topImg = new Image();
    topImg.crossOrigin = "anonymous";
    
    topImg.onerror = function() {
        console.error(`Failed to load image: ${pair.top}`);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Image failed to load', canvas.width/2, canvas.height/2);
    };
    
    topImg.onload = () => {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(topImg, 0, 0, canvas.width, canvas.height);
    };
    topImg.src = pair.top;

    let isDrawing = false;
    
    function scratch(e) {
        if (!isDrawing) return;
        
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();

        const percentage = calculateScratchPercentage(canvas);
        if (percentage > 60 && !revealed) {
            revealed = true;
            revealedCount++;
            spawnConfetti();
            playYeeySound();
            checkAllRevealed();
        }
    }

    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => isDrawing = false);
}

function createFloatingHead() {
    const head = document.createElement('img');
    head.className = 'floating-head';
    head.src = headImages[Math.floor(Math.random() * headImages.length)];
    head.draggable = false;
    
    head.onerror = function() {
        console.error(`Failed to load head image: ${head.src}`);
        this.src = 'fallback.jpg';
    };
    
    let posX = Math.random() * (window.innerWidth - 50);
    let posY = Math.random() * (window.innerHeight - 50);
    let speedX = (Math.random() - 0.5) * 8;
    let speedY = (Math.random() - 0.5) * 8;
    let rotation = 0;
    let rotationSpeed = (Math.random() - 0.5) * 4;
    
    head.style.left = posX + 'px';
    head.style.top = posY + 'px';
    
    head.addEventListener('click', () => {
        spawnConfetti();
        playYeeySound();
        speedX *= 1.5;
        speedY *= 1.5;
    });

    function updatePosition() {
        posX += speedX;
        posY += speedY;

        if (posX <= 0 || posX >= window.innerWidth - 50) {
            speedX = -speedX * 0.9;
            posX = posX <= 0 ? 0 : window.innerWidth - 50;
        }
        if (posY <= 0 || posY >= window.innerHeight - 50) {
            speedY = -speedY * 0.9;
            posY = posY <= 0 ? 0 : window.innerHeight - 50;
        }

        rotation += rotationSpeed;
        head.style.left = posX + 'px';
        head.style.top = posY + 'px';
        head.style.transform = `rotate(${rotation}deg)`;

        if (Math.random() < 0.02) {
            speedX += (Math.random() - 0.5) * 2;
            speedY += (Math.random() - 0.5) * 2;
        }

        speedX *= 0.995;
        speedY *= 0.995;

        requestAnimationFrame(updatePosition);
    }

    requestAnimationFrame(updatePosition);
    document.body.appendChild(head);
}

// Initialize everything
for (let i = 0; i < 15; i++) {
    setTimeout(() => createFloatingHead(), i * 200);
}
createInitialCards();

function createInitialCards() {
    const gallery = document.getElementById('gallery');
    const rowDiv = document.createElement('div');
    rowDiv.className = 'card-row';
    gallery.appendChild(rowDiv);
    
    const shuffled = [...allImagePairs].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, totalCards);
    selected.forEach((pair, index) => {
        createScratchCard(pair, index, true, rowDiv);
    });
}