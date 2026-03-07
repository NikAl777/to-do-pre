// 1. Вынесли селекторы в начало для удобства
const listElement = document.querySelector(".to-do__list");
const formElement = document.querySelector(".to-do__form");
const inputElement = document.querySelector(".to-do__input");
const itemTemplate = document.querySelector("#to-do__item-template");

// Дефолтные задачи (если localStorage пуст)
const defaultItems = [
  "Сделать проектную работу",
  "Полить цветы",
  "Пройти туториал по Реакту",
  "Сделать фронт для своего проекта",
  "Прогуляться по улице в солнечный день",
  "Помыть посуду",
];

// --- Функции работы с данными ---

function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");
  // Если в localStorage что-то есть, парсим. Если нет — берем дефолтные.
  return savedTasks ? JSON.parse(savedTasks) : defaultItems;
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTasksFromDOM() {
  const itemsNamesElements = document.querySelectorAll(".to-do__item-text");
  const tasks = [];
  itemsNamesElements.forEach((element) => {
    // trim() убирает лишние пробелы по краям
    tasks.push(element.textContent.trim());
  });
  return tasks;
}

// --- Функции работы с интерфейсом (DOM) ---

function createItem(itemText) {
  const clone = itemTemplate.content.firstElementChild.cloneNode(true);

  const textElement = clone.querySelector(".to-do__item-text");
  const deleteButton = clone.querySelector(".to-do__item-button_type_delete");
  const duplicateButton = clone.querySelector(
    ".to-do__item-button_type_duplicate",
  );
  const editButton = clone.querySelector(".to-do__item-button_type_edit");

  textElement.textContent = itemText;

  // Удаление
  deleteButton.addEventListener("click", () => {
    clone.remove();
    const currentTasks = getTasksFromDOM();
    saveTasks(currentTasks);
  });

  // Дублирование
  duplicateButton.addEventListener("click", () => {
    const itemName = textElement.textContent;
    const newItem = createItem(itemName);
    // Добавляем сразу после текущей задачи, чтобы было логичнее,
    // или можно listElement.prepend(newItem), как было у вас.
    clone.after(newItem);

    const currentTasks = getTasksFromDOM();
    saveTasks(currentTasks);
  });

  // Редактирование (клик по кнопке)
  editButton.addEventListener("click", () => {
    enableEditMode(textElement);
  });

  // Сохранение при потере фокуса (blur)
  textElement.addEventListener("blur", () => {
    disableEditMode(textElement);
    const currentTasks = getTasksFromDOM();
    saveTasks(currentTasks);
  });

  // Сохранение при нажатии Enter (улучшение UX)
  textElement.addEventListener("keydown", (evt) => {
    if (evt.key === "Enter") {
      evt.preventDefault(); // Чтобы не было переноса строки
      textElement.blur(); // Вызываем blur, который сохранит данные
    }
  });

  return clone;
}

// Вспомогательные функции для редактирования
function enableEditMode(element) {
  element.setAttribute("contenteditable", "true");
  element.focus();
  // Выделяем весь текст при редактировании
  document.execCommand("selectAll", false, null);
}

function disableEditMode(element) {
  element.setAttribute("contenteditable", "false");
  // Защита от пустых задач после редактирования
  if (!element.textContent.trim()) {
    element.textContent = "Пустая задача";
    // Или можно удалить элемент: element.closest('.to-do__item').remove();
  }
}

// --- Инициализация ---

// 1. Загружаем задачи
const initialTasks = loadTasks();

// 2. Отрисовываем их
initialTasks.forEach((item) => {
  const taskElement = createItem(item);
  listElement.append(taskElement);
});

// 3. Обработка формы добавления
formElement.addEventListener("submit", (event) => {
  event.preventDefault();

  const itemName = inputElement.value.trim();

  // Проверка: не добавляем пустые задачи
  if (!itemName) {
    return;
  }

  const newItem = createItem(itemName);
  listElement.prepend(newItem);

  inputElement.value = ""; // Очистка поля

  // Сохранение состояния
  const currentTasks = getTasksFromDOM();
  saveTasks(currentTasks);
});
