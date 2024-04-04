var elementsJSON = null;
const elementsList = document.getElementById("elements");
const elementInput = document.getElementById("element-input");
const periodicTable = document.getElementById("periodic-table");
const guessDisplay = document.getElementById("guess-display-div");
const elementToNumber = new Map();

var hiddenElement = null;
var guessedElements = [];
var guesses = 0;

// guess also on enter
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    guess();
  }
});

// update elements selector and load json file
window.onload = function () {
  fetch("./PeriodicTableJSON.json")
    .then((response) => response.json())
    .then(function (json) {
      elementsJSON = json;
      for (i = 0; i < 118; ++i) {
        element = document.createElement("option");
        element.value = elementsJSON.elements[i].name;
        elementsList.appendChild(element);
        elementToNumber.set(elementsJSON.elements[i].name, i);
      }

      // shuffle elements list
      for (i = elementsList.children.length; i >= 0; i--) {
        elementsList.appendChild(
          elementsList.children[(Math.random() * i) | 0]
        );
      }

      hiddenElement = getRandomElement();

      buildPeriodicTable();
    });
};

/**
 * Guesses the element in the input
 */
function guess() {
  elementInput.value =
    elementInput.value.charAt(0).toUpperCase() +
    elementInput.value.substring(1);

  elementInput.value = elementInput.value.trim();

  if (elementToNumber.has(elementInput.value)) {
    reveal();

    if (!guessedElements.includes(elementInput.value)) {
      guesses++;
      guessedElements.push(elementInput.value);

      updateElementDisplay();
    }

    if (elementInput.value == hiddenElement) {
      // TODO: FIX ENDING!!!!
      revealAll();
    }

    elementInput.value = "";
  }
}

/**
 * Gets all the data about the element
 * @param {*} name Element name
 * @returns all json data about element from 'PeriodicTableJSON.json'
 */
function getElementData(name) {
  return elementsJSON.elements[elementToNumber.get(name)];
}

/**
 * Gets HTML element based on position, so gets correct element based on
 * x,y of peiodic table element
 * @param {*} x x coordinate
 * @param {*} y y coordinate
 * @returns the HTML element
 */
function getElementByPosition(x, y) {
  var ret = periodicTable.getElementsByTagName("tr")[parseInt(y - 1)];
  return ret.getElementsByTagName("td")[parseInt(x - 1)];
}

/**
 * Gets the position of the element on the periodic table
 * @param {*} name the element's name
 * @returns The x and y coordinate of the element
 */
function getElementPosition(name) {
  return { x: getElementData(name).xpos, y: getElementData(name).ypos };
}

function revealAll() {
  for (i = 0; i < 118; ++i) {
    elementInput.value = elementsJSON.elements[i].name;
    reveal();
  }

  elementInput.value = "";
}

/**
 * Reveals a perioic table element and sets proper color to HTML element
 */
function reveal() {
  var elementData = getElementData(elementInput.value);
  var tableElement = getElementByPosition(elementData.xpos, elementData.ypos);
  tableElement.classList = "guessed";

  var hpos = getElementPosition(hiddenElement);
  var gpos = getElementPosition(elementInput.value);

  var hsl = calcHSL(hpos, gpos);
  tableElement.style.backgroundColor = hsl;
  // tableElement.style.boxShadow = "0px 0px 5px " + hsl;
}

function calcHSL(gpos, hpos) {
  var distance = Math.sqrt(
    Math.pow(gpos.x - hpos.x, 2) + Math.pow(gpos.y - hpos.y, 2)
  );

  // seems to be a decent distribution of color
  var hue = 120 * (1 - Math.pow(distance / 19, 0.42));
  var hsl = "hsl(" + hue + ", 100%, 50%)";

  return hsl;
}

/**
 * Builds the periodic table based on positions in 'PeriodicTableJSON.json'
 */
function buildPeriodicTable() {
  var isElement = false;
  for (j = 0; j < 10; j++) {
    currentRow = document.createElement("tr");
    for (i = 0; i < 18; i++) {
      for (e = 0; e < 118; e++) {
        var element = elementsJSON.elements[e];
        if (element.xpos == i + 1 && element.ypos == j + 1) {
          var elementData = document.createElement("td");
          var innerDiv = document.createElement("div");
          elementData.classList = "not-guessed";
          innerDiv.classList = "table-data";
          innerDiv.innerHTML = `<span>${e + 1}</span><span>${
            element.symbol
          }</span>`;
          elementData.appendChild(innerDiv);
          currentRow.appendChild(elementData);
          isElement = true;
        }
      }

      if (!isElement) {
        currentRow.appendChild(document.createElement("td"));
      }

      isElement = false;
    }

    periodicTable.appendChild(currentRow);
  }
}

function getRandomElement() {
  return elementsJSON.elements[(Math.random() * 118) | 0].name;
}

function reset() {
  guesses = 0;
  hiddenElement = getRandomElement();
  guessedElements = [];
}

function updateElementDisplay() {
  var el = document.createElement("div");
      el.style.width = periodicTable.getBoundingClientRect().width;
      el.innerHTML = elementInput.value;

      var gpos = getElementPosition(elementInput.value);
      var hpos = getElementPosition(hiddenElement);

      var hsl = calcHSL(gpos, hpos);

      var distance = Math.sqrt(
        Math.pow(gpos.x - hpos.x, 2) + Math.pow(gpos.y - hpos.y, 2)
      );

      var barPercent = ((Math.abs(distance) / Math.sqrt(373)) * 100).toFixed(0);

      el.data = barPercent;
      el.style.fontWeight = "bold";

      el.style.background = `linear-gradient(to right, ${hsl} 0%, ${hsl} ${
        100 - barPercent
      }%, #383838 ${100 - barPercent}%, #383838 100%)`;
      el.style.boxShadow = "0px 0px 10px " + hsl;

      guessDisplay.appendChild(el);

      var sorted = Array.from(guessDisplay.children).sort(
        (a, b) => a.data - b.data
      );

      guessDisplay.innerHTML = "";

      sorted.forEach((child) => guessDisplay.appendChild(child));
}
