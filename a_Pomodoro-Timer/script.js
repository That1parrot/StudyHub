// Pomodoro Timer logic
let workTime = 25 * 60;  // 25 minutes in seconds
let breakTime = 5 * 60;   // 5 minutes in seconds
let timeLeft = workTime;  // Time left to display
let isWorkTime = true;    // Flag to track work/break time
let isRunning = false;    // Flag to track if the timer is running
let isPaused = false;     // Flag to track if the timer is paused
let timerId = null;       // To store the setInterval ID
let startTime;            // To store the start time of the timer
let alertInterval = null;  // Variable to store the alert sound interval

// DOM elements
const timerElement = document.getElementById('timer');
const progressCircle = document.querySelector('circle.progress');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');
const workInput = document.getElementById('workTime');
const breakInput = document.getElementById('breakTime');
let alertSound = new Audio('alert.wav');  // Alert sound

// Disable reset initially
resetBtn.disabled = true;

// Start or Pause the timer
function toggleStartPause() {
    if (!isRunning) {
        startTimer();  // If the timer isn't running, start it
    } else {
        pauseTimer();  // If the timer is running, pause it
    }
}

function startTimer() {
    if (isRunning) return;  // Prevent multiple intervals from being created

    isRunning = true;
    isPaused = false;
    resetBtn.disabled = false;  // Enable reset button

    if (!startTime || isPaused) {
        startTime = Date.now() - (isWorkTime ? (workTime - timeLeft) : (breakTime - timeLeft)) * 1000;  // Resume from where we paused
    } else {
        startTime = Date.now();
        timeLeft = isWorkTime ? workTime : breakTime;  // Reset time to work/break time
    }

    startPauseBtn.textContent = "Pause";
    startPauseBtn.style.backgroundColor = "#969900";  // Custom button color

    const endTime = startTime + timeLeft * 1000;

    timerId = setInterval(() => {
        let now = Date.now();
        timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));  // Remaining time in seconds
        updateDisplay(timeLeft);  // Update the timer display
        updateProgress();  // Update progress circle

        // Play alert sound every second for the last 10 seconds
        if (timeLeft <= 10 && timeLeft > 0 && !playedAlerts) {
            if (!alertInterval) {
                alertInterval = setInterval(() => {
                    alertSound.play().catch((e) => {
                        console.log('Failed to play alert sound:', e);
                    });
                }, 1000);  // Play sound every second
            }
            playedAlerts = true;  // Mark alerts as played
        }

        // When the time runs out, switch between work and break modes
        if (timeLeft <= 0) {
            clearInterval(timerId);  // Clear the timer interval
            clearInterval(alertInterval);  // Stop the alert sound loop
            alertInterval = null;  // Reset alertInterval
            isWorkTime = !isWorkTime;  // Toggle between work and break
            timeLeft = isWorkTime ? workTime : breakTime;  // Reset for the next session
            playedAlerts = false;  // Reset alert flag
            startPauseBtn.textContent = "Start";
            startPauseBtn.style.backgroundColor = "";  // Reset button color
            resetProgress();  // Reset progress bar
            isRunning = false;  // Timer is no longer running

            // Automatically start the next session (work or break)
            startTimer();
        }
    }, 1000);  // Update every second
}



// Pause the timer
function pauseTimer() {
    clearInterval(timerId);  // Stop the timer
    isPaused = true;  // Set the paused flag
    isRunning = false;  // Mark the timer as no longer running
    startPauseBtn.textContent = "Start";  // Change back to 'Start'
    startPauseBtn.style.backgroundColor = "";  // Reset button color
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    isPaused = false;
    isWorkTime = true;
    timeLeft = workTime;
    updateDisplay(timeLeft);
    resetProgress();
    startPauseBtn.textContent = 'Start';
    startPauseBtn.style.backgroundColor = '';
    resetBtn.disabled = true;

    // Reset the tab title when the timer is reset
    window.parent.postMessage({ timerTime: 'Study Hub' }, '*');  // Reset title to default
}


// Update the timer display
function updateDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update the circular progress
function updateProgress() {
    const totalTime = isWorkTime ? workTime : breakTime;
    const progress = (timeLeft / totalTime) * 565;  // 565 is the circumference of the circle
    progressCircle.style.strokeDashoffset = progress;
}

// Reset the circular progress
function resetProgress() {
    progressCircle.style.strokeDashoffset = 565;  // Reset to full circle
}

// Adjust work and break times based on user input
workInput.addEventListener('change', () => {
    workTime = workInput.value * 60;  // Convert minutes to seconds
    resetTimer();  // Reset the timer when time is changed
});

breakInput.addEventListener('change', () => {
    breakTime = breakInput.value * 60;  // Convert minutes to seconds
    resetTimer();  // Reset the timer when time is changed
});

// Event listeners
startPauseBtn.addEventListener('click', toggleStartPause);
resetBtn.addEventListener('click', resetTimer);

// Initialize timer display
timerElement.textContent = `${Math.floor(workTime / 60).toString().padStart(2, '0')}:00`;  // Initialize with default 25 minutes

















// Apply gradient to background
function applyGradient() {
    const color1 = document.getElementById('color1').value;
    const color2 = document.getElementById('color2').value;
    document.body.style.background = `linear-gradient(to bottom, ${color1}, ${color2})`;
}



// Format time for display (MM:SS)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsRemaining = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secondsRemaining.toString().padStart(2, '0')}`;
}

// Toggle between work and break mode
function toggleBreak() {
    onBreak = !onBreak;
    if (onBreak) {
        timeLeft = breakTime;
        bar.set(0); // Reset the progress bar for break time
        bar.animate(1, { duration: breakTime * 1000 });
        startTimer(); // Automatically start the break
    } else {
        timeLeft = workTime;
        bar.set(0); // Reset the progress bar for work time
        bar.animate(1, { duration: workTime * 1000 });
        startTimer(); // Automatically start the work session
    }
}

// Adjust work and break times
workInput.addEventListener('change', () => {
    workTime = workInput.value * 60; // Convert minutes to seconds
    resetTimer();
});

breakInput.addEventListener('change', () => {
    breakTime = breakInput.value * 60; // Convert minutes to seconds
    resetTimer();
});

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

// Initialize timer display
timerElement.textContent = formatTime(1500); // Default 25 minutes






//BACKGROUND



// Toggle background customization panel
function toggleGradientControls() {
    var gradientControls = document.getElementById('backgroundLibrary');
    gradientControls.style.display = (gradientControls.style.display === 'none' || gradientControls.style.display === '') ? 'block' : 'none';
}

// Apply gradient background
function applyGradient() {
    var color1 = document.getElementById('color1').value;
    var color2 = document.getElementById('color2').value;
    document.body.style.background = `linear-gradient(to bottom, ${color1}, ${color2})`;
}

document.getElementById('startBtn').addEventListener('click', function() {
    // If there's already a running timer, clear it
    if (timerId !== null) {
        clearInterval(timerId);
    }
    startTimer();  // Start the timer
    this.disabled = true;  // Disable the Start button after it's clicked
});

document.getElementById('resetBtn').addEventListener('click', function() {
    if (timerId !== null) {
        clearInterval(timerId);  // Clear the running timer
        timerId = null;  // Reset the timerId
    }
    resetTimer();  // Reset the timer display and values
    document.getElementById('startBtn').disabled = false;  // Re-enable the Start button after reset
});


function updateParentWithTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

    // Send the time left to the parent windowa
    window.parent.postMessage({ timerTime: timeString }, '*');
}

function updateDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

    // Send the time to the parent window
    updateParentWithTime(seconds);
}
