// Add and save tasks
const addBtns = document.querySelectorAll('.add-btn:not(.solid)');
const saveTaskBtns = document.querySelectorAll('.solid');
const addTaskContainers = document.querySelectorAll('.add-container');
const addTasks = document.querySelectorAll('.add-task');
// Task lists
const taskListColumns = document.querySelectorAll('.drag-task-list');
const toDoList = document.getElementById('toDo-list');
const inProgressList = document.getElementById('inProgress-list');
const completedList = document.getElementById('completed-list');
const onHoldList = document.getElementById('on-hold-list');

// Initialize
let updatedOnLoad = false;

// Initialize Arrays
let toDoListArray = [];
let inProgressListArray = [];
let completedListArray = [];
let onHoldListArray = [];
let listArrays = [];

// Drag functionality global variables
let draggedTask;
let dragging = false;
let currentColumn;

// Get arrays from local storage, if available, and set default values, if not
const getSavedColumns = function () {
  if (localStorage.getItem('toDoTasks')) {
    toDoListArray = JSON.parse(localStorage.toDoTasks);
    inProgressListArray = JSON.parse(localStorage.inProgressTasks);
    completedListArray = JSON.parse(localStorage.completedTasks);
    onHoldListArray = JSON.parse(localStorage.onHoldTasks);
  } else {
    toDoListArray = ['Modify tasks'];
    inProgressListArray = ['Add tasks'];
    completedListArray = ['Remove tasks'];
    onHoldListArray = ['Store tasks'];
  }
};

// Set local storage Arrays
const updateSavedColumns = function () {
  // Populate the list of arrays with each column's array
  listArrays = [
    toDoListArray,
    inProgressListArray,
    completedListArray,
    onHoldListArray,
  ];
  // Set the key and value for each four local storage items and set them
  const arrayNames = ['toDo', 'inProgress', 'completed', 'onHold']; // helps using the foreach loop
  arrayNames.forEach((arrayName, index) =>
    localStorage.setItem(`${arrayName}Tasks`, JSON.stringify(listArrays[index]))
  );
};

// Filter out null elements from arrays (which result from removing an item)
const filterArray = function (array) {
  const filteredArray = array.filter(item => item !== null);
  return filteredArray;
};

// Create DOM elements for each task
const createTaskEl = function (columnEl, column, task, index) {
  // Creating task element in the DOM
  const listEl = document.createElement('li');
  listEl.classList.add('drag-task');
  listEl.textContent = task;
  listEl.id = index;
  // Task drag functionality
  listEl.draggable = true;
  listEl.setAttribute('ondragstart', 'drag(event)');
  listEl.setAttribute('onfocusout', `updateTask(${index}, ${column})`);
  // Allowing to edit the content of a task
  listEl.contentEditable = true;
  // Append element to the column
  columnEl.appendChild(listEl);
};

// Update Columns in DOM - Reset HTML, Filter Array, Update localStorage
const updateDOM = function () {
  // Check local storage once
  if (!updatedOnLoad) getSavedColumns();
  // To do column
  toDoList.textContent = ''; // reset html
  toDoListArray.forEach((toDoTask, index) =>
    createTaskEl(toDoList, 0, toDoTask, index)
  ); // creating the task element
  toDoListArray = filterArray(toDoListArray); // filter out the nulls
  // In progress column
  inProgressList.textContent = '';
  inProgressListArray.forEach((inProgressTask, index) =>
    createTaskEl(inProgressList, 1, inProgressTask, index)
  );
  inProgressListArray = filterArray(inProgressListArray);
  // Completed column
  completedList.textContent = '';
  completedListArray.forEach((completedTask, index) =>
    createTaskEl(completedList, 2, completedTask, index)
  );
  completedListArray = filterArray(completedListArray);
  // On hold column
  onHoldList.textContent = '';
  onHoldListArray.forEach((onHoldTask, index) =>
    createTaskEl(onHoldList, 3, onHoldTask, index)
  );
  onHoldListArray = filterArray(onHoldListArray);
  // Run getSavedColumns only once
  updatedOnLoad = true;
  // Update local storage
  updateSavedColumns();
};

// Delete or update task value
const updateTask = function (id, column) {
  const selectedArray = listArrays[column];
  const selectedColumnEl = taskListColumns[column].children;
  // Possible only when not dragging
  if (!dragging) {
    // Delete task when field is emptied, else update task value
    !selectedColumnEl[id].textContent
      ? delete selectedArray[id]
      : (selectedArray[id] = selectedColumnEl[id].textContent);
    //
    updateDOM();
  }
};

// Add task
const addToColumn = function (column) {
  // Add to the right column
  const taskText = addTasks[column].textContent;
  const selectedArray = listArrays[column];
  // Push task to the selected column's array
  selectedArray.push(taskText);
  // Empty the text box after push
  addTasks[column].textContent = '';
  //
  updateDOM();
};

// Show add task input box (called in html)
const showInputBox = function (column) {
  // Hide the add button
  addBtns[column].style.visibility = 'hidden';
  // Show the save button and the input field
  saveTaskBtns[column].style.display = 'flex';
  addTaskContainers[column].style.display = 'flex';
};

// Hide add task input box (called in html)
const hideInputBox = function (column) {
  // Show the add button
  addBtns[column].style.visibility = 'visible';
  // Hide the save button and the input field
  saveTaskBtns[column].style.display = 'none';
  addTaskContainers[column].style.display = 'none';
  //
  addToColumn(column);
};

// New arrays
const rebuildArrays = function () {
  // Populating the arrays with the tasks
  toDoListArray = Array.from(toDoList.children).map(task => task.textContent);
  inProgressListArray = Array.from(inProgressList.children).map(
    task => task.textContent
  );
  completedListArray = Array.from(completedList.children).map(
    task => task.textContent
  );
  onHoldListArray = Array.from(onHoldList.children).map(
    task => task.textContent
  );
  //
  updateDOM();
};

// Start to drag task (called in html, by setting attribute in js)
const drag = function (event) {
  // Assign the task element to the event target
  draggedTask = event.target;
  // Set the global variable to true to prevent task edit
  dragging = true;
};

// Allow task drop (called in html)
const allowDrop = function (event) {
  // Prevent default allows to drop
  event.preventDefault();
};

// Task enter (called in html)
const dragEnter = function (column) {
  // Highlight the drop column
  taskListColumns[column].classList.add('over');
  // The column where the task is entering is the new column
  currentColumn = column;
};

// Drop task (called in html)
const drop = function (event) {
  // Prevent the browser default handling of the data
  event.preventDefault();
  // Stop column highlight
  taskListColumns.forEach(column => column.classList.remove('over'));
  // Append the task to the column
  const parent = taskListColumns[currentColumn];
  parent.appendChild(draggedTask);
  // Allow to edit the task after it has been dropped
  dragging = false;
  //
  rebuildArrays();
};

// Initialization
updateDOM();
