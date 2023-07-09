let input = document.querySelector('input');
let currentOperation = null;
let hasOperation = false;
let resultCalculated = true;
let audio = new Audio('resources/audio/keyboard-press.mp3');
let horn = new Audio('resources/audio/airhorn.mp3');
let ding = new Audio('resources/audio/ding.mp3');
let audioOn = false;

// Wait for a certain amount of time
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Add the result inputted as an element into the history
function addResultToHistory(result) {
  if(!hasOperation) {
    return;
  }
  let resultElement = document.createElement("p");
  let resultText = document.createTextNode(result);
  resultElement.appendChild(resultText);
  let history = document.querySelector("#history");
  history.prepend(resultElement);
  resultElement.addEventListener('click', () => {
    restoreHistory(resultElement.innerHTML);
  });
}

// Returns the first value of the expression (used for finding %)
function findFirstValue(expression) {
  let index = -1;
  let percentIndex = -1;
  for(let i = 0; i < expression.length; i++) {
      if(expression[i] == '+' || expression[i] == '-') {
          index = i;
      }
      if(expression[i] == '%') {
          percentIndex = i;
      }
  }
  if(index == -1 || percentIndex < index) {
      return 'single-value';
  }
  return expression.substring(0, index);
}

// Calculate the result of an expression and print it out
function calculateResult() {
  if(input.value == 'Error')
    return;
  if(input.value == '')
    return; // Cannot calculate result of nothing, so just don't do anything
  let expression = input.value;
  
  // Replace visual division and multiplication difference so js can calculate it
  expression = expression.replace('÷', '/').replace('x', '*').replace('π', Math.PI).replace('²', '** 2');
  let firstValue = findFirstValue(expression);
  if(firstValue == 'single-value') {
      expression = expression.replace('%', '/100');
  } else {
      expression = expression.replace('%', '/ 100 *' + firstValue);
  }
  let result;
  try {
    result = eval(expression);
  } catch(error) {
    input.value = 'Error';
    if(audioOn) {
      horn.play();
    }
      
    return;
  }
  if(result == 'NaN' || result == 'Infinity') {
    input.value = 'Error';
    if(audioOn) {
      horn.play();
    }
    return;
  }
  result = parseFloat(result.toFixed(7));
  addResultToHistory(result);
  input.value = result;
  input.value = input.value.substring(0, 22);
  resultCalculated = false;
  if(hasOperation) {
    resultCalculated = true;
  }
  hasOperation = false;
  currentOperation = null;
}

// Set the operation and print that operation to the display
function setOperation(operation) {
  if(input.value == 'Error')
    return;
  if(hasOperation) {
    calculateResult();
    input.value = input.value + operation;
    currentOperation = operation;
    hasOperation = true;
    resultCalculated = false;
  } else if(input.value.length != 0) {
    if (currentOperation == null) {
      input.value = input.value + operation;
      currentOperation = operation;
      resultCalculated = false;
    } else {
      if (operation) {
        input.value = input.value.substring(0, input.value.length - 1) + operation;
      } else {
        input.value = input.value + operation;
      }
    }
  }
}

// Clear the caculator display
function clearCalculator() {
  input.value = '';
  hasOperation = false;
  resultCalculated = false;
  currentOperation = null;
}

// Clear the calculator history
function clearHistory() {
  let history = document.getElementById("history");
  history.innerHTML = '';
}

// Add a number (other digit) to the display
function appendNumber(number) {
  if(input.value == 'Error')
    return;
  if(resultCalculated && number != '%') {
    clearCalculator();
    resultCalculated = false;
  }
  if(number == 'x²') {
      number = '²';
  }
  input.value = input.value + number;
  if(currentOperation != null) {
    hasOperation = true;
  }
  if(number == '%') {
      calculateResult();
  }
}

// Restore a value from the history into the display
function restoreHistory(number) {
  if (input.value == '') {
    input.value = number;
  } else if(currentOperation != null && !hasOperation) {
    input.value = input.value + number;
    hasOperation = true;
  }
}

// Change the sound of button presses
async function changeSound(button) {
  if(document.getElementById('sound-a') === button) {
    input.value = 'Sound: Click';
    audio = new Audio("resources/audio/keyboard-press.mp3");
    audioOn = true;
  } else if (document.getElementById('sound-b') === button) {
    input.value = 'Sound: Beep';
    audio = new Audio("resources/audio/beep.mp3");
    audioOn = true;
  } else if (document.getElementById('sound-c') === button) {
    input.value = 'Sound: Pop';
    audio = new Audio("resources/audio/pop.mp3");
    audioOn = true;
  } else {
    input.value = 'Sound Off';
    audioOn = false;
  }
  clearCalculator(); // Ensure calculator is in correct state
  await sleep(500);
  input.value = '';
}

// Adds an event listener for keys and check for each key
input.addEventListener('keydown', (e) => {
  e.preventDefault();
  if(e.key == '%') {
    appendNumber('%');
  } else if(e.key == '/') {
    setOperation('÷');
  } else if(e.key == '*' || e.key == 'x') {
    setOperation('x');
  } else if(e.key == '-') {
    if(currentOperation == null && resultCalculated == true) {
      appendNumber('-');
    } else {
      setOperation('-');
    }
  } else if(e.key == '+') {
    setOperation('+');
  } else if(e.key == 'Enter') {
    calculateResult();
  } else if(!isNaN(e.key) || e.key == '.') {
    appendNumber(e.key);
  } else if(e.key == 'Escape' || e.key == 'Delete' || e.key == 'Backspace') {
    clearCalculator();
  }
});

let buttons = document.querySelectorAll('button');
  
// Iterate through all buttons, performing appropriate operations for each
buttons.forEach(button => {
  button.addEventListener('click', () => {
    if(audioOn && button.innerHTML != '=' && button.innerHTML != 'Clear History') {
      audio.play();
    }
    if(button.className == 'operator'){
      setOperation(button.innerHTML);
    } else if(button.innerHTML == 'c') {
      clearCalculator();
    } else if(button.innerHTML == '=') {
      calculateResult();
      if(audioOn)
        ding.play();
    } else if(button.innerHTML == '(-)') {
      appendNumber('-');
    } else if(button.innerHTML == 'Clear History') {
      clearHistory();
    } else if(button.innerHTML == '♪') {
      changeSound(button);
    } else {
      appendNumber(button.innerHTML);
    }
  })
});