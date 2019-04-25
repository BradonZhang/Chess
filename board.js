/*
Chess Board idea:
Is a 8x8 2D array, each spot representing a position on the board
On mouse click, mouse position is taken to determine which piece was dragged
On mouse release, mouse position is taken to determine where the piece was dragged to
If the new piece position is legal, then allow move; let piece change position to that location; else, return piece to original position

Legal moves:
Pawn promotion:
  Pawn object is replaced by R/B/Q/N object per user input

Move history can be an array of boards, starting at the initial board position being board[0]
*/

// Defines img elements for each piece
var wK = {color: "white", type: "king", url: "img/whiteKing.png"};
var wQ = {color: "white", type: "queen", url: "img/whiteQueen.png"};
var wR = {color: "white", type: "rook", url: "img/whiteRook.png"};
var wB = {color: "white", type: "bishop", url: "img/whiteBishop.png"};
var wN = {color: "white", type: "knight", url: "img/whiteKnight.png"};
var wP = {color: "white", type: "pawn", url: "img/whitePawn.png"};
var bK = {color: "black", type: "king", url: "img/blackKing.png"};
var bQ = {color: "black", type: "queen", url: "img/blackQueen.png"};
var bR = {color: "black", type: "rook", url: "img/blackRook.png"};
var bB = {color: "black", type: "bishop", url: "img/blackBishop.png"};
var bN = {color: "black", type: "knight", url: "img/blackKnight.png"};
var bP = {color: "black", type: "pawn", url: "img/blackPawn.png"};
var nX = "";//{color: null, type: null, url: ""}; // no piece

// Returns an image for a piece given its name
var pieceImg = function(pieceObj) {
  return "<img height='60' src='" + pieceObj.url + "' class='" + pieceObj.color + " " + pieceObj.type + " piece' />";
};

// File names for a given file array index
var fileNames = ['a','b','c','d','e','f','g','h'];

// Defines the history of boards, i.e. move history
var boardHistory = [];
// Defines the board in the game setup position
var board = [
  [wR, wN, wB, wQ, wK, wB, wN, wR],
  [wP, wP, wP, wP, wP, wP, wP, wP],
  [nX, nX, nX, nX, nX, nX, nX, nX],
  [nX, nX, nX, nX, nX, nX, nX, nX],
  [nX, nX, nX, nX, nX, nX, nX, nX],
  [nX, nX, nX, nX, nX, nX, nX, nX],
  [bP, bP, bP, bP, bP, bP, bP, bP],
  [bR, bN, bB, bQ, bK, bB, bN, bR]
];
boardHistory.push(board);

// Defines the current perspective of the board
var perspective = "white";
var turn = "white";
var wKMoved = false, wRaMoved = false, wRhMoved = false;
var bKMoved = false, bRaMoved = false, bRhMoved = false;

// Returns the current board
function getBoard() {
  return board;
}
// Returns the board history
function getBoardHistory() {
  return boardHistory;
}

// Searches through pieces to find the pieces with a certain color or type and returns [pieceObj, position] of all valid results
function searchPieces(color, type, boardToSearch) {
  var testBoard = boardToSearch;
  if (boardToSearch == null) {
    testBoard = board;
  }
  var colorAll = false;
  if (color != "black" && color != "white") {
    colorAll = true;
  }
  var typeAll = false;
  if (type != "king" && type != "queen" && type != "rook" && type != "bishop" && type != "knight" && type != "pawn") {
    typeAll = true;
  }
  var searchResults = [];
  for (var i = 0; i < testBoard.length; i++) {
    for (var j = 0; j < testBoard[i].length; j++) {
      var square = testBoard[i][j];
      if ((colorAll || square.color == color) && (typeAll || square.type == type)) {
        searchResults.push([square, [i,j]]);
      }
    }
  }
  return searchResults;
}

// pos1 is the currently selected piece, pos2 is the square it will move to
var pos1 = [];
var pos2 = [];

var autoFlip = false;
function autoFlipToggle() {
  autoFlip = !autoFlip;
}

// Prints the current board
function showBoard(perspective) {
  printedBoard = "<table class='board'>";
  for (var i = 7; i >= 0; i--) {
    printedBoard += "<tr>";
    for (var j = 0; j < 8; j++) {
      var rank = i;
      var file = j;
      if (perspective == "black") {
        rank = 7 - i;
        file = 7 - j;
      }
      var square = "";
      if (board[rank][file] != nX) {
        square = pieceImg(board[rank][file]);
      }
      printedBoard += "<td id=" + rank + file + " onclick='setPosition(" + rank + "," + file + ")'>" + square + "</td>";
    }
    printedBoard += "</tr>";
  }
  printedBoard += "</table>";
  document.getElementById("board").innerHTML = printedBoard;
}
// Flips board's perspective
function flipBoard() {
  var lastMove = document.getElementsByClassName("lastMove");
  var checked = document.getElementsByClassName("checked");
  var lastMovePos = [];
  var checkedPos = [];
  for (var i = 0; i < lastMove.length; i++) {
    lastMovePos[i] = lastMove[i].id;
  }
  for (var i = 0; i < checked.length; i++) {
    checkedPos[i] = checked[i].id;
  }
  if (perspective == "black") {
    perspective = "white";
  } else {
    perspective = "black";
  }
  pos1 = [];
  showBoard(perspective);
  for (var i = 0; i < lastMovePos.length; i++) {
    document.getElementById(lastMovePos[i]).classList.add("lastMove");
  }
  for (var i = 0; i < checkedPos.length; i++) {
    document.getElementById(checkedPos[i]).classList.add("checked");
  }
}
// Prints beginning board
showBoard(perspective);

// Selects the piece to be moved and the square to be moved to
function setPosition(rank, file) {
  if (pos1.length == 0 && board[rank][file] != nX) {
    if (board[rank][file] != nX && board[rank][file].color == turn) {
      pos1 = [rank, file];
      document.getElementById(rank + "" + file).classList.add("selectedSquare");
      findLegalMoves(pos1, true).forEach(function(d) {
        var square = document.getElementById(d[0] + "" + d[1]);
        square.classList.add("legalMove");
        if (square.innerHTML != "") {
          square.classList.add("legalCapture");
        }
      });
    }
  } else if (pos1.length > 0) {
    pos2 = [rank, file];
    document.getElementById(pos1[0] + "" + pos1[1]).classList.remove("selectedSquare");
    findLegalMoves(pos1, true).forEach(function(d) {
      var square = document.getElementById(d[0] + "" + d[1]);
      square.classList.remove("legalMove");
      if (square.innerHTML != "") {
        square.classList.remove("legalCapture");
      }
    });
    if (pos1[0] == pos2[0] && pos1[1] == pos2[1]) {
      pos1 = [];
      pos2 = [];
    } else if (!notSameColor(pos1, pos2)) {
      pos1 = pos2;
      pos2 = [];
      document.getElementById(rank + "" + file).classList.add("selectedSquare");
      findLegalMoves(pos1, true).forEach(function(d) {
        var square = document.getElementById(d[0] + "" + d[1]);
        square.classList.add("legalMove");
        if (square.innerHTML != "") {
          square.classList.add("legalCapture");
        }
      });
    } else {
      movePiece(pos1, pos2);
      pos1 = [];
      pos2 = [];
    }
  }
}

// enPassant should have the [rank, file] of the legal square of capture for one turn
var enPassant = [];
// Lists all legal moves based on the piece type
var colorToCheck;
var typeToCheck;
function findLegalMoves(pos1, checkForChecks) {
  var checks = checkForChecks;
  if (checkForChecks == null) {
    checks = false;
  }
  color = board[pos1[0]][pos1[1]].color;
  type = board[pos1[0]][pos1[1]].type;
  if (checks) {
    colorToCheck = color;
    typeToCheck = type;
  }
  legalMoves = [];
  switch (type) {
    case "king":
      for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
          var rank = pos1[0] + i;
          var file = pos1[1] + j;
          if (rank >= 0 && rank < 8 && file >= 0 && file < 8 && notSameColor(pos1, [rank, file])) {
            legalMoves.push([rank, file]);
          }
        }
      }
      // Castling
      if (checks) {
        // CONTINUE WORKING
        //if (!isChecked(colorToCheck)) {
          if (colorToCheck == "black") {
            if (!bKMoved && pos1[0] == 7 && pos1[1] == 4) {
              // Kingside
              var pathClear = true;
              if (!bRhMoved) {
                for (var i = 5; i < 7; i++) {
                  if (board[7][i] != nX) {
                    pathClear = false;
                  } /*else {
                    var oldBoard = JSON.parse(JSON.stringify(board));
                    var testBoard = JSON.parse(JSON.stringify(board));
                    testBoard[7][i] = testBoard[7][4];
                    testBoard[7][4] = nX;
                    if (isChecked(colorToCheck, testBoard, oldBoard)) {
                      pathClear = false;
                    }
                  }*/
                }
                if (pathClear) {
                  legalMoves.push([7,6])
                }
              }
              // Queenside
              pathClear = true;
              if (!bRaMoved) {
                for (var i = 3; i > 0; i--) {
                  if (board[7][i] != nX) {
                    pathClear = false;
                  } /*else if (i > 1) {
                    var oldBoard = JSON.parse(JSON.stringify(board));
                    var testBoard = JSON.parse(JSON.stringify(board));
                    testBoard[7][i] = testBoard[7][4];
                    testBoard[7][4] = nX;
                    if (isChecked(colorToCheck, testBoard, oldBoard)) {
                      pathClear = false;
                    }
                  }*/
                }
                if (pathClear) {
                  legalMoves.push([7,2])
                }
              }
            }
          } else {
              if (!wKMoved && pos1[0] == 0 && pos1[1] == 4) {
                // Kingside
                var pathClear = true;
                if (!wRhMoved) {
                  for (var i = 5; i < 7; i++) {
                    if (board[0][i] != nX) {
                      pathClear = false;
                    } /*else {
                      var oldBoard = JSON.parse(JSON.stringify(board));
                      var testBoard = JSON.parse(JSON.stringify(board));
                      testBoard[0][i] = testBoard[0][4];
                      testBoard[0][4] = nX;
                      if (isChecked(colorToCheck, testBoard, oldBoard)) {
                        pathClear = false;
                      }
                    }*/
                  }
                  if (pathClear) {
                    legalMoves.push([0,6])
                  }
                }
                // Queenside
                pathClear = true;
                if (!wRaMoved) {
                  for (var i = 3; i > 0; i--) {
                    if (board[0][i] != nX) {
                      pathClear = false;
                    } /*else if (i > 1) {
                      var oldBoard = JSON.parse(JSON.stringify(board));
                      var testBoard = JSON.parse(JSON.stringify(board));
                      testBoard[0][i] = testBoard[0][4];
                      testBoard[0][4] = nX;
                      if (isChecked(colorToCheck, testBoard, oldBoard)) {
                        pathClear = false;
                      }
                    }*/
                  }
                  if (pathClear) {
                    legalMoves.push([0,2]);
                  }
                }
              }
          }
        //}
      }
      break;

    case "queen":
      var rank = pos1[0];
      var file = pos1[1];
      var xPos = true;
      var xNeg = true;
      var yPos = true;
      var yNeg = true;
      var checkNE = true;
      var checkNW = true;
      var checkSE = true;
      var checkSW = true;
      for (var i = 1; i < 8; i++) {
        if (rank + i < 8 && xPos) {
          if (board[rank + i][file] == nX) {
            legalMoves.push([rank + i, file]);
          } else if (notSameColor(pos1, [rank + i, file])) {
            legalMoves.push([rank + i, file]);
            xPos = false;
          } else {
            xPos = false;
          }
        }
        if (rank - i >= 0 && xNeg) {
          if (board[rank - i][file] == nX) {
            legalMoves.push([rank - i, file]);
          } else if (notSameColor(pos1, [rank - i, file])) {
            legalMoves.push([rank - i, file]);
            xNeg = false;
          } else {
            xNeg = false;
          }
        }
        if (file + i < 8 && yPos) {
          if (board[rank][file + i] == nX) {
            legalMoves.push([rank, file + i]);
          } else if (notSameColor(pos1, [rank, file + i])) {
            legalMoves.push([rank, file + i]);
            yPos = false;
          } else {
            yPos = false;
          }
        }
        if (file - i >= 0 && yNeg) {
          if (board[rank][file - i] == nX) {
            legalMoves.push([rank, file - i]);
          } else if (notSameColor(pos1, [rank, file - i])) {
            legalMoves.push([rank, file - i]);
            yNeg = false;
          } else {
            yNeg = false;
          }
        }
        if (rank + i < 8 && file + i < 8 && checkNE) {
          if (board[rank + i][file + i] == nX) {
            legalMoves.push([rank + i, file + i]);
          } else if (notSameColor(pos1, [rank + i, file + i])) {
            legalMoves.push([rank + i, file + i]);
            checkNE = false;
          } else {
            checkNE = false;
          }
        }
        if (rank - i >= 0 && file + i < 8 && checkSE) {
          if (board[rank - i][file + i] == nX) {
            legalMoves.push([rank - i, file + i]);
          } else if (notSameColor(pos1, [rank - i, file + i])) {
            legalMoves.push([rank - i, file + i]);
            checkSE = false;
          } else {
            checkSE = false;
          }
        }
        if (rank - i >= 0 && file - i >= 0 && checkSW) {
          if (board[rank - i][file - i] == nX) {
            legalMoves.push([rank - i, file - i]);
          } else if (notSameColor(pos1, [rank - i, file - i])) {
            legalMoves.push([rank - i, file - i]);
            checkSW = false;
          } else {
            checkSW = false;
          }
        }
        if (rank + i < 8 && file - i >= 0 && checkNW) {
          if (board[rank + i][file - i] == nX) {
            legalMoves.push([rank + i, file - i]);
          } else if (notSameColor(pos1, [rank + i, file - i])) {
            legalMoves.push([rank + i, file - i]);
            checkNW = false;
          } else {
            checkNW = false;
          }
        }
      }
      break;

    case "rook":
      var rank = pos1[0];
      var file = pos1[1];
      var xPos = true;
      var xNeg = true;
      var yPos = true;
      var yNeg = true;
      for (var i = 1; i < 8; i++) {
        if (rank + i < 8 && xPos) {
          if (board[rank + i][file] == nX) {
            legalMoves.push([rank + i, file]);
          } else if (notSameColor(pos1, [rank + i, file])) {
            legalMoves.push([rank + i, file]);
            xPos = false;
          } else {
            xPos = false;
          }
        }
        if (rank - i >= 0 && xNeg) {
          if (board[rank - i][file] == nX) {
            legalMoves.push([rank - i, file]);
          } else if (notSameColor(pos1, [rank - i, file])) {
            legalMoves.push([rank - i, file]);
            xNeg = false;
          } else {
            xNeg = false;
          }
        }
        if (file + i < 8 && yPos) {
          if (board[rank][file + i] == nX) {
            legalMoves.push([rank, file + i]);
          } else if (notSameColor(pos1, [rank, file + i])) {
            legalMoves.push([rank, file + i]);
            yPos = false;
          } else {
            yPos = false;
          }
        }
        if (file - i >= 0 && yNeg) {
          if (board[rank][file - i] == nX) {
            legalMoves.push([rank, file - i]);
          } else if (notSameColor(pos1, [rank, file - i])) {
            legalMoves.push([rank, file - i]);
            yNeg = false;
          } else {
            yNeg = false;
          }
        }
      }
      break;

    case "bishop":
      var rank = pos1[0];
      var file = pos1[1];
      var checkNE = true;
      var checkNW = true;
      var checkSE = true;
      var checkSW = true;
      for (var i = 1; i < 8; i++) {
        if (rank + i < 8 && file + i < 8 && checkNE) {
          if (board[rank + i][file + i] == nX) {
            legalMoves.push([rank + i, file + i]);
          } else if (notSameColor(pos1, [rank + i, file + i])) {
            legalMoves.push([rank + i, file + i]);
            checkNE = false;
          } else {
            checkNE = false;
          }
        }
        if (rank - i >= 0 && file + i < 8 && checkSE) {
          if (board[rank - i][file + i] == nX) {
            legalMoves.push([rank - i, file + i]);
          } else if (notSameColor(pos1, [rank - i, file + i])) {
            legalMoves.push([rank - i, file + i]);
            checkSE = false;
          } else {
            checkSE = false;
          }
        }
        if (rank - i >= 0 && file - i >= 0 && checkSW) {
          if (board[rank - i][file - i] == nX) {
            legalMoves.push([rank - i, file - i]);
          } else if (notSameColor(pos1, [rank - i, file - i])) {
            legalMoves.push([rank - i, file - i]);
            checkSW = false;
          } else {
            checkSW = false;
          }
        }
        if (rank + i < 8 && file - i >= 0 && checkNW) {
          if (board[rank + i][file - i] == nX) {
            legalMoves.push([rank + i, file - i]);
          } else if (notSameColor(pos1, [rank + i, file - i])) {
            legalMoves.push([rank + i, file - i]);
            checkNW = false;
          } else {
            checkNW = false;
          }
        }
      }
      break;

    case "knight":
      for (var i = -2; i <= 2; i++) {
        for (var j = -2; j <= 2; j++) {
          var rank = pos1[0] + i;
          var file = pos1[1] + j;
          if (rank >= 0 && rank < 8 && file >=0 && file < 8) {
            if (notSameColor(pos1, [rank, file]) && Math.abs(i * j) == 2) {
              legalMoves.push([rank, file]);
            }
          }
        }
      }
      break;

    case "pawn":
      var rank = pos1[0];
      var file = pos1[1];
      if (color == "black") {
        if (rank - 1 >= 0 && board[rank - 1][file] == nX) {
          legalMoves.push([rank - 1, file]);
          if (rank >= 6 && board[rank - 2][file] == nX) {
            legalMoves.push([rank - 2, file]);
          }
        }
        // Pawn capturing
        if (rank - 1 >= 0 && file - 1 >= 0 && (board[rank - 1][file - 1] != nX || (enPassant[0] == rank - 1 && enPassant[1] == file - 1)) && notSameColor(pos1, [rank - 1, file - 1])) {
          legalMoves.push([rank - 1, file - 1]);
        }
        if (rank - 1 >= 0 && file + 1 < 8 && (board[rank - 1][file + 1] != nX || (enPassant[0] == rank - 1 && enPassant[1] == file + 1)) && notSameColor(pos1, [rank - 1, file + 1])) {
          legalMoves.push([rank - 1, file + 1]);
        }
      } else {
        if (board[rank + 1][file] == nX && rank + 1 < 8) {
          legalMoves.push([rank + 1, file]);
          if (rank <= 1 && board[rank + 2][file] == nX) {
            legalMoves.push([rank + 2, file])
          }
        }
        // Pawn capturing
        if (rank + 1 >= 0 && file - 1 >= 0 && (board[rank + 1][file - 1] != nX || (enPassant[0] == rank + 1 && enPassant[1] == file - 1)) && notSameColor(pos1, [rank + 1, file - 1])) {
          legalMoves.push([rank + 1, file - 1]);
        }
        if (rank + 1 >= 0 && file + 1 < 8 && (board[rank + 1][file + 1] != nX || (enPassant[0] == rank + 1 && enPassant[1] == file + 1)) && notSameColor(pos1, [rank + 1, file + 1])) {
          legalMoves.push([rank + 1, file + 1]);
        }
      }
      break;

    default:
      for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
          if (notSameColor(pos1, [i, j])) {
            legalMoves.push([i, j]);
          }
        }
      }
  }
  var legalMovesWithChecks = [];
  if (checks) {
    var legalMovesToCheck = JSON.parse(JSON.stringify(legalMoves));
    var oldBoard = JSON.parse(JSON.stringify(board));
    for (var i = 0; i < legalMovesToCheck.length; i++) {
      var rank1 = pos1[0];
      var file1 = pos1[1];
      var rank2 = legalMovesToCheck[i][0];
      var file2 = legalMovesToCheck[i][1];
      if (isChecked(turn) && typeToCheck == "king" && Math.abs(file2 - file1) > 1) {
        continue;
      }
      var checkBoard = JSON.parse(JSON.stringify(board));
      if (typeToCheck == "pawn" && Math.abs(rank2 - rank1) == 1 && Math.abs(file2 - file1) == 1 && checkBoard[rank2][file2] == nX) {
        if (colorToCheck == "black") {
          checkBoard[3][file2] = nX;
        } else {
          checkBoard[4][file2] = nX;
        }
      }
      checkBoard[rank2][file2] = checkBoard[rank1][file1];
      checkBoard[rank1][file1] = nX;
      if (!isChecked(turn, checkBoard, oldBoard)) {
        if (typeToCheck == "king" && Math.abs(file2 - file1) > 1) {
          checkBoard[rank2][(file2 + file1) / 2] = checkBoard[rank2][file2];
          checkBoard[rank2][file2] = nX;
          if (isChecked(turn, checkBoard, oldBoard)) {
            continue;
          }
        }
        legalMovesWithChecks.push(legalMovesToCheck[i]);
      }
    }
    return legalMovesWithChecks;
  } else {
    return legalMoves;
  }
}
// Determines if a player's king is being checked
function isChecked(checkColor, checkBoard, origBoard) {
  var color = turn;
  if (checkColor != null) {
    color = checkColor;
  }
  var checkThisBoard = JSON.parse(JSON.stringify(board));
  var oldBoard = JSON.parse(JSON.stringify(board));
  if (checkBoard == null) {
    checkThisBoard = JSON.parse(JSON.stringify(board));
    oldBoard = JSON.parse(JSON.stringify(board));
  } else if (origBoard == null) {
    checkThisBoard = JSON.parse(JSON.stringify(checkBoard));
    oldBoard = JSON.parse(JSON.stringify(board));
  } else {
    checkThisBoard = JSON.parse(JSON.stringify(checkBoard));
    oldBoard = JSON.parse(JSON.stringify(origBoard));
  }
  board = JSON.parse(JSON.stringify(checkThisBoard));
  var kingPos = searchPieces(color, "king")[0][1];
  var kingChecked = false;
  var enemyPieces = [];
  if (color == "black") {
    enemyPieces = searchPieces("white");
  } else {
    enemyPieces = searchPieces("black");
  }
  for (var i = 0; i < enemyPieces.length; i++) {
    var enemyPos = enemyPieces[i][1];
    findLegalMoves(enemyPos).forEach(function(d) {
      if (d[0] == kingPos[0] && d[1] == kingPos[1]) {
        kingChecked = true;
      }
    });
  }
  board = JSON.parse(JSON.stringify(oldBoard));
  return kingChecked;
}
// Determines if color player has no legal moves
function noLegalMoves(checkColor) {
  var color = turn;
  if (checkColor != null) {
    color = checkColor;
  }
  var pieces = searchPieces(color);
  var noMoves = true;
  for (var i = 0; i < pieces.length; i++) {
    var numOfMoves = findLegalMoves(pieces[i][1], true).length;
    if (numOfMoves > 0) {
      noMoves = false;
    }
  }
  return noMoves;
}
// Determines whether a given move from pos1 to pos2 is legal
function isLegal(pos1, pos2) {
  legalMoves = findLegalMoves(pos1, true);
  var legalMove = false;
  legalMoves.forEach(function(d) {
    if (d[0] == pos2[0] && d[1] == pos2[1]) {
      legalMove = true;
    }
  });
  return legalMove;
}
// Checks if two positions do not have pieces of the same color
function notSameColor(pos1, pos2) {
  var piece1 = board[pos1[0]][pos1[1]];
  var piece2 = board[pos2[0]][pos2[1]];
  if (piece1 != nX && piece2 != nX) {
    if (piece1.color == piece2.color) {
      return false;
    }
  }
  return true;
}

// Moves piece in pos1 (int[][]) to pos2 (int[][])
function movePiece(pos1, pos2) {
  if (isLegal(pos1, pos2)) {
    rank1 = pos1[0];
    file1 = pos1[1];
    rank2 = pos2[0];
    file2 = pos2[1];
    var color = board[rank1][file1].color;
    var type = board[rank1][file1].type;
    if (type == "pawn" && Math.abs(rank2 - rank1) == 2) {
      enPassant = [(rank1 + rank2) / 2, file1];
    } else {
      enPassant = [];
    }
    // Promotes pawn
    if (type == "pawn") {
      if ((rank2 == 0 && color == "black") || (rank2 == 7 && color == "white")) {
        var newPawnTypes = document.getElementsByName("pawnPromotion");
        for (var i = 0; i < newPawnTypes.length; i++) {
          if (newPawnTypes[i].checked) {
            board[rank1][file1] = {color: color, type: newPawnTypes[i].value, url: "img/" + color + newPawnTypes[i].value.charAt(0).toUpperCase() + newPawnTypes[i].value.substr(1) + ".png"};
          }
        }
      }
      /*if (rank2 == 0 && color == "black") {
        board[rank1][file1] = bQ;
      } else if (rank2 == 7 && color == "white") {
        board[rank1][file1] = wQ;
      }*/
    }
    // Captures for en passant
    var capturedEnPassant;
    if (type == "pawn" && rank2 - rank1 != 0 && file2 - file1 != 0 && board[rank2][file2] == nX) {
      if (color == "black") {
        capturedEnPassant = board[3][file2];
        board[3][file2] = nX;
      } else {
        capturedEnPassant = board[4][file2];
        board[4][file2] = nX;
      }
    }
    // Checks for castling, moves rook if castled
    if (type == "king") {
      if (color == "black") {
        bKMoved = true;
      } else {
        wKMoved = true;
      }
      if (Math.abs(file2 - file1) > 1) {
        if (file2 == 6) {
          board[rank2][5] = board[rank2][7];
          board[rank2][7] = nX;
        } else {
          board[rank2][3] = board[rank2][0];
          board[rank2][0] = nX;
        }
      }
    }
    if (type == "rook") {
      if (color == "black") {
        if (file1 == 0) {
          bRaMoved = true;
        } else {
          bRhMoved = true;
        }
      } else {
        if (file1 == 0) {
          wRaMoved = true;
        } else {
          wRhMoved = true;
        }
      }
    }
    if (board[rank2][file2] != nX) {
      document.getElementById("capturedPieces").innerHTML += pieceImg(board[rank2][file2]);
      document.getElementById("capturedPieces").getElementsByClassName("piece")[0].removeAttribute("class");
    } else if (type == "pawn" && file2 - file1 != 0) {
      document.getElementById("capturedPieces").innerHTML += pieceImg(capturedEnPassant);
      document.getElementById("capturedPieces").getElementsByClassName("piece")[0].removeAttribute("class");
    }
    var oldBoard = JSON.parse(JSON.stringify(board));
    board[rank2][file2] = board[rank1][file1];
    board[rank1][file1] = nX;
    showBoard(perspective);
    if (isChecked(turn)) {
      //document.getElementById("illegalMove").innerHTML = "Illegal move; you are under check!";
      board = JSON.parse(JSON.stringify(oldBoard));
      showBoard(perspective);
    } else {
      boardHistory.push(board);
      showBoard(perspective);
      if (autoFlip) {
        flipBoard();
      }
      if (turn == "black") {
        turn = "white";
      } else {
        turn = "black";
      }
      if (isChecked(turn)) {
        var kingPos = searchPieces(turn, "king")[0][1];
        document.getElementById(kingPos[0] + "" + kingPos[1]).classList.add("checked");
        if (noLegalMoves(turn)) {
          var otherColor = "BLACK";
          if (turn == "black") {
            otherColor = "WHITE";
          }
          document.getElementById("turnMessage").innerHTML = otherColor + " WINS BY CHECKMATE!";
        } else {
          document.getElementById("checkMessage").innerHTML = " - CHECK!";
          document.getElementById("moveNumber").innerHTML = Math.round(boardHistory.length / 2);
          document.getElementById("currentTurn").innerHTML = turn.toUpperCase();
        }
      } else {
        if (noLegalMoves(turn)) {
          document.getElementById("turnMessage").innerHTML = "STALEMATE";
        } else {
          document.getElementById("checkMessage").innerHTML = "";
          document.getElementById("moveNumber").innerHTML = Math.round(boardHistory.length / 2);
          document.getElementById("currentTurn").innerHTML = turn.toUpperCase();
        }
      }
      document.getElementById(pos1[0] + "" + pos1[1]).classList.add("lastMove");
      document.getElementById(pos2[0] + "" + pos2[1]).classList.add("lastMove");
      //document.getElementById("illegalMove").innerHTML = ("Make a move...");
    }
  }/* else {
    document.getElementById("illegalMove").innerHTML = ("Illegal move!");
  }*/
}
// Converts chess coordinate notation to array indices
function movePieceFromNotation(pos1, pos2) {
  rank1 = pos1.charAt(1) - 1;
  file1 = fileNames.indexOf(pos1.charAt(0));
  rank2 = pos2.charAt(1) - 1;
  file2 = fileNames.indexOf(pos2.charAt(0));
  movePiece([rank1, file1],[rank2, file2])
}
