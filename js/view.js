const MINE = '<img class="mine" src="assets/img/bomb.png">'
const FLAG = '<img class="flag" src="assets/img/flagged.png">'
var timerDisplay;
const HAPPY_EMOJI = "😀"
const WIN_EMOJI = "😎"
const LOSE_EMOJI = "😭"
const USED_HINT = '<img src="assets/img/used-hint.png">'
const HINT = '<img src="assets/img/hint.png">'
var timerDisplay;

function renderHints() {
    var hintsContain = document.querySelector('.hints-container')
    var strHTML = ''
    var className = ''
    var imgSrc = ''
    for (let i = 0; i < gHintsArr.length; i++) {
        if (gHintsArr[i].isUsed) {
            className = ' used'
            imgSrc = USED_HINT
        } else {
            className = ''
            imgSrc = HINT
        }
        strHTML += `<span class="hint${className}" onclick="showHint(this)" data-id="${i}">${imgSrc}</span>`
    }
    strHTML += `<h3>You have <span class="hintNum">${gLevel.hints}</span> hints left.</h3>`
    hintsContain.innerHTML = strHTML

}

function renderHeader() {
    var gameContain = document.querySelector('.header')
    var strHTML = `<caption class="header">
            <span class="lifeCnt">3❤️</span>
            <span class="smiley" onclick="init()">${HAPPY_EMOJI}</span>
            <span class="timerDisplay">0:00</span></caption>\n`
    gameContain.innerHTML = strHTML
}
function renderLife(){
    var elLife = document.querySelector('.lifeCnt')
    elLife.innerHTML = gLevel.life+'❤️'
}
function renderBoard() {
    var gameContain = document.querySelector('.board-container')
    var strHTML = ''
    var className = ''
    var cellContent = ''
    console.log(gGame.flaggedCount)
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
                if (!cell.isMine) {
                    className += 'shown'
                    cellContent = cell.minesAroundCount
                }
            } else cellContent = ''
            if (cell.isHinted && !cell.isMine) cellContent = cell.minesAroundCount
            if (cell.isHinted && cell.isMine) cellContent = MINE
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
function renderScoreBoard(scores) {
    var scoresContain = document.querySelector('.scores-container')
    strHTML = `<tr>
                <th>Name</th>
                <th>Time</th>
                <th>Level</th>
            </tr>`
    for (let i = 0; i < scores.length; i++) {
        switch (scores[i].level) {
            case gLevelEnum.EASY.SIZE:
                scores[i].level = 'Easy'
                break;
            case gLevelEnum.MEDIUM.SIZE:
                scores[i].level = 'Medium'
                break;
            case gLevelEnum.HARD.SIZE:
                scores[i].level = 'Hard'
                break;
        }
        strHTML += `<tr>
            <td>${scores[i].name}</td>
            <td>${scores[i].time}</td>
            <td>${scores[i].level}</td>
            </tr>`
    }
    scoresContain.innerHTML = strHTML
}

function showPopup() {
    var elPopup = document.querySelector('div.popup')
    var elTime = elPopup.querySelector('.timerDisplay')
    elPopup.style.display = 'block'
    elTime.innerHTML = 'Your score is:\n' + gGame.time.minutes + ':' + gGame.time.seconds
}
function hidePopup() {
    var elPopup = document.querySelector('div.popup')
    elPopup.style.display = 'none'
}
function renderStaticEl(){
    var elClicksLeft = document.querySelector('.safe-clicks-left')
    var elGodMode = document.querySelector('.godMode')
    elClicksLeft.innerHTML = gLevel.safeClick
    elGodMode.innerHTML = 'God Mode'
}
document.oncontextmenu = function () { //disables context menus
    return false;
}
