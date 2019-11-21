var gBoard;
var gHintsArr;

const gLevelEnum = {
    EASY: { SIZE: 4, MINES: 2 },
    MEDIUM: { SIZE: 8, MINES: 12 },
    HARD: { SIZE: 12, MINES: 30 }
};
var gLevel = {
    size: 4,
    mine: 2,
    hints: 3,
    safeClick:3,
    life:3
};

function createScoreBoard() { //Get scores from browser localstorage
    var existingScores = JSON.parse(localStorage.getItem('scores'))
    if (!existingScores) existingScores = []
    renderScoreBoard(existingScores)
}
function createBoard() {
    var board = []
    for (let i = 0; i < gLevel.size; i++) {
        board[i] = []
        for (let j = 0; j < gLevel.size; j++) {
            board[i][j] = { minesAroundCount: 0, isShown: false, isMine: false, isFlagged: false, isExpanded: false, isHinted: false }
        }
    }

    return board
}
function createHints() {
    gHintsArr = []
    for (let i = 0; i < gLevel.hints; i++) {
        gHintsArr.push({ isUsed: false })
    }
}

function initLevelVars() {
    if (document.querySelector("#easy").checked) {
        gLevel.size = gLevelEnum.EASY.SIZE
        gLevel.mines = gLevelEnum.EASY.MINES
    }
    else if (document.querySelector("#medium").checked) {
        gLevel.size = gLevelEnum.MEDIUM.SIZE
        gLevel.mines = gLevelEnum.MEDIUM.MINES
    }
    else if (document.querySelector("#hard").checked) {
        gLevel.size = gLevelEnum.HARD.SIZE
        gLevel.mines = gLevelEnum.HARD.MINES
    }
}
function initVariables() { //initiate variables on restart
    gGame.shownCount = 0
    gGame.flaggedCount = 0
    gGame.status = gameStatus.init
    gGame.time.minutes = 0
    gGame.time.seconds = 0
    gLevel.life=3
    gLevel.hints=3
    gLevel.safeClick=3
    if (tInterval) clearInterval(tInterval);
    if (gameInterval) clearInterval(gameInterval)
    initLevelVars()
}
function getMineNegsCount(cell) { //count how many neighbor cells have mines
    var mineCount = 0
    for (let i = cell.i - 1; i <= cell.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;

        for (let j = cell.j - 1; j <= cell.j + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (i === cell.i && j === cell.j) continue;
            if (gBoard[i][j].isMine) mineCount++
        }
    }
    return mineCount
}
function getCellNegs(excludeCell) { //get all of a cells neighbors including itself
    var cellsArr = []
    for (var i = excludeCell.i - 1; i <= excludeCell.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = excludeCell.j - 1; j <= excludeCell.j + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            cellsArr.push({ i, j })
        }
    }
    return cellsArr
}
function setRandMines(excludeCell) {   //set mines on cells from array
    var excludeCellsArr = getCellNegs(excludeCell)
    var coords = getRandomCoordsArr(0, gLevel.size - 1, gLevel.mines, excludeCellsArr)
    for (let i = 0; i < gLevel.mines; i++) {
        gBoard[coords[i].i][coords[i].j].isMine = true
    }
}
function getRandomCoordsArr(min, max, coordNum, excludeCellsArr) {  //get an array with non repetitive cell coords
    var coordsArr = []
    var isSame = false
    for (let i = 0; i < coordNum; i++) {
        var randCell = { i: getRandomIntInclusive(min, max), j: getRandomIntInclusive(min, max) }

        for (let index = 0; index < excludeCellsArr.length; index++) { //Check if generated cell is part of excluded cells arr
            if (excludeCellsArr[index].i === randCell.i && excludeCellsArr[index].j === randCell.j) isSame = true
        }
        for (let j = 0; j < coordsArr.length && !isSame; j++) {//check for duplicated random cells inside array
            if (coordsArr[j].i === randCell.i && coordsArr[j].j === randCell.j) {
                isSame = true
                break
            }
        }
        if (!isSame) coordsArr.push(randCell)//push only if unique
        else i--
        isSame = false
    }
    return coordsArr
}
function setMinesNegsCount() { //set for each cell, the number of neighbor mines
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].minesAroundCount = getMineNegsCount({ i, j })
        }

    }
}
function saveScore() {
    hidePopup()
    var playerName = document.querySelector('#inputName').value
    if (!playerName) return
    document.querySelector('#inputName').value = ''
    var gScore = {
        name: playerName,
        time: gGame.time.minutes + ':' + gGame.time.seconds,
        level: gLevel.size
    };
    var existingScores = JSON.parse(localStorage.getItem('scores'))
    if (!existingScores) {
        existingScores = []
    }
    existingScores.push(gScore)
    localStorage.setItem('scores', JSON.stringify(existingScores))
    renderScoreBoard(existingScores)
}
function startTimer() {
    timerDisplay = document.querySelector('.header .timerDisplay')
    var startTime = new Date().getTime();
    tInterval = setInterval(getShowTime, 1000, startTime);
}
function getShowTime(startTime) {
    var updatedTime = new Date().getTime();
    var difference = updatedTime - startTime;
    var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((difference % (1000 * 60)) / 1000);
    gGame.time.minutes = (minutes < 10) ? "0" + minutes : minutes;
    gGame.time.seconds = (seconds < 10) ? "0" + seconds : seconds;
    timerDisplay.innerHTML = minutes + ':' + ((seconds < 10) ? '0' + seconds : seconds)
}
function godMode(elGod){
    if (gGame.status === gameStatus.init){
        gGame.status = gameStatus.godModeInit
        elGod.innerHTML = 'Save creation'
        return
    }
    if (gGame.status === gameStatus.godModeInit){
        elGod.innerHTML = 'Saved'
        gGame.status = gameStatus.godMode
        for (let i = 0; i < gBoard.length; i++) {
            const row = gBoard[i];
            for (let j = 0; j < row.length; j++) {
                const cell = row[j];
                cell.isShown = false
            }
        }
        setMinesNegsCount()
        renderBoard()
    }          
}