
function renderBoard(board) {
  var strHTML = '';
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>\n';
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      var cellClass = `cell cell-${i}-${j}`;;
      currCell.isMine ? cellClass += ' mine': cellClass += ' hidden';
      strHTML += `<td class="${cellClass}
      "onmousedown="isRightClick(this,${i}, ${j},event)"></td>\n`
    }
    strHTML += '</tr>'
  }
  strHTML += '</tr>\n';

  var elBoard = document.querySelector('.board');
  elBoard.innerHTML = strHTML;
}

function renderCell(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function createMat(ROWS, COLS) {
  var mat = []
  for (var i = 0; i < ROWS; i++) {
    var row = []
    for (var j = 0; j < COLS; j++) {
      row.push('')
    }
    mat.push(row)
  }
  return mat
}

function getClassName(location) {
  var cellClass = 'cell-' + location.i + '-' + location.j;
  return cellClass;
}


function shuffle(numbers){
    var randIdx;
    var keep;
    for (var i = numbers.length - 1; i > 0; i--) {
        randIdx = getRandomInt(0, numbers.length);
    
        keep = numbers[i];
        numbers[i] = numbers[randIdx];
        numbers[randIdx] = keep;
    }
        return numbers;
}

function renderTimer() {
  var timeDiff = Date.now() - gTimeStart;
  var seconds = parseInt(timeDiff / 1000);
  var timeDiffStr = timeDiff.toString();
  var ms = timeDiffStr.substring(timeDiffStr.length - 3);
  if (ms.length < 2) {
      ms = `00${ms}`;
  } else if (ms.length < 3) {
      ms = `0${ms}`;
  }
  if (seconds < 10) seconds = `0${seconds}`;
  document.querySelector('.timer').innerText = `${seconds}.${ms}`
}

function getRandomCell() {
  var emptyCells = getEmptyCelss();
  var randomIdx = getRandomInt(0, gBoard.length);
  var emptyCell = emptyCells[randomIdx];
  return emptyCell;
}

