
function buildBoard() {
    var gBoard = createMat(gLevel.size, gLevel.size);
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            // CR: it will be cleaner to send it to another function and get back the cell
            var cell = {
                minesAroundCount: EMPTY,
                isShown: false,
                isMarked: false,
                isMine: false,
                steps: [],
                bestScore: [],
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
function renderCell(currCell, elCell) {
    if (currCell.isShown) return;
    currCell.isShown = true;
    var mineCount = currCell.minesAroundCount;
    elCell.innerText = mineCount === 0 ? EMPTY : mineCount;
    elCell.classList.remove('hidden');
    gCountShown++;
    elCell.style.backgroundColor = '#78F9E1';
}

function closeModal() {
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'none';

}
function playSoundDeath() {
    var sound = new Audio("sound/explosion.mp3");
    sound.play();
}

function renderImg(element, img) {
    var str = '';
    for (var i = 0; i < element; i++) {
        str += img;
        str += ' ';
    }
    return str;
}
