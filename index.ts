enum Cell {
    Naught = 1, // Always bot
    Cross,      // Always user
    Empty
}

type Board = Cell[][];

class Leaf {
    constructor(public board: Board = null,
                public children: Leaf[] = [],
                public level: number = 0,
                public winner: Cell = null
    ) {}
}

const invertSign = function(sign: Cell): Cell {
    return sign === Cell.Cross ? Cell.Naught : Cell.Cross;
}

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
    const currentBoard = parent.board;
    const nextLevel = parent.level + 1;
    const winner = checkWinner(currentBoard);

    if (winner !== null) {
        parent.winner = winner;
        // Needs no children
        return;
    }

    const childBoards = generateNextMoveBoards(currentBoard, nextSign);
    childBoards.forEach(board => {
        const child = new Leaf(board, [], nextLevel);
        parent.children.push(child);
    });
    parent.children.forEach(child => makeGameTree(child, invertSign(nextSign)));
};

const boardsEqual = function(foo: Board, bar: Board): boolean {
    let equal = true;

    loop1: 
    for (let row = 0; row < foo.length; row++) {
        for (let column = 0; column < foo[0].length; column++) {
            if (foo[row][column] !== bar[row][column]) {
                equal = false;
                break loop1;
            }
        }
    }

    return equal;
};

const findLeafByBoard = function(parent: Leaf, targetBoard: Board): Leaf {
    let needle: Leaf = null;

    const currentBoard = parent.board;
    const currentChildren = parent.children;

    if (boardsEqual(currentBoard, targetBoard)) {
        // Try the top level node
        needle = parent; 
    } else {
        // Try the children
        for (let child = 0; child < currentChildren.length; child++) {
            const _find = findLeafByBoard(currentChildren[child], targetBoard);

            if (_find !== null) {
                needle = _find;
                break;
            }
        }
    }

    return needle;
};

interface Stats {
    [outcome: number]: number,
};

type BranchStats = [Leaf, Stats];

const computeBranchStats = function(parent: Leaf, acc: Stats): void {
    let outcome: Cell = null;

    if (parent.children.length === 0) {
        // Leaf node
        if (parent.winner !== null) {
            outcome = parent.winner;
        } else {
            // Draw
            outcome = Cell.Empty;
        }
        
        acc[outcome] += 1;
    } else {
        parent.children.forEach(child => computeBranchStats(child, acc));
    }
};

const findBestBranch = function(parent: Leaf, winningSign: (Cell.Cross | Cell.Naught)): Leaf {
    const children = parent.children;

    const branchStats = children.map((child: Leaf): BranchStats => {
        const stats: Stats = {[Cell.Cross]: 0, [Cell.Naught]: 0, [Cell.Empty]: 0};
        computeBranchStats(child, stats);
        return [child, stats];
    });

    // Compare branch stats
    const [bestLeaf] = branchStats.reduce((acc, elm) => {
        if (acc === null) {
            return elm;
        }

        const [accChild, accStats] = acc;
        const [child, stats] = elm;
        
        if (stats[winningSign] + stats[Cell.Empty] > accStats[winningSign] + accStats[Cell.Empty]) {
            return elm;
        }

        return acc;
    }, null);

    return bestLeaf;
};

/**
 * Execution
 */

const emptyBoard: Board = [
    // Row 0
    [Cell.Empty, Cell.Empty, Cell.Empty],
    // Row 1
    [Cell.Empty, Cell.Empty, Cell.Empty],
    // Row 2
    [Cell.Empty, Cell.Empty, Cell.Empty]
];

const game: Leaf = new Leaf(emptyBoard, [], 0);

makeGameTree(game, Cell.Cross);

const testBoard = [
    // Row 0
    [Cell.Empty, Cell.Empty, Cell.Empty],
    // Row 1
    [Cell.Empty, Cell.Cross, Cell.Cross],
    // Row 2
    [Cell.Empty, Cell.Empty, Cell.Naught]
];

const move = findLeafByBoard(game, testBoard);

const bestBranch = findBestBranch(move, Cell.Naught);
