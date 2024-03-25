var elementsJSON = null;
const elementsList = document.getElementById("elements");
const elementInput = document.getElementById("element-selector");
const periodicTable = document.getElementById("periodic-table");
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
        elementsList.appendChild(elementsList.children[Math.random() * i | 0]);
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

  if (elementToNumber.has(elementInput.value)) {
    reveal();

    if (!guessedElements.includes(elementInput.value)) {
      guesses++;
    }

    if (elementInput.value == hiddenElement) {
      document.getElementById("reveal").innerHTML =
        "Congratulations! You got " + hiddenElement + " in " + guesses + " guesses!";
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

  var distance = Math.sqrt(
    Math.pow(gpos.x - hpos.x, 2) + Math.pow(gpos.y - hpos.y, 2)
  );

  // seems to be a decent distribution of color
  var hue = 120 * (1 - Math.pow(distance / 19, 0.42));
  var hsl = "hsl(" + hue + ", 100%, 50%";
  tableElement.style.backgroundColor = hsl;
  tableElement.style.boxShadow = "0px 0px 5px " + hsl;
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
          elementData.classList = "not-guessed";
          elementData.innerHTML = `<span>${element.symbol}</span>`;
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
