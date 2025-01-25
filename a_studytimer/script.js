/****************************************************
 * STUDY TIMER LOGIC
 ****************************************************/
let currentMode = 'Study';
let studyTime;
let breakTime;
let timerId = null;
let alertSound = new Audio('alert.wav');
let studyCompleteSound = new Audio('studycomplete.wav');
let breakCompleteSound = new Audio('breakcomplete.wav');
let chessWindow = null;
let paused = true;
let hasStarted = false;

// Total Study Time
let totalStudyTime = 0;
let studyThreshold = 3600; // 60 minutes
let bonusBreakTime = 600;  // 10 minutes
let lastUpdate = Date.now();

function sendTimeUpdate() {
  const minutes = Math.floor(studyTime / 60);
  const seconds = Math.floor(studyTime % 60);
  const timerTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  window.parent.postMessage({ timerTime }, '*');
}

function updateTimer() {
  clearTimeout(timerId);
  if (!paused) {
    let time = (currentMode === 'Study') ? studyTime : breakTime;
    console.log(`[Timer Update] Mode: ${currentMode}, Time Left: ${time}s`);

    if (time > 0) {
      if (currentMode === 'Study') {
        studyTime--;
        totalStudyTime++;
        updateTotalStudyTimeDisplay();
        if (totalStudyTime % studyThreshold === 0) {
          breakTime += bonusBreakTime;  // 1 hour => bonus break
          console.log("1 hour reached! Break +10min.");
        }
      } else {
        breakTime--;
      }
      // Alert at 10 seconds
      if (time <= 10 && time > 0) alertSound.play();
    } else {
      endCurrentSession();
    }
    displayTime();
    sendTimeUpdate();
  }
  timerId = setTimeout(updateTimer, 1000);
}

function displayTime() {
  const time = (currentMode === 'Study') ? studyTime : breakTime;
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  document.getElementById('timerLabel').textContent =
    `${currentMode} Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  sendTimeUpdate();
}

function updateTotalStudyTimeDisplay() {
  let minutes = Math.floor(totalStudyTime / 60);
  let seconds = totalStudyTime % 60;
  document.getElementById('totalStudyTimeLabel').textContent =
    `Total Study Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function setInitialTimes() {
  studyTime = 30 * 60;  // 30 min
  breakTime = 5 * 60;   // 5 min
  displayTime();
}

function openSetTimesDialog() {
  let studyInput = prompt("Enter study time in minutes:");
  let breakInput = prompt("Enter break time in minutes:");
  if (studyInput !== null && breakInput !== null) {
    let studyMinutes = parseInt(studyInput);
    let breakMinutes = parseInt(breakInput);
    if (!isNaN(studyMinutes) && studyMinutes > 0 && !isNaN(breakMinutes) && breakMinutes > 0) {
      studyTime = studyMinutes * 60;
      breakTime = breakMinutes * 60;
      console.log(`Times set: ${studyMinutes} min / ${breakMinutes} min`);
    } else {
      alert("Enter valid numbers please.");
    }
  }
  displayTime();
}

function endCurrentSession() {
  if (currentMode === 'Study') {
    studyCompleteSound.play();
    if (totalStudyTime >= studyThreshold) {
      breakTime += bonusBreakTime;
    }
    currentMode = 'Break';
    console.log("[Session End] Switch to Break.");
  } else {
    breakCompleteSound.play();
    currentMode = 'Study';
    console.log("[Session End] Switch to Study.");
  }
  clearTimeout(timerId);
  displayTime();
}

function resetTimer() {
  clearInterval(timerId);
  window.parent.postMessage({ timerTime: 'Study Hub' }, '*');
  console.log("Timer reset.");
}

function togglePause() {
  if (!hasStarted) {
    hasStarted = true;
    paused = false;
    document.getElementById('pauseButton').textContent = 'Pause';
    updateTimer();
    console.log("Timer started.");
  } else {
    paused = !paused;
    document.getElementById('pauseButton').textContent =
      paused ? 'Resume' : 'Pause';
    if (!paused) updateTimer();
    console.log(paused ? "Timer paused." : "Timer resumed.");
  }
}

document.addEventListener("DOMContentLoaded", function() {
  setInitialTimes();
  displayTime();
  document.getElementById('pauseButton').textContent = 'Start';
});

function switchMode() {
  clearTimeout(timerId);
  let studyIncrement = parseInt(document.getElementById('studyIncrement').value) * 60;
  let breakIncrement = parseInt(document.getElementById('breakIncrement').value);

  if (currentMode === 'Study') {
    currentMode = 'Break';
    if (!paused) {
      breakTime += breakIncrement;
      console.log(`Switch to Break, +${breakIncrement}s`);
    }
  } else {
    currentMode = 'Study';
    if (!paused) {
      studyTime += studyIncrement;
      console.log(`Switch to Study, +${studyIncrement / 60}min`);
    }
  }
  displayTime();
  if (!paused) updateTimer();
}

/****************************************************
 * BACKGROUND CONTROLS + PRESETS
 ****************************************************/
function applyGradient() {
  let color1 = document.getElementById('color1').value;
  let color2 = document.getElementById('color2').value;
  document.body.style.background = `linear-gradient(to bottom, ${color1}, ${color2})`;
}

function savePreset() {
  let color1 = document.getElementById('color1').value;
  let color2 = document.getElementById('color2').value;
  let presets = JSON.parse(localStorage.getItem('bgPresets')) || [];
  presets.push({ color1, color2 });
  localStorage.setItem('bgPresets', JSON.stringify(presets));
  loadPresetLibrary();
}

function loadPresetLibrary() {
  let presets = JSON.parse(localStorage.getItem('bgPresets')) || [];
  let presetContainer = document.getElementById('presetContainer');
  if (!presetContainer) return; // If no preset library in DOM, do nothing
  presetContainer.innerHTML = '';

  presets.forEach((preset, index) => {
    let div = document.createElement('div');
    div.className = 'preset-item';
    div.style.background = `linear-gradient(to bottom, ${preset.color1}, ${preset.color2})`;
    div.onclick = () => {
      document.getElementById('color1').value = preset.color1;
      document.getElementById('color2').value = preset.color2;
      applyGradient();
    };
    let removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerText = 'X';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      deletePreset(index);
    };
    div.appendChild(removeBtn);
    presetContainer.appendChild(div);
  });
}

function deletePreset(index) {
  let presets = JSON.parse(localStorage.getItem('bgPresets')) || [];
  presets.splice(index, 1);
  localStorage.setItem('bgPresets', JSON.stringify(presets));
  loadPresetLibrary();
}

// Load the preset library on page load
window.onload = function() {
  loadPresetLibrary();
};

/****************************************************
 * LOG DAILY STUDY TIME + GRAPH
 ****************************************************/
/**
 * Save today's totalStudyTime (in minutes) to localStorage
 * Then re-render the chart
 */
function logDailyStudy() {
  // Convert totalStudyTime (seconds) to minutes
  let minutes = Math.floor(totalStudyTime / 60);

  // Today's date in YYYY-MM-DD
  let today = new Date().toISOString().split('T')[0];

  // Load existing logs
  let studyLogs = JSON.parse(localStorage.getItem('studyLogs')) || [];
  // Check if today's entry exists
  let existing = studyLogs.find(item => item.date === today);
  if (existing) {
    // Add the new minutes to whatever's stored
    existing.minutes += minutes;
  } else {
    studyLogs.push({ date: today, minutes });
  }
  localStorage.setItem('studyLogs', JSON.stringify(studyLogs));

  alert(`Logged ${minutes} minutes of study for ${today}!`);
  renderStudyGraph();
}

/**
 * Render a simple bar chart of daily study times
 * Each bar's height depends on the max minutes studied in the logs
 */
function renderStudyGraph() {
  let container = document.getElementById('studyGraph');
  if (!container) return; // If no chart container, skip
  container.innerHTML = '';

  let studyLogs = JSON.parse(localStorage.getItem('studyLogs')) || [];
  if (studyLogs.length === 0) {
    container.innerHTML = '<p>No study logs found. Log your study time!</p>';
    return;
  }

  // Sort logs by date ascending
  studyLogs.sort((a,b) => a.date.localeCompare(b.date));

  // Find max minutes to scale bar heights
  let maxMinutes = Math.max(...studyLogs.map(i => i.minutes));

  // For each day, create a bar
  studyLogs.forEach(item => {
    let barWrapper = document.createElement('div');
    barWrapper.className = 'bar-wrapper';

    let label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = `${item.date} — ${item.minutes} min`;

    let bar = document.createElement('div');
    bar.className = 'bar';
    // Height is a percentage of max
    let percent = maxMinutes ? (item.minutes / maxMinutes) * 100 : 0;
    bar.style.height = percent + '%';
    bar.title = `${item.date}: ${item.minutes} min`;

    barWrapper.appendChild(bar);
    barWrapper.appendChild(label);
    container.appendChild(barWrapper);
  });
}

// After page load, render the chart
document.addEventListener('DOMContentLoaded', renderStudyGraph);
