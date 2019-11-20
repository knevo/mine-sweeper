const MINE = '<img class="mine" src="assets/img/bomb.png">'
const FLAG = '<img class="flag" src="assets/img/flagged.png">'
function cellClicked(elCell) {
    var cellCoord = { i: parseInt(elCell.dataset.i), j: parseInt(elCell.dataset.j) }
    if (!gGame.isOn) return

    if (gGame.shownCount === 0) { //if first click
        setRandMines(cellCoord)
        setMinesNegsCount()
        startTimer()
    }
    cell = gBoard[cellCoord.i][cellCoord.j]
    if (cell.isMine) {
        var smiley = document.querySelector('.smiley')
        smiley.innerHTML = LOSE_EMOJI
        gameOver()
        return
    }
    if (cell.isShown) return;
    cell.isShown = true
    gGame.shownCount++
    expandShown(cellCoord)
    renderBoard()
    if (checkGameOver()) {
        gameOver()
    }
}

function cellMarked(elCell) {
    if (!gGame.isOn) return
    var markedCell = gBoard[elCell.dataset.i][elCell.dataset.j]
    markedCell.isFlagged = (markedCell.isFlagged) ? false : true
    gGame.flaggedCount = (markedCell.isFlagged && markedCell.isMine) ? ++gGame.flaggedCount : --gGame.flaggedCount
    if (checkGameOver()) gameOver()
    renderBoard()
}
// function expandShown(elCell, cellCoord) {  //non recursive expand
//     for (let i = cellCoord.i - 1; i <= cellCoord.i + 1; i++) {
//         if (i < 0 || i >= gBoard.length) continue
//         for (let j = cellCoord.j - 1; j <= cellCoord.j + 1; j++) {
//             if (j < 0 || j >= gBoard[0].length) continue
//             if (i === cellCoord.i && j === cellCoord.j) continue
//             cell = gBoard[i][j]
//             if (!cell.isMine && !cell.isShown) {
//                 cell.isShown = true
//                 gGame.shownCount++
//             }
//         }
//     }
// }
function expandShown(cellCoord) { //recursive expand
    if (gBoard[cellCoord.i][cellCoord.j].minesAroundCount!=0) return
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
                expandShown({i:i,j:j})
            }
        }
    }
}
function setMinesNegsCount() { //set for each cell, the number of neighbor mines
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].minesAroundCount = getMineNegsCount({ i: i, j: j })
        }

    }
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
function getCellNegs(excludeCell){ //get all of a cells neighbors including itself
    var cellsArr=[]
    for (var i = excludeCell.i - 1; i <= excludeCell.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue; 
        for (var j = excludeCell.j - 1; j <= excludeCell.j + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue; 
            cellsArr.push({i:i,j:j})
        }
    }
    return cellsArr
}
function setRandMines(excludeCell) {   //set mines on cells from array
    var excludeCellsArr = getCellNegs(excludeCell)
    var coords = getRandomCoordsArr(0, gLevel.SIZE - 1, gLevel.MINES, excludeCellsArr)
    for (let i = 0; i < gLevel.MINES; i++) {
        gBoard[coords[i].i][coords[i].j].isMine = true
    }
}
function getRandomCoordsArr(min,max,coordNum,excludeCellsArr){  //get an array with non repetitive cell coords
    var coordsArr=[]
    var isSame = false
    for (let i = 0; i < coordNum; i++) {
        var randCell = {i:getRandomIntInclusive(min,max),j:getRandomIntInclusive(min,max)}

        for (let index = 0; index < excludeCellsArr.length; index++) { //Check if generated cell is part of excluded cells arr
            if(excludeCellsArr[index].i === randCell.i && excludeCellsArr[index].j === randCell.j) isSame=true
        }
        for (let j = 0; j < coordsArr.length && !isSame; j++) {//check for duplicated random cells inside array
            if (coordsArr[j].i === randCell.i && coordsArr[j].j === randCell.j) {
                isSame=true
                break
            }  
        }
        if(!isSame) coordsArr.push(randCell)//push only if unique
        else i--
        isSame=false
    }
    return coordsArr
  }  
