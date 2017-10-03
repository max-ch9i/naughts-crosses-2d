// Hello world

enum Cell {
    Naught = 1, // Always bot
    Cross,      // Always user
    Empty
}

type Board = Cell[][];

class Leaf {
    constructor(private board: Board, private children: Leaf[], private level: number) {
    }
}

const Game: Leaf = new Leaf([], [], 0);

const invertSign = function(sign: Cell): Cell {
    return sign === Cell.Cross ? Cell.Naught : Cell.Cross; 
}

const emptyBoard: Board = [
    // Row 0
    [Cell.Empty, Cell.Empty, Cell.Empty],
    // Row 1
    [Cell.Empty, Cell.Empty, Cell.Empty],
    // Row 2
    [Cell.Empty, Cell.Empty, Cell.Empty]
];

const generateNextMoveBoards = function(current: Board, nextSign: Cell): Board[] {
    const boards: Board[] = [];

    // Step through every empty cell and record a board with the next sign there
    for (let row in current) {
        for (let column in current[row]) {
            if (current[row][column] === Cell.Empty) {
                // Copy the board
                const newBoard: Board = current.map(item => item.slice());
                newBoard[row][column] = nextSign;
                boards.push(newBoard);
            }
        }
    }

    return boards;
};

const checkSameInRow = function(row: Cell[]): Cell {
    return row.reduce((acc, elm) => {
        if (acc === undefined) {
            // First cell in a row
            return elm;
        } else if (acc === null) {
            // The row has no winner
            // Propagate null
            return null;
        } else if (acc !== elm) {
            // Not identical
            return null;
        }

        return acc;
    }, undefined);
};

const checkWinner = function(board: Board): Cell {
    let winner: Cell = null;

    // Check horizontal lines
    for (let row in board) {
        if (winner === null) {
            const _winner = checkSameInRow(board[row]);
            if (_winner !== Cell.Empty) {
                winner = _winner;
            }
        }
    }

    // Check vertical lines
    for (let column = 0; column < board[0].length; column++) {
        if (winner === null) {
            // Make a column
            const vertical: Cell[] = []; 

            for (let row in board) {
                vertical.push(board[row][column]);
            }
            
            const _winner = checkSameInRow(vertical);
            if (_winner !== Cell.Empty) {
                winner = _winner;
            }
        }
    }

    // Check diagonals
    if (winner === null) {
        const diagonalPositive: Cell[] = []; 

        for (let row = board.length - 1, column = 0; row >= 0; row--,  column++) {
            diagonalPositive.push(board[row][column]);
        }

        const _winner = checkSameInRow(diagonalPositive);
        if (_winner !== Cell.Empty) {
            winner = _winner;
        }
    }

    if (winner === null) {
        const diagonalNegative: Cell[] = []; 

        for (let row = 0, column = 0; row < board.length; row++,  column++) {
            diagonalNegative.push(board[row][column]);
        }

        const _winner = checkSameInRow(diagonalNegative);
        if (_winner !== Cell.Empty) {
            winner = _winner;
        }
    }

    return winner;
};

const makeGameTree = function(parent: Leaf, nextSign: Cell): void {

};
