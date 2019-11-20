'use strict'
var timerDisplay;
const HAPPY_EMOJI = "😀"
const WIN_EMOJI = "😎"
const LOSE_EMOJI = "😭"

var tInterval;
var timeObj = { minutes: 0, seconds: 0 };
var gameInterval;
var gBoard;
var timerDisplay;

var gGame = {
    isOn: false,
    isWon: false,
    shownCount: 0,
    flaggedCount: 0,
    secsPassed: 0
};
var gLevel = {
    SIZE: 4,
    MINES: 2
};

function init() {
    initVariables()
    initLevel()
    gGame.isOn = true
    gBoard = createBoard()
    renderHeader()
    renderBoard()
}

function createBoard() {
    var board = []
    for (let i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (let j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = { minesAroundCount: 0, isShown: false, isMine: false, isFlagged: false, isExpanded: false }
        }
    }

    return board
}
function renderHeader() {
    var gameContain = document.querySelector('.header')
    var strHTML = `<caption class="header"><span class="smiley" onclick="init()">${HAPPY_EMOJI}</span>`
    strHTML += `<span class="timerDisplay">0:00</span></caption>\n`
    gameContain.innerHTML = strHTML
}
function renderBoard() {
    var gameContain = document.querySelector('.board-container')
    var strHTML = ''
    var className = ''
    var cellContent = ''
    for (let i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>\n'
        const row = gBoard[i];
        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            if (cell.isMine) {
                cellContent = MINE
                if (cell.isShown) className += 'bombOver'
            }
            if (cell.isShown) {
                if (!cell.isMine) cellContent = cell.minesAroundCount
            } else cellContent = ''
            if (cell.isFlagged) cellContent = FLAG
            strHTML += `\t<td class="cell ${className}" data-i="${i}" data-j="${j}" 
            onclick="cellClicked(this)" oncontextmenu="cellMarked(this)">${cellContent}</td>\n`
            className = ''
            cellContent = ''
        }

        strHTML += '</tr>\n'
    }
    gameContain.innerHTML = strHTML
}

function gameOver() {
    gGame.isOn = false
    for (let i = 0; i < gBoard.length; i++) {
        const row = gBoard[i];
        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            if (cell.isMine) cell.isShown = true
        }
    }
    clearInterval(tInterval);
    tInterval=null
    clearInterval(gameInterval)
    gameInterval=null
    renderBoard()
}
function checkGameOver() {
    var smiley = document.querySelector('.smiley')

    if (gGame.shownCount + gGame.flaggedCount === gLevel.SIZE * gLevel.SIZE) {
        smiley.innerHTML = WIN_EMOJI
        gGame.isWon = true
        return true
    }
    return false

}
function startTimer() {
    timerDisplay = document.querySelector('.timerDisplay')
    var startTime = new Date().getTime();
    tInterval = setInterval(getShowTime, 1000, startTime);
}
function getShowTime(startTime) {
    var updatedTime = new Date().getTime();
    var difference = updatedTime - startTime;
    var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((difference % (1000 * 60)) / 1000);
    timeObj.minutes = (minutes < 10) ? "0" + minutes : minutes;
    timeObj.seconds = (seconds < 10) ? "0" + seconds : seconds;
    timerDisplay.innerHTML = minutes + ':' + ((seconds < 10) ? '0' + seconds : seconds)
}
function initLevel() {
    if (document.querySelector("#easy").checked) {
        gLevel.SIZE = 4
        gLevel.MINES = 2
    }
    else if (document.querySelector("#medium").checked) {
        gLevel.SIZE = 8
        gLevel.MINES = 12
    }
    else if (document.querySelector("#hard").checked) {
        gLevel.SIZE = 12
        gLevel.MINES = 30
    }
}
function initVariables() {
    gGame.shownCount = 0
    gGame.flaggedCount = 0
    gGame.isWon = false
    gGame.isOn = false
    timeObj.minutes = 0
    timeObj.seconds = 0
    if(tInterval) clearInterval(tInterval);
    if(gameInterval) clearInterval(gameInterval)
}
document.oncontextmenu = function () { //disables context menus
    return false;
}
