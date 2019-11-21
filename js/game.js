'use strict'

var tInterval;
var gameInterval;
var mineCoordArr = []

const gameStatus = {
    init: 0,
    started: 1,
    lost: 2,
    won: 3,
    godModeInit: 4,
    godMode: 5
};
var gGame = {
    status: 0,
    shownCount: 0,
    flaggedCount: 0,
    time: { minutes: 0, seconds: 0 },
};

function init() {
    initVariables()
    createHints()
    renderHints()
    renderStaticEl()
    gBoard = createBoard()
    renderHeader()
    createScoreBoard()
    renderBoard()
    gGame.status = gameStatus.init
}

function gameOver() {
    var smiley = document.querySelector('.smiley')
    if (gGame.status === gameStatus.lost) smiley.innerHTML = LOSE_EMOJI
    else if (gGame.status === gameStatus.won) smiley.innerHTML = WIN_EMOJI

    for (let i = 0; i < gBoard.length; i++) {
        const row = gBoard[i];
        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            if (cell.isMine) cell.isShown = true
        }
    }
    clearInterval(tInterval);
    tInterval = null
    clearInterval(gameInterval)
    gameInterval = null
    renderBoard()
    if (gGame.status === gameStatus.won) setTimeout(showPopup, 1000)
}

function checkIfWin() {
    if ((gGame.shownCount + gGame.flaggedCount) === (gLevel.size * gLevel.size)) {
        gGame.status = gameStatus.won
        return true
    }
    return false

}

function cellClicked(elCell) {
    if (gGame.status === gameStatus.lost || gGame.status === gameStatus.won) return;
    var cellCoord = { i: parseInt(elCell.dataset.i), j: parseInt(elCell.dataset.j) }
    if (gGame.status === gameStatus.godModeInit) {
        gBoard[cellCoord.i][cellCoord.j].isMine = true
        gBoard[cellCoord.i][cellCoord.j].isShown = true
        renderBoard()
        return
    }
    if (gGame.status === gameStatus.init) initFirstClick(cellCoord)
    
    if (gGame.status === gameStatus.godMode) {
        startTimer()
        gGame.status = gameStatus.started
    }

    var cell = gBoard[cellCoord.i][cellCoord.j]
    if (cell.isFlagged) return;
    if (cell.isShown) return;

    if (cell.isMine && !gLevel.life) {
        gGame.status = gameStatus.lost
        gameOver()
        return
    } else if (cell.isMine && gLevel.life) {
        gLevel.life--
        renderLife()
    }
    cell.isShown = true
    gGame.shownCount++

    if (!cell.isMine) expandShown(cellCoord)
    renderBoard()

    if (checkIfWin()) gameOver()
}
function initFirstClick(cellCoord) {
    setRandMines(cellCoord)
    setMinesNegsCount()
    startTimer()
    gGame.status = gameStatus.started
}
function cellMarked(elCell) {
    if (gGame.status === gameStatus.lost || gGame.status === gameStatus.won) return;
    if (gGame.status === gameStatus.init) startTimer()
    var markedCell = gBoard[elCell.dataset.i][elCell.dataset.j]
    if (markedCell.isShown) return
    markedCell.isFlagged = (markedCell.isFlagged) ? false : true
    if (markedCell.isFlagged && markedCell.isMine) gGame.flaggedCount++
    else if (!markedCell.isFlagged && markedCell.isMine) gGame.flaggedCount--
    // gGame.flaggedCount = (markedCell.isFlagged && markedCell.isMine) ? ++gGame.flaggedCount : --gGame.flaggedCount
    if (checkIfWin()) gameOver()
    renderBoard()
}

function expandShown(cellCoord) { //recursive expand

    if (gBoard[cellCoord.i][cellCoord.j].minesAroundCount != 0) return

    for (let i = cellCoord.i - 1; i <= cellCoord.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (let j = cellCoord.j - 1; j <= cellCoord.j + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (i === cellCoord.i && j === cellCoord.j) continue
            var cell = gBoard[i][j]

            if (!cell.isMine && !cell.isShown) {
                cell.isShown = true
                gGame.shownCount++
            }
            if (cell.minesAroundCount === 0 && !cell.isExpanded) {
                cell.isExpanded = true
                expandShown({ i, j }) // {i:i , j:j}
            }
        }
    }
}

function getRandomHiddenCell(findMine) {
    var found = false
    while (!found) {
        var randCell = { i: getRandomIntInclusive(0, gLevel.size - 1), j: getRandomIntInclusive(0, gLevel.size - 1) }
        var cellContent = gBoard[randCell.i][randCell.j]
        if (findMine) {
            if (!cellContent.isShown && !cellContent.isMarked) found = true
        } else {
            if (!cellContent.isShown && !cellContent.isMine) found = true
        }
    }
    return randCell
}

function safeClick() {
    if (gGame.status === gameStatus.won || gGame.status === gameStatus.lost) return
    if (!gLevel.safeClick) return
    gLevel.safeClick--
    var elClicksLeft = document.querySelector('.safe-clicks-left')
    elClicksLeft.innerHTML = gLevel.safeClick
    var safeCell = getRandomHiddenCell(false)
    gBoard[safeCell.i][safeCell.j].isShown = true
    renderBoard()
    gBoard[safeCell.i][safeCell.j].isShown = false
    setTimeout(renderBoard, 2000)
}
function showHint(elHint) {
    if (gGame.status === gameStatus.lost || gGame.status === gameStatus.won) return;
    if (!gLevel.hints) return;
    var hintID = parseInt(elHint.dataset.id)
    if (gHintsArr[hintID].isUsed) return;
    gLevel.hints--
    gHintsArr[hintID].isUsed = true
    renderHints()
    var cell = getRandomHiddenCell(true)
    var cellNegs = getCellNegs(cell)
    for (let i = 0; i < cellNegs.length; i++) {
        gBoard[cellNegs[i].i][cellNegs[i].j].isHinted = true
    }
    renderBoard()
    setTimeout(hideHint, 2500, cellNegs)
}
function hideHint(cellNegs) {
    for (let i = 0; i < cellNegs.length; i++) {
        gBoard[cellNegs[i].i][cellNegs[i].j].isHinted = false
    }
    renderBoard()
}
