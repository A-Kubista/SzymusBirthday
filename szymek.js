// Initialize variables
let videoPlayed = false;
let revealedCount = 0;
let totalRevealedCount = 0;
let revealedSets = 0;
let currentRow = 0;
let isDrawing = false;
let activeCanvas = null;
const CARDS_PER_ROW = 3;
const SETS_BEFORE_VIDEO = 4;
const SCRATCHES_BEFORE_VIDEO = 4;

// Video array
const videos = ['v1.mp4', 'v2.mp4', 'v3.mp4','v4.mp4', 'v5.mp4', 'v6.mp4'];

const birthdayTexts = [
  "Wysokich szczytów i bezpiecznych powrotów! 🏔️🧗‍♂️",
  "Niech kod zawsze się kompiluje za pierwszym razem! 💻✨",
  "Nowych szlaków i niesamowitych widoków! 🌎✈️",
  "Żeby każdy commit był bez bugów! 🐛✅",
  "Kolejnego tysiąca zdobytych szczytów! 🏔️💪",
  "Zawsze pewnej asekuracji i dobrych chwytów! 🧗‍♂️🪢",
  "Programowania z widokiem na góry! 💻🏔️",
  "Niezapomnianych przygód w każdym zakątku świata! 🌍🎒",
  "Stack overflow niech zawsze ma rozwiązanie! 👨‍💻🔍",
  "Magnezyji nigdy nie brakuje! 🧗‍♂️✨",
  "Git push do szczęścia i sukcesu! 🚀💫",
  "Dalekich podróży i bliskich przyjaźni! ✈️❤️",
  "Żeby każdy route był w Twoim zasięgu! 🎯🧗‍♂️",
  "Czystego kodu i pięknych widoków! 💻🌅",
  "Niech Twoje API nigdy nie crashuje! 🔧✨",
  "Najlepszych wspomnień z każdej wyprawy! 🎒📸",
  "Błękitnego nieba na każdej wspinaczce! ☀️🏔️",
  "Debugowania życia z uśmiechem! 😊💻",
  "Nowych projektów i wysokich lotów! 🚀💫",
  "Bezawaryjnego życiowego deploymentu! 🎯✨",
  "Zawsze zielonego pipe w CI/CD życia! 🟢🔄",
  "Energii na każdą górską trasę! 🏃‍♂️🏔️",
  "Commit do szczęścia każdego dnia! 💝💻",
  "Odkrywaj nowe szczyty możliwości! 🧗‍♂️🌟",
  "Pull request do marzeń zaakceptowany! ✅💫",
  "Programowania szczęścia na produkcji życia! 🎮💻",
  "Niech każda podróż będzie epicka! 🌎✈️",
  "Zero bugów w kodzie życia! 🐛❌",
  "Wspinaj się po szczeblach kariery! 🪜⭐",
  "Zawsze stabilnego internetu w podróży! 📶🌍",
  "Merge konfliktów z szczęściem! 🎯💫",
  "Backupów dobrych wspomnień! 💾💖",
  "Refaktoryzacji marzeń w rzeczywistość! 🎯✨",
  "Wysokiego uptime'u szczęścia! ⚡💫",
  "Optymalizacji radości każdego dnia! 🎨💝"
];

const cardColors = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Mint
  "#FFEEAD", // Yellow
  "#D4A5A5", // Pink
  "#9B59B6", // Purple
  "#3498DB", // Blue
  "#E67E22", // Orange
  "#2ECC71", // Green
  "#F1C40F", // Yellow
  "#E74C3C", // Red
  "#1ABC9C", // Turquoise
  "#34495E"  // Navy
];

function getTouchPos(touchEvent, canvas) {
  const rect = canvas.getBoundingClientRect();
  const touch = touchEvent.touches[0] || touchEvent.changedTouches[0];
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
}

// Generate image arrays with numbered format
const allImagePairs = Array.from({ length: 28 }, (_, i) => ({
  image: `${i + 1}.jpg`,
  text: birthdayTexts[i],
  color: cardColors[i]
}));

const headImages = Array.from({ length: 28 }, (_, i) => `${i + 1}.jpg`);

// Prevent right click and other interactions
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
  return false;
});

document.addEventListener('dragstart', function (e) {
  e.preventDefault();
  return false;
});

function showGoodbyeText() {
  const goodbyeOverlay = document.createElement('div');
  goodbyeOverlay.className = 'goodbye-overlay';
  goodbyeOverlay.innerHTML = `
    <div class="goodbye-text">
      <h1>Przytulice <br>Szymka!</h1>
    </div>
  `;
  document.body.appendChild(goodbyeOverlay);

  // Add some confetti for extra celebration
  for (let i = 0; i < 200; i++) {
    setTimeout(() => spawnConfetti(), i * 100);
  }

}

// Add click handler to close video manually
document.querySelector('.video-container').addEventListener('click', (e) => {
  if (e.target.classList.contains('video-container')) {
    e.target.classList.remove('visible');
  }
});

// Utility functions
function playYeeySound() {
  const sound = document.getElementById('yeeySound');
  sound.volume = 0.1;
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

// Update handleScratch to support both mouse and touch
function handleScratch(e) {
  if (!isDrawing) return;

  // Prevent scrolling while scratching
  e.preventDefault();

  const cards = document.querySelectorAll('.scratch-container canvas');
  cards.forEach(canvas => {
    const rect = canvas.getBoundingClientRect();

    // Get coordinates based on event type
    let x, y;
    if (e.type.includes('touch')) {
      const touch = e.touches[0] || e.changedTouches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Check if point is within canvas bounds
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      const ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'destination-out';

      // Draw the scratch
      ctx.beginPath();
      ctx.arc(x, y, 50, 0, Math.PI * 2);
      ctx.fill();

      // For smooth line between points
      if (canvas.lastX !== undefined && canvas.lastY !== undefined) {
        ctx.beginPath();
        ctx.lineWidth = 60;
        ctx.lineCap = 'round';
        ctx.moveTo(canvas.lastX, canvas.lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      canvas.lastX = x;
      canvas.lastY = y;

      // Check completion
      const container = canvas.parentElement;
      const dataRow = container.getAttribute('data-row');
      if (dataRow === currentRow.toString() && !container.revealed) {
        const percentage = calculateScratchPercentage(canvas);
        if (percentage > 60) {
          container.revealed = true;
          revealedCount++;
          totalRevealedCount++;
          spawnConfetti();
          playYeeySound();
          checkAllRevealed();
        }
      }
    } else {
      // Reset last position when moving outside a canvas
      canvas.lastX = undefined;
      canvas.lastY = undefined;
    }
  });
}
// Video handling
function playBirthdayVideo() {
 const videoContainer = document.getElementById('videoContainer');
  const video = document.getElementById('birthdayVideo');
  const videoSource = document.getElementById('videoSource');

  // Select the next video
  const videoIndex = videoPlayed % videos.length;
  videoSource.src = videos[videoIndex];
  video.load(); // Reload the video element to reflect the new source

  videoContainer.classList.add('visible');

  // Add muted attribute for autoplay to work on most browsers
  video.muted = true;
  video.play().then(() => {
    // Unmute after playback has started
    video.muted = false;
  }).catch(error => {
    console.error("Autoplay was prevented:", error);
    // Show a play button or instructions to the user
  });

  video.addEventListener('ended', () => {
    videoContainer.classList.remove('visible');
  });

  for (let i = 0; i < 3; i++) {
    setTimeout(() => spawnConfetti(), i * 500);
  }

  videoPlayed++;
}

// Card management functions
function checkAllRevealed() {
  // Check if it's time to play a video

   // Check if 28 cards have been cleared
  if (totalRevealedCount >= 28) {
    setTimeout(showGoodbyeText, 1000); // Show goodbye text after a short delay
  }else {
  if (totalRevealedCount % SCRATCHES_BEFORE_VIDEO === 0) {
    playBirthdayVideo();
  }



  console.log("revealedCount" + revealedCount, selected.length)
  if (revealedCount >= selected.length) {
    revealedCount = 0;
    revealedSets++;

    // Get current cards and make them spin
    const currentCards = document.querySelectorAll(`.scratch-container[data-row="${currentRow}"]`);
    currentCards.forEach(container => {
      container.classList.add('spinning');
      container.style.pointerEvents = 'none';
    });

    // Create new row
    currentRow++;
    createNewRow();

  }
  }
}

// Add at the top with other initializations
let usedImageIndices = new Set();

let selected = []

// Replace the createNewRow function with this updated version
function createNewRow() {
  const gallery = document.getElementById('gallery');

  // Create row container
  const rowDiv = document.createElement('div');
  rowDiv.className = 'card-row';
  rowDiv.setAttribute('data-row', currentRow);

  gallery.appendChild(rowDiv);

  // Reset used images if we've used them all
  if (usedImageIndices.size >= allImagePairs.length) {
    usedImageIndices.clear();
  }

  // Get available images (ones we haven't used yet)
  const availableImages = allImagePairs.filter((_, index) => !usedImageIndices.has(index));

  // Shuffle available images
  const shuffled = [...availableImages].sort(() => Math.random() - 0.5);

  // Take the first CARDS_PER_ROW images
  selected = shuffled.slice(0, CARDS_PER_ROW);

  // Mark these images as used
  selected.forEach(item => {
    const index = allImagePairs.findIndex(pair => pair === item);
    usedImageIndices.add(index);
  });

  // Create cards
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
  bottomImg.src = pair.image;
  bottomImg.className = 'bottom-image';
  bottomImg.draggable = false;

  bottomImg.onerror = function () {
    console.error(`Failed to load image: ${pair.image}`);
  };

  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;

  container.appendChild(bottomImg);
  container.appendChild(canvas);
  rowContainer.appendChild(container);

  // Draw colored rectangle with text
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = pair.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Word wrap function
  function wrapText(text, x, y, maxWidth, lineHeight) {
    try {
      const words = text.split(' ');
      let line = '';
      let lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      lines.forEach((line, i) => {
        ctx.fillText(line.trim(), x, y + (i * lineHeight));
      });
    } catch (e) {
      console.log("error")
    }
  }

  // Draw wrapped text
  wrapText(pair.text, canvas.width / 2, canvas.height / 2, canvas.width - 40, 30);
}

function createFloatingHead() {
  const head = document.createElement('img');
  head.className = 'floating-head';
  head.src = headImages[Math.floor(Math.random() * headImages.length)];
  head.draggable = false;

  head.onerror = function () {
    console.error(`Failed to load head image: ${head.src}`);
  };

  let posX = Math.random() * (window.innerWidth - 50);
  let posY = Math.random() * (window.innerHeight - 50);
  let speedX = (Math.random() - 0.5) * 8;
  let speedY = (Math.random() - 0.5) * 8;
  let rotation = 0;
  let rotationSpeed = (Math.random() - 0.5) * 4;

  head.style.left = posX + 'px';
  head.style.top = posY + 'px';

  function handleHeadInteraction() {
    spawnConfetti();
    playYeeySound();
    speedX *= 1.5;
    speedY *= 1.5;
  }

  head.addEventListener('click', handleHeadInteraction);
  head.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleHeadInteraction();
  }, { passive: false });

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

// Mouse Events
document.addEventListener('mousedown', (e) => {
  isDrawing = true;
  handleScratch(e);
});

document.addEventListener('mousemove', (e) => {
  handleScratch(e);
});

document.addEventListener('mouseup', () => {
  isDrawing = false;
});

document.addEventListener('mouseleave', () => {
  isDrawing = false;
});

// Touch Events
document.addEventListener('touchstart', (e) => {
  isDrawing = true;
  handleScratch(e);
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  handleScratch(e);
}, { passive: false });

document.addEventListener('touchend', () => {
  isDrawing = false;
});

document.addEventListener('touchcancel', () => {
  isDrawing = false;
});


// Initialize everything
for (let i = 0; i < 15; i++) {
  setTimeout(() => createFloatingHead(), i * 200);
}
createNewRow(); // Start with first row