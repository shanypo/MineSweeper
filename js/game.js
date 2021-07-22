'use strict';


var MINE_IMG = '<img class="center" src="img/bomb.png"/>';
var FLAG_IMG = '🚩';
var EMOJI = '😝';
var EMPTY = '';
/**************************************/
const EASY = 4;
const HARD = 8;
const EXTREME = 12;
/************************************/
var gTimeStart = null;
var gTimerInterval = null;
var gFirstClick;
var gGameIsOn = false;
var gBoard;
var gLifes;
var gHints;
var gCountShown;
var gCountMines;
var gHintMode;
var gSecTime;
var gPrevStep = [{} ,{}];
var gManuallMode;
var gMinesCountMan;
var gLevel = {
    size: 4,
    mines: 2
};
var gScores = {
    easy: 0,
    hard: 0,
    extreme: 0
};

var gFlagsCount;

function initGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
    gFirstClick = true;
    gCountShown = 0;
    gCountMines = 0;
    gGameIsOn = true;
    clearInterval(gTimerInterval);
    var elEmogi = document.querySelector('.emoji');
    elEmogi.innerText = '😝';
    closeModal();
    gLifes = 3;
    gHints = 3;
    gManuallMode = false;
    renderHeart(gLifes);
    renderHints(gHints);
    gMinesCountMan = gLevel.mines;

    // buildScoreBoard();
    // renderScoreBoard();
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
    if (!currCell.isMine && !currCell.isMarked && !gFirstClick && !gHintMode) {
        expandShown(i, j);
    } else if (currCell.isMine) {
        elCell.innerHTML = MINE_IMG;
        playSoundDeath();
        currCell.isShown = true;
        --gLifes;
        ++gCountMines;
    }
    if (gHintMode) {
        revelHints(i, j);
        setTimeout(unReveal, 1000);
        --gHints;
        renderHints(gHints);
    }


    isFirstClick(elCell, i, j);
    checkGameOver();
}

function checkGameOver() {
    var numCellWin = gLevel.size * gLevel.size;
    // debugger
    if (gLifes !== 0) {
        renderHeart(gLifes);
    }
    if (gCountMines === gLevel.mines || gLifes === 0) {
        var isWon = false;
        isVictory(isWon);
    }

    if (gFlagsCount + gCountShown === numCellWin) {
        isWon = true;
        isVictory(isWon);
    }
}

function isVictory(isWon) {
    var elEmogi = document.querySelector('.emoji');
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'block';
    if (isWon) {
        elEmogi.innerText = '🤩';
        elModal.innerText = 'your the queen! '

    } else {
        elEmogi.innerText = '🙈';
        elModal.innerText = 'such a bumer...'
    }
    clearInterval(gTimerInterval);
    saveScore();
    gGameIsOn = false;

}
function isFirstClick(elCell, i, j) {
    var currCell = gBoard[i][j];
    if (gFirstClick) {
        insertMines(i, j);
        getMineCount();
        if (currCell.isMine) {
            insertMines(i, j);
            getMineCount();
        }
        currCell.isShown = true;
        var mineCount = currCell.minesAroundCount;
        elCell.innerText = mineCount === 0 ? EMPTY : mineCount;
        elCell.classList.remove('hidden');
        gCountShown++;
        elCell.style.backgroundColor = '#ad9ee0';
        gFirstClick = false;
        gFlagsCount = gLevel.mines;
        var elFlags = document.querySelector('span:nth-child(3)');
        elFlags.innerText = ' : ' + gFlagsCount;
        gTimeStart = new Date();
        gTimerInterval = (setInterval(renderTimer, 10));
    }
}
function cellMarked(elCell) {
    var elFlag = document.querySelector('span:nth-child(3)');
    if (elCell.isMarked) {
        elCell.innerText = '';
        elFlag.innerText = ++gFlagsCount;
    } else {
        elFlag.innerText = --gFlagsCount;
        elCell.innerText = FLAG_IMG;
    }
    elCell.isMarked = !elCell.isMarked;
}


function isRightClick(elCell, i, j, ev) {
    if (!gGameIsOn || gManuallMode) return;
    if (ev.button === 2 && !elCell.isShown && gFlagsCount !== 0) {        
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
}
function getEmptyCelss(row, col) {
    var emptyCells = [];
    for (var i = 1; i < gBoard.length - 1; i++) {
        for (var j = 1; j < gBoard[0].length - 1; j++) {
            if (row === i && col === j) continue;
            if (gBoard[i][j].isShown) continue;
            emptyCells.push({ i, j });
        }
    }
    shuffle(emptyCells);
    return emptyCells;
}

function chooseLevel(elSize, elMines) {
    gLevel.size = elSize;
    gLevel.mines = elMines;
    initGame();
}

function expandShown(row, col) {
    var currNegsLoc = getNeegsLoc(row, col);
    for (var i = 0; i < currNegsLoc.length; i++) {
        var curCellLoc = currNegsLoc[i];
        var currCell = gBoard[curCellLoc.i][curCellLoc.j];
        var elCell = document.querySelector(`.cell-${curCellLoc.i}-${curCellLoc.j}`);
        if (!currCell.minesAroundCount) {
            elCell.innerText = EMPTY;
        }
        if (currCell.isMine || elCell.innerText === FLAG_IMG) continue;
        renderCell(currCell, elCell);
        if (currCell.minesAroundCount === 0) {
            expandShown(curCellLoc.i, curCellLoc.j);
        }
    }
}

function revelHints(row, col) {
    if (gFirstClick) return;
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue;
            // if(currCell.isMine) continue;
            var currCell = gBoard[i][j];
            var elCell = document.querySelector('.cell-' + i + '-' + j);
            elCell.classList.add('hint-showd');
            renderHintsCell(currCell, elCell) ;
        }
    }
}

function unReveal() {
    var allHints = document.querySelectorAll('.hint-showd');
    for (var i = 0; i < allHints.length; i++) {
        allHints[i].classList.remove('hint-showd');
        allHints[i].classList.add('hidden');
        allHints[i].innerText = EMPTY;
        allHints[i].style.backgroundColor = '#7A5AE4';
        gCountShown--;

    }
    gHintMode = false;
}

function HintCliked() {
    gHintMode = true;
}

function getBestScore(level, score) {
    var bestScore = localStorage.getItem(`${level}bestTime`);

    if (bestScore) {
        if (score < bestScore) {
            localStorage.setItem(`${level}bestTime`, score);
            score = gSecTime;
            localStorage.setItem(`${level}bestScore`, score);
        }

    }
    localStorage.setItem(`${level}bestTime`, score);
    score = gSecTime;
    // console.log('score', score);
    localStorage.setItem(`${level}bestScore`, score);
    gSecTime = score;
    // console.log('gsectime', gSecTime);

}

function saveScore() {
    gSecTime ? '00:000' : gSecTime;
    switch (gLevel.size) {
        case EASY:

            gScores.easy = gSecTime;
            getBestScore('easy', gScores.easy);

            break;

        case HARD:
            gScores.hard = gSecTime;
            getBestScore('hard', gScores.hard);
            break;
        case EXTREME:
            gScores.extreme = gSecTime;
            getBestScore('extreme', gScores.extreme);
            break;
    }

}

function manuallButton() {
    gManuallMode = !gManuallMode;
}
function setMinesManually(elCell, i, j) {
    gFirstClick = false;
    
    if (!gManuallMode) return;
    if (gMinesCountMan !== 0){
        var currCell = gBoard[i][j];
        currCell.isMine = true;
        elCell.classList.add('mine');
        --gMinesCountMan;
    } else{
        gManuallMode = false;
        getMineCount();
    }
}

function safeToClick() {
    if (gFirstClick || gBoard.safeClick === 0) return;
    var safeCell = getSafeCell();
    if (!safeCell) return;
    var elSafeCell = document.querySelector(`.cell-${safeCell.i}-${safeCell.j}`);
    gBoard.safeClick--;
    elSafeCell.style.backgroundColor = '#ad9ee0';
    setTimeout(function () {
        elSafeCell.style.backgroundColor = '#7A5AE4';
    }, 1000);
}

function getSafeCells() {
    var safeCells = [];
    for (var i = 1; i < gBoard.length; i++) {
        for (var j = 1; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isShown || gBoard[i][j].isMine) continue;
            safeCells.push({ i, j });
        }
    }
    return safeCells;
}

function getSafeCell() {
    var randomSafe = getSafeCells();
    var randomIdx = getRandomInt(0, randomSafe.length);
    var safeCell = randomSafe[randomIdx];
    return safeCell;
}

function renderHeart(numOfLife) {
    var str = renderImg(numOfLife, '<img class="heart" src="img/heart.png">')
    var elLife = document.querySelector('span:nth-child(1)');
    elLife.innerHTML = str;
}

function renderHints(numOfLite) {
    var str = renderImg(numOfLite, '<img class="heart" src="img/light.png">')
    var elLite = document.querySelector('span:nth-child(6)');
    elLite.innerHTML = str;

}

function insertPrevStep(){
    // var step = {
    //     isFirstClick = gFirstClick,



    // prevStep.push()
}

function renderHintsCell(currCell, elCell) {
    if (currCell.isShown) return;
    var mineCount = currCell.minesAroundCount;
    elCell.innerText = mineCount === 0 ? EMPTY : mineCount;
    elCell.classList.remove('hidden');
    gCountShown++;
    elCell.style.backgroundColor = '#ad9ee0';
}
