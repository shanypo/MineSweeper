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
var gPrevStep = [{}, {}];
var gManuallMode;
var gSafeClick;
var gMinesCountMan;
var gScoreBoard;
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
    document.querySelector('.timer').innerText = `00:00`
    var elEmogi = document.querySelector('.emoji');
    elEmogi.innerText = '😝';
    closeModal();
    gLifes = 3;
    gHints = 3;
    gManuallMode = false;
    renderHeart(gLifes);
    renderHints(gHints);
    gMinesCountMan = gLevel.mines;
    gSafeClick = 3;
    updateSafeClick();
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
    if (gHintMode) {
        revelHints(i, j);
        setTimeout(unReveal, 1000);
        --gHints;
        renderHints(gHints);
    }
    if (!currCell.isMine && !currCell.isMarked && !gFirstClick && !gHintMode) {
        expandShown(i, j);
    } else if (currCell.isMine) {
        // CR: good DOM manipulation
        elCell.innerHTML = MINE_IMG;
        playSoundDeath();
        currCell.isShown = true;
        --gLifes;
        ++gCountMines;
    }
    // CR: maybe a better place for isFirstClick call is at the beginning of the func?
    isFirstClick(elCell, i, j);
    insertPrevStep(i, j);
    checkGameOver();
}

function checkGameOver() {
    var numCellWin = gLevel.size * gLevel.size;
    if (gLifes !== 0) {
        renderHeart(gLifes);
    }
    if (gCountMines === gLevel.mines || gLifes === 0) {
        var isWon = false;
        revelMines();
        isVictory(isWon);
    }

    if (gFlagsCount + gCountShown === numCellWin) {
        isWon = true;
        isVictory(isWon);
    }
}

// CR: not a good func name. maybe a better name will be setGameOver
function isVictory(isWon) {
    var elEmogi = document.querySelector('.emoji');
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'block';
    if (isWon) {
        elEmogi.innerText = '🤩';
        elModal.innerText = 'Your the queen!'
        saveScore();
    } else {
        elEmogi.innerText = '🙈';
        elModal.innerText = 'Maby next time...';
    }
    clearInterval(gTimerInterval);
    gGameIsOn = false;
}

// CR: remove unused vars 
function isFirstClick(elCell, i, j) {
    var currCell = gBoard[i][j];
    if (gFirstClick) {
        insertMines(i, j);
        getMineCount();
        if (currCell.isMine) {
            insertMines(i, j);
            getMineCount();
        }
        gFlagsCount = gLevel.mines;
        gFirstClick = false;
        var elFlags = document.querySelector('span:nth-child(3)');
        elFlags.innerText = ' : ' + gFlagsCount;
        gTimeStart = new Date();
        gTimerInterval = (setInterval(renderTimer, 10));
        expandShown(i, j);
        insertPrevStep(i, j);
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
    insertPrevStep(i, j);
}

function insertMines(row, col) {
    for (var i = 0; i < gLevel.mines; i++) {        
        var cell = getRandomCell(row, col);  
        if (gBoard[cell.i][cell.j].isMine){
            cell = getRandomCell(); 
        }      
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
            if(gBoard[row][col].isMine) continue;
            var currCell = gBoard[i][j];
            var elCell = document.querySelector('.cell-' + i + '-' + j);
            elCell.classList.add('hint-showd');
            renderHintsCell(currCell, elCell);
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

function hintCliked() {
    gHintMode = true;
}

function getBestScore(level, score) {
    var bestScore = localStorage.getItem(`${level}bestTime`);
    if (bestScore !== null) {
        if (score < bestScore) {
            localStorage.setItem(`${level}bestTime`, score);
            score = gSecTime;
        }
    }
    var elScore = document.querySelector(`.${level}`);
    elScore.innerHTML = bestScore;
}

function saveScore() {
    gSecTime === null ? '00:000' : gSecTime;
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
    var elBtnManually = document.querySelector('.manually');

    if (!gManuallMode) {
        elBtnManually.style.cursor = 'not-allowed';
        elBtnManually.style.backgroundColor = '#f5a5a8';
    } else {
        elBtnManually.style.cursor = 'pointer';
        elBtnManually.style.backgroundColor = '#e4686c';
    }
    gManuallMode = !gManuallMode;
}
function setMinesManually(elCell, i, j) {
    gFirstClick = false;

    if (!gManuallMode) return;
    if (gMinesCountMan !== 0) {
        var currCell = gBoard[i][j];
        currCell.isMine = true;
        elCell.classList.add('mine');
        --gMinesCountMan;
    } else {
        gManuallMode = false;
        getMineCount();
    }
}

function safeToClick() {
    if (gFirstClick || gSafeClick === 0) return;
    var safeCell = getSafeCell();
    if (!safeCell) return;
    var elSafeCell = document.querySelector(`.cell-${safeCell.i}-${safeCell.j}`);
    --gSafeClick;
    updateSafeClick();
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

function insertPrevStep(i, j) {
    var step = {
        isFirstClick: gFirstClick,
        countShows: gCountShown,
        // showsCell: gBoard[i][j].isShow,
        // markedCell: gBoard[i][j].isMarked,
        lifes: gLifes,
        hints: gHints,
        safeClick: gSafeClick,
        flags: gFlagsCount,
        minesCount: gCountMines,
        board: gBoard
    }
    gPrevStep.push(step);
}

function undo() {
    if (gGameIsOn && gPrevStep.length !== 0) {
        gLifes = gPrevStep.lifes;
        gHints = gPrevStep.hints;
        gSafeClick = gPrevStep.safeClick;
        gFlagsCount = gPrevStep.flags;
        gCountMines = gPrevStep.mineCount;
        gCountShown = gPrevStep.countShows;
        gBoard = gPrevStep.board;
        gFirstClick = gPrevStep.isFirstClick;
        renderHeart(gLifes);
        renderHints(gHints);
        renderBoard(gBoard);
    }
}

function renderHintsCell(currCell, elCell) {
    if (currCell.isShown) return;
    var mineCount = currCell.minesAroundCount;
    elCell.innerText = mineCount === 0 ? EMPTY : mineCount;
    elCell.classList.remove('hidden');
    gCountShown++;
    elCell.style.backgroundColor = '#ad9ee0';
}

function revelMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j];
            var elCell = document.querySelector(`.cell-${i}-${j}`);
            if (currCell.isShown) continue;
            if (currCell.isMine) {
                elCell.innerHTML = MINE_IMG;
            }
        }
    }

}

function updateSafeClick() {
    var elSafesPAN = document.querySelector('.safe span');
    elSafesPAN.innerText = gSafeClick;
    var elBtnSafe = document.querySelector('.safe');
    if (gSafeClick === 0) {
        elBtnSafe.style.cursor = 'not-allowed';
        elBtnSafe.style.backgroundColor = '#f5a5a8';
    } else {
        elBtnSafe.style.cursor = 'pointer';
        elBtnSafe.style.backgroundColor = '#e4686c';
    }

}



