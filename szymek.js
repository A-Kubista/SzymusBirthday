// Initialize variables
let videoPlayed = false;
let revealedCount = 0;
let revealedSets = 0;
let currentRow = 0;
let isDrawing = false;
let activeCanvas = null;
const CARDS_PER_ROW = 3;
const SETS_BEFORE_VIDEO = 5;

// Text and color arrays
const birthdayTexts = [
    "Happy Birthday Szymek! 🎉",
    "You're Awesome! 🌟",
    "Best Friend Ever! 🎈",
    "Party Time! 🎊",
    "Make a Wish! ⭐",
    "Birthday Boy! 🎂",
    "Celebrate Good Times! 🎵",
    "Another Amazing Year! 🎁",
    "Keep Smiling! 😊",
    "You Rock! 🤘",
    "Time to Celebrate! 🥳",
    "Birthday Legend! 👑",
    "Special Day! 💫",
    "Fantastic Friend! 🌈"
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

// Generate image arrays with numbered format
const allImagePairs = Array.from({ length: 14 }, (_, i) => ({
    image: `${i + 1}.jpg`,
    text: birthdayTexts[i],
    color: cardColors[i]
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

document.addEventListener('keydown', function(e) {
    if (
        (e.ctrlKey && (
            e.keyCode === 67 || // Ctrl+C
            e.keyCode === 86 || // Ctrl+V
            e.keyCode === 85 || // Ctrl+U
            e.keyCode === 83 || // Ctrl+S
            e.keyCode === 80 || // Ctrl+P
            e.keyCode === 123   // F12
        )) ||
        e.keyCode === 123 ||    // F12
        (e.ctrlKey && e.shiftKey && 
            (e.keyCode === 73 || // Ctrl+Shift+I
             e.keyCode === 74)    // Ctrl+Shift+J
        )
    ) {
        e.preventDefault();
        return false;
    }
});

// Add click handler to close video manually
document.querySelector('.video-container').addEventListener('click', (e) => {
    if (e.target.classList.contains('video-container')) {
        e.target.classList.remove('visible');
    }
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

// Scratch handling function
function handleScratch(e) {
  if (!isDrawing) return;

  // Get all scratch cards
  const cards = document.querySelectorAll('.scratch-container canvas');
  cards.forEach(canvas => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if point is within canvas bounds
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          const ctx = canvas.getContext('2d');
          ctx.globalCompositeOperation = 'destination-out';
          
          // Draw the scratch
          ctx.beginPath();
          ctx.arc(x, y, 45, 0, Math.PI * 2);
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
  
  videoContainer.classList.add('visible');
  video.play();
  
  video.addEventListener('ended', () => {
      videoContainer.classList.remove('visible');
  });
  
  for (let i = 0; i < 3; i++) {
      setTimeout(() => spawnConfetti(), i * 500);
  }
}

// Card management functions
function checkAllRevealed() {
  if (revealedCount >= CARDS_PER_ROW) {
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
          // Create new row
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
  rowDiv.setAttribute('data-row', currentRow);
  
  gallery.appendChild(rowDiv);
  
  // Add new cards to the row
  const shuffled = [...allImagePairs].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, CARDS_PER_ROW);
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
  
  bottomImg.onerror = function() {
      console.error(`Failed to load image: ${pair.image}`);
      this.src = 'fallback.jpg';
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
      const words = text.split(' ');
      let line = '';
      let lines = [];

      for(let n = 0; n < words.length; n++) {
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
  }

  // Draw wrapped text
  wrapText(pair.text, canvas.width/2, canvas.height/2, canvas.width - 40, 30);
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

// Global scratch event listeners
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

// Initialize everything
for (let i = 0; i < 15; i++) {
  setTimeout(() => createFloatingHead(), i * 200);
}
createNewRow(); // Start with first row