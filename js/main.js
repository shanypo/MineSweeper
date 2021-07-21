'use strict';


var MINE_IMG = '💣';
var FLAG_IMG = '🚩';
var EMOJI = '😝';
var EMPTY = '';
/************************************/
var gTimeStart = null;
var gTimerInterval = null;
var gFirstClick;
var gLives = 1;
var gGameIsOn = false;
var gBoard;
var gCountShown;
var gCountMines;
var gLevel = {
    size: 4,
    mines: 2
};
var gFlagsCount = gLevel.mines;

function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
    gGameIsOn = true;
    gFirstClick = true;
    gCountShown = 0;
    gCountMines = 0;

}

function buildBoard() {
    var gBoard = createMat(gLevel.size, gLevel.size);
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var cell = {
                minesAroundCount: 4,
                isShown: false,
                isMarked: false,
                isMine: false
            };
            gBoard[i][j] = cell;
        }
    }
    return gBoard;
}

function setMinesNegsCount(row, col) {
    var mineCounter = 0;
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (i === col && j === row) continue;
            if (j < 0 || j > gBoard[i].length - 1) continue;
            var cell = gBoard[i][j];
            if (cell.isMine) mineCounter++;
        }
    }
    return mineCounter++;
}

function getMineCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j];
            var minesCount = setMinesNegsCount(i, j);
            cell.minesAroundCount = minesCount;
        }
    }
}

function cellClicked(elCell, i, j) {
    var currCell = gBoard[i][j];
    if (currCell.isShown) return;
    var mineCount = currCell.minesAroundCount;
    if (!currCell.isMine && !currCell.isMarked) {
        expandShown(i, j)
        // currCell.isShown = true;
        // elCell.innerText = mineCount === 0 ? 0 : mineCount;
        // elCell.classList.remove('hidden');
        // gCountShown++;
    } else {
        elCell.innerText = MINE_IMG;
        currCell.isShown = true;
        gCountMines++;
        

    }
    checkGameOver();
}

function checkGameOver() {
    var numCellWin = (gLevel.size * gLevel.size) - gLevel.mines;
    var elLife = document.querySelector('.life');
    // elLife.innerText = '❤️' + '❤️' + '❤️';
    if (gLives) {
        gLives--;
        // var elLifes = document.querySelector(span .l)
    }
    if (gCountMines === gLevel.mines){
        var isWon = false;
        isVictory(isWon);
    }

    if (gFlagsCount === 0 || numCellWin === gCountShown) {
        console.log('you won!');
        isWon = true;
        isVictory(isWon);
    }
}

function isVictory(isWon){
    var elEmogi = document.querySelector('.emoji');
    if (isWon){
        elEmogi.innerText = '🤩';
    }else{
        elEmogi.innerText = '🙈';
    }
    clearInterval(gTimerInterval);
    gGameIsOn = false;
}
function isFirstClick(elCell, i, j) {
    var currCell = gBoard[i][j];    
    if (gFirstClick) {
        gFirstClick = false;
        insertMines(i, j);
        getMineCount();
        gTimeStart = new Date();
        gTimerInterval = (setInterval(renderTimer, 10));
        gCountShown++;
    }

}
function cellMarked(elCell) {
    if (elCell.isMarked) {
        elCell.innerText = '';
        gFlagsCount++;
    } else {
        elCell.innerText = FLAG_IMG;
        gFlagsCount--;
    }
    elCell.isMarked = !elCell.isMarked;
}


function isRightClick(elCell, i, j, ev) {
    if (!gGameIsOn) return;
    isFirstClick(elCell, i, j);
    if (ev.button === 2) {
        cellMarked(elCell);
    } else {
        cellClicked(elCell, i, j);
    }
}

function insertMines(row, col) {
    for (var i = 0; i < gLevel.mines; i++) {
        var cell = getRandomCell(row, col);
        gBoard[cell.i][cell.j].isMine = true;
    }
    // renderBoard(gBoard);
}
function getEmptyCelss(row, col) {
    var emptyCells = [];
    for (var i = 1; i < gBoard.length - 1; i++) {
        for (var j = 1; j < gBoard[0].length - 1; j++) {
            if (row === i && col === j) continue;
            emptyCells.push({ i, j });
        }
    }
    return emptyCells;
}

function chooseLevel(elSize, elMines) {
    gLevel.size = elSize;
    gLevel.mines = elMines;
    initGame();
}

function expandShown(row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (i === col && j === row) continue;
            if (j < 0 || j > gBoard[i].length - 1) continue;
            var currCell = gBoard[i][j];
            var elCell = document.querySelector('.cell-' + i + '-' + j);
            if (!currCell.minesAroundCount) {
                elCell.innerText = EMPTY;
            }
            if (currCell.isMine || elCell.innerText === FLAG_IMG) continue;
            else {
                currCell.isShown = true;
                var mineCount = currCell.minesAroundCount;
                elCell.innerText = mineCount === 0 ? EMPTY : mineCount;
                gCountShown++;
                expandShown(i, j);
            }
        }
    }
}

function renderCell(currCell) {
    var cell = gBoard[currCell.i][currCell.j];
    if(cell.isShown) return;
    cell.isShown = true;
    var mineCount = gBoard[currCell.i][currCell.j].minesAroundCount;
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    // console.log(mineCount);
    // console.log('elcell',elCell);
    
    
    elCell.innerText = mineCount === 0 ? 0 : mineCount;
    elCell.classList.remove('hidden');
    gCountShown++;
}

