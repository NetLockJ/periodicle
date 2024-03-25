var elementsJSON = null;
const elementsList = document.getElementById("elements");
const elementInput = document.getElementById("element-selector");
const periodicTable = document.getElementById("periodic-table");
const elementToNumber = new Map();

var hiddenElement = null;
var guesses = 0;

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

      hiddenElement = elementsJSON.elements[(Math.random() * 118) | 0].name;

      buildPeriodicTable();
    });
};

function guess() {
  guesses++;
  if (elementToNumber.has(elementInput.value)) {
    reveal();

    if (elementInput.value == hiddenElement) {
      document.getElementById("reveal").innerHTML = "Yay! You got " + hiddenElement + " in " + guesses + " guesses!";
      revealAll();
    }

    elementInput.value = "";
  }
}

function getElementData(name) {
  return elementsJSON.elements[elementToNumber.get(name)];
}

function getElementByPosition(x, y) {
  var ret = periodicTable.getElementsByTagName("tr")[parseInt(y - 1)];
  return ret.getElementsByTagName("td")[parseInt(x - 1)];
}

function getElementPosition(name) {
  return { x: getElementData(name).xpos, y: getElementData(name).ypos };
}

function revealAll() {
  for (i = 0; i < 118; ++i) {
    elementInput.value = elementsJSON.elements[i].name;
    reveal();
  }
}

function reveal() {
  var elementData = getElementData(elementInput.value);
  var tableElement = getElementByPosition(elementData.xpos, elementData.ypos);
  tableElement.classList = "guessed";

  var hpos = getElementPosition(hiddenElement);
  var gpos = getElementPosition(elementInput.value);

  var distance = Math.sqrt(
    Math.pow(gpos.x - hpos.x, 2) + Math.pow(gpos.y - hpos.y, 2)
  );

  var hue = 120 * (1 - Math.pow(distance / 19, 0.45));
  var hsl = "hsl(" + hue + ", 100%, 50%";
  tableElement.style.backgroundColor = hsl;
  tableElement.style.boxShadow = "0px 0px 5px " + hsl;
}

function buildPeriodicTable() {
  var isElement = false;
  for (j = 0; j < 10; j++) {
    currentRow = document.createElement("tr");
    for (i = 0; i < 18; i++) {
      for (e = 0; e < 118; e++) {
        var element = elementsJSON.elements[e];
        if (
          element.xpos == i + 1 &&
          element.ypos == j + 1
        ) {
          var elementData = document.createElement("td");
          elementData.classList = "not-guessed";
          elementData.innerHTML = `<span>${element.symbol}</span>`;
          currentRow.appendChild(elementData);
          isElement = true;
        }
      }

      if(!isElement) {
        currentRow.appendChild(document.createElement("td"));
      }

      isElement = false;
    }

    periodicTable.appendChild(currentRow);
  }
}
