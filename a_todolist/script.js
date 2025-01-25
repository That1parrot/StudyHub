let tasks = [];
let jingleSound = new Audio('jingle.mp3');

document.addEventListener('DOMContentLoaded', function () {
  loadTasksFromStorage();
  updateProgress();

  // Add event listener to Add Task button
  document.getElementById('add-button').addEventListener('click', addTask);

  // Add event listener for exporting tasks
  document.getElementById('export-button').addEventListener('click', exportTasks);

  // Add event listener for importing tasks
  document.getElementById('import-file').addEventListener('change', importTasks);

  // Initialize sortable task list
  initializeSortable();

  // Load background presets
  loadPresetLibrary();
});

function initializeSortable() {
  const incompleteTaskList = document.getElementById('incomplete-task-list');
  new Sortable(incompleteTaskList, {
    animation: 150,
    onEnd: function () {
      console.log("Tasks reordered");
    }
  });
}

function addTask() {
  const taskInput = document.getElementById('new-task').value;
  const dueDateTime = document.getElementById('due-date-time').value;
  const priority = document.getElementById('priority').value;
  const category = document.getElementById('category').value;

  if (!taskInput.trim()) {
    alert("Task cannot be empty!");
    return;
  }
  if (!dueDateTime) {
    const confirmProceed = confirm("No date/time. Proceed anyway?");
    if (!confirmProceed) return;
  }

  const task = {
    text: taskInput,
    completed: false,
    dueDate: dueDateTime || '',
    priority: priority,
    category: category || 'General'
  };

  tasks.push(task);
  saveTasksToStorage();
  renderTasks();
  updateProgress();

  // Clear fields
  document.getElementById('new-task').value = '';
  document.getElementById('due-date-time').value = '';
  document.getElementById('priority').value = 'low';
  document.getElementById('category').value = '';
}

document.getElementById("new-task").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
    event.preventDefault();
    this.value = "";
    this.focus();
  }
});

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasksToStorage();
  renderTasks();
  updateProgress();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasksToStorage();
  renderTasks();
  updateProgress();
}

function editTask(index) {
  // 1) Edit Task Name
  const taskText = prompt("Edit your task name:", tasks[index].text);
  if (taskText !== null && taskText.trim() !== '') {
    tasks[index].text = taskText.trim();
  }

  // 2) Edit Due Date
  const currentDue = tasks[index].dueDate ? new Date(tasks[index].dueDate) : new Date();
  const dateInput = prompt("Edit due date (YYYY-MM-DD):",
    `${currentDue.getFullYear()}-${(currentDue.getMonth()+1).toString().padStart(2,'0')}-${currentDue.getDate().toString().padStart(2,'0')}`
  );
  if (dateInput) {
    const [yr,mo,dy] = dateInput.split('-');
    currentDue.setFullYear(yr, mo-1, dy);
  }

  // 3) Edit Time
  const timeInput = prompt("Edit time (HH:MM AM/PM):",
    `${(currentDue.getHours()%12||12).toString().padStart(2,'0')}:${currentDue.getMinutes().toString().padStart(2,'0')} ${currentDue.getHours()>=12?'PM':'AM'}`
  );
  if (timeInput) {
    const [time,ampm] = timeInput.split(' ');
    const [hr,mn] = time.split(':');
    let hour24 = parseInt(hr);
    if (ampm.toUpperCase()==='PM' && hour24!==12) hour24+=12;
    else if (ampm.toUpperCase()==='AM' && hour24===12) hour24=0;
    currentDue.setHours(hour24,mn);
    tasks[index].dueDate = currentDue.toISOString();
  }

  // 4) Edit Priority
  const pty = prompt("Edit priority (low, medium, high):", tasks[index].priority);
  if (pty && ['low','medium','high'].includes(pty.toLowerCase())) {
    tasks[index].priority = pty.toLowerCase();
  }

  // 5) Edit Category
  const cat = prompt("Edit category:", tasks[index].category || 'General');
  if (cat !== null && cat.trim() !== '') {
    tasks[index].category = cat.trim();
  }

  saveTasksToStorage();
  renderTasks();
}

function saveTasksToStorage() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromStorage() {
  const stored = localStorage.getItem('tasks');
  if (stored) tasks = JSON.parse(stored);
  renderTasks();
  updateProgress();
}

function renderTasks() {
  const incompleteList = document.getElementById('incomplete-task-list');
  const completedList = document.getElementById('completed-task-list');
  incompleteList.innerHTML = '';
  completedList.innerHTML = '';

  tasks.forEach((task, index)=>{
    const li = document.createElement('li');
    li.className = `task ${task.priority}-priority`;

    const dueDisplay = task.dueDate ? ` (Due: ${new Date(task.dueDate).toLocaleString()})` : '';
    const catDisplay = task.category ? ` - ${task.category}` : '';

    li.innerHTML = `
      <span class="${task.completed?'completed-task':''}" onclick="toggleTask(${index})">
        ${task.text}${dueDisplay}${catDisplay}
      </span>
      <div>
        <button class="complete" onclick="toggleTask(${index})">${task.completed?'Undo':'Done'}</button>
        <button class="edit" onclick="editTask(${index})">Edit</button>
        <button class="delete" onclick="deleteTask(${index})">Delete</button>
      </div>
    `;
    if (task.completed) completedList.appendChild(li);
    else incompleteList.appendChild(li);
  });
  initializeSortable();
}

function updateProgress() {
  const progressBar = document.getElementById('progress');
  const total = tasks.length;
  const done = tasks.filter(t=>t.completed).length;
  if (total===0) {
    progressBar.style.width='0%';
  } else {
    const percent=(done/total)*100;
    progressBar.style.width=percent+'%';
    if (percent===100) jingleSound.play();
  }
}

function exportTasks() {
  if(tasks.length===0) {
    alert("No tasks to export.");
    return;
  }
  // 5 columns: text, completed, dueDate, priority, category
  const csvRows=[];
  const headers=['Task','Completed','Due Date','Priority','Category'];
  csvRows.push(headers.join(','));

  tasks.forEach(t=>{
    const row=[
      t.text.replace(/,/g,''),
      t.completed,
      t.dueDate||'',
      t.priority,
      t.category||''
    ];
    csvRows.push(row.join(','));
  });
  const csvContent=csvRows.join('\n');
  const blob=new Blob([csvContent],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='tasks.csv';
  a.click();
}

function importTasks(e) {
  const file=e.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=(ev=>{
    const csv=ev.target.result;
    const rows=csv.split('\n');
    if(rows.length<2){
      alert("CSV file empty or invalid.");
      return;
    }
    // 5 columns now
    const imported = rows.slice(1).map(r=>{
      const cols=r.split(',');
      if(cols.length===5){
        return {
          text:cols[0].trim(),
          completed:(cols[1]==='true'),
          dueDate:cols[2]?new Date(cols[2]).toISOString():'',
          priority:cols[3]||'low',
          category:cols[4]||'General'
        };
      } else {
        alert("CSV not formatted correctly (needs 5 columns).");
      }
    }).filter(Boolean);

    if(imported.length){
      tasks=tasks.concat(imported);
      saveTasksToStorage();
      renderTasks();
      updateProgress();
    } else {
      alert("No tasks imported.");
    }
  });
  reader.readAsText(file);
}

/***********************************************
  BACKGROUND GRADIENT & PRESET LIBRARY
***********************************************/
function applyGradient() {
  const color1=document.getElementById('color1').value;
  const color2=document.getElementById('color2').value;
  document.body.style.backgroundImage=`linear-gradient(${color1}, ${color2})`;
  document.body.style.backgroundSize='cover';
}

function savePreset() {
  let color1=document.getElementById('color1').value;
  let color2=document.getElementById('color2').value;
  let presets=JSON.parse(localStorage.getItem('bgPresets'))||[];
  presets.push({ color1, color2 });
  localStorage.setItem('bgPresets',JSON.stringify(presets));
  loadPresetLibrary();
}

function loadPresetLibrary() {
  let presets=JSON.parse(localStorage.getItem('bgPresets'))||[];
  let presetContainer=document.getElementById('presetContainer');
  if(!presetContainer)return;
  presetContainer.innerHTML='';
  presets.forEach((p,index)=>{
    let div=document.createElement('div');
    div.className='preset-item';
    div.style.background=`linear-gradient(to bottom, ${p.color1}, ${p.color2})`;
    div.onclick=()=>{
      document.getElementById('color1').value=p.color1;
      document.getElementById('color2').value=p.color2;
      applyGradient();
    };
    let removeBtn=document.createElement('button');
    removeBtn.className='remove-btn';
    removeBtn.innerText='X';
    removeBtn.onclick=(evt)=>{
      evt.stopPropagation();
      deletePreset(index);
    };
    div.appendChild(removeBtn);
    presetContainer.appendChild(div);
  });
}

function deletePreset(index){
  let presets=JSON.parse(localStorage.getItem('bgPresets'))||[];
  presets.splice(index,1);
  localStorage.setItem('bgPresets',JSON.stringify(presets));
  loadPresetLibrary();
}
