/* exported WALL PASSAGEWAY CONSIDERED SOLUTION Maze */
/* globals BasicQueue PriorityQueue */

/*
 * Return a randomly chosen element of the given list.
 */
function choice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

/*
 * The types of cells required to represent a maze.
 */
const WALL = Symbol('WALL');
const PASSAGEWAY = Symbol('PASSAGEWAY');
const CONSIDERED = Symbol('CONSIDERED');
const SOLUTION = Symbol('SOLUTION');

/*
 * An individual cell in a maze.
 */
class MazeCell {
  constructor(row, column, type) {
    this.row = row;
    this.column = column;
    this.type = type;
  }

  toString() {
    return `MazeCell(${this.row}, ${this.column})`;
  }
}

/*
 * A randomly generated perfect maze.
 */
class Maze {
  /*
   * Construct a random perfect size ✕ size maze.  The size parameter must be odd.
   */
  constructor(size) {
    console.assert(size > 2, `A maze must be large enough to have an interior; its size cannot be ${size}.`);
    console.assert(size % 2 === 1, `The size of a maze must always be odd; it cannot be ${size}.`);

    // Fill the maze with walls.
    const indices = [...Array(size).keys()];
    this.maze = indices.map((row) =>
      indices.map((column) =>
        new MazeCell(row, column, WALL)
      )
    );

    // Set our current location and make it a passageway.
    let [row, column] = [1, 1];
    this.maze[row][column].type = PASSAGEWAY;

    // Each move will open a passageway through two walls.  Given a direction to move in, this function either returns the pair of walls that we can dig
    // through or nothing if there aren't two walls in that direction.
    const maybeGetWallCells = (rowOffset, columnOffset) => {
      const firstRow = this.maze[row + rowOffset] || [];
      const firstCell = firstRow[column + columnOffset];
      const secondRow = this.maze[row + 2 * rowOffset] || [];
      const secondCell = secondRow[column + 2 * columnOffset];
      if (secondCell !== undefined && secondCell.type === WALL) {
        return [[firstCell, secondCell]];
      }
      return [];
    };

    // Run a DFS with the neighbors ordered randomly, opening passageways as we go.
    const moves = [[row, column]];
    while (moves.length) {
      const cellPair = choice([
        ...maybeGetWallCells(1, 0),
        ...maybeGetWallCells(-1, 0),
        ...maybeGetWallCells(0, 1),
        ...maybeGetWallCells(0, -1),
      ]);
      if (cellPair !== undefined) {
        const [firstCell, secondCell] = cellPair;
        firstCell.type = PASSAGEWAY;
        secondCell.type = PASSAGEWAY;
        [row, column] = [secondCell.row, secondCell.column];
        moves.push([row, column]);
      } else {
        [row, column] = moves.pop();
      }
    }

    // The entry (source) point is always the first element of the second row.
    this.source = this.maze[1][0];
    this.source.type = PASSAGEWAY;
    // The exit (destination) point is always the last element of the second-to-last row.
    this.destination = this.maze[size - 2][size - 1];
    this.destination.type = PASSAGEWAY;
  }

  overwriteWith(otherMaze) {
    for (let rowIndex = this.maze.length; rowIndex--;) {
      for (let columnIndex = this.maze.length; columnIndex--;) {
        this.maze[rowIndex][columnIndex].type = otherMaze.maze[rowIndex][columnIndex].type;
      }
    }
  }

  /*
   * Returns all of a cell's neighbors (but do not check whether those neighbors have been visited).
   */
  getNeighbors(cell) {
    const maybeGetNeighbor = (rowOffset, columnOffset) => {
      const candidateRow = this.maze[cell.row + rowOffset] || [];
      const candidateCell = candidateRow[cell.column + columnOffset];
      if (candidateCell !== undefined && candidateCell.type === PASSAGEWAY) {
        return [candidateCell];
      }
      return [];
    };
    return [
      ...maybeGetNeighbor(-1, 0),
      ...maybeGetNeighbor(0, -1),
      ...maybeGetNeighbor(1, 0),
      ...maybeGetNeighbor(0, 1),
    ];
  }

  /*
   * Solve the maze by breadth-first search.  When the solution is found, modify the maze by marking each cell of the solution with the type SOLUTION.
   * Return the number of edges the search needed to generate to find the path.
   */
  solveByBFS() {
    let result = 0;
    const backpointers = new Map();
    const worklist = new BasicQueue();
    worklist.insert([undefined, this.source]);
    while (worklist.size > 0) {
      const [from, to] = worklist.remove();
      if (backpointers.has(to)) {
        continue;
      }
      backpointers.set(to, from);
      if (to === this.destination) {
        break;
      }
      for (const neighbor of this.getNeighbors(to)) {
        worklist.insert([to, neighbor]);
        neighbor.type = CONSIDERED;
        result += 1;
      }
    }
    this.source.type = SOLUTION;
    for (let current = this.destination; current !== undefined; current = backpointers.get(current)) {
      current.type = SOLUTION;
    }

    return result;
  }

  _heuristic(cell) {
    // TODO: stub
    return 0;
  }

  /*
   * Solve the maze by A*.  When the solution is found, modify the maze by marking each cell of the solution with the type SOLUTION.
   * Return the number of edges the search needed to generate to find the path.
   */
  solveByAStar() {
    // TODO: stub
    let result = 1;
    this.source.type = SOLUTION;
    return result;
  }

  /*
   * Count the number of cells either considered or in the solution path.
   */
  get cellsConsidered() {
    let result = 0;
    for (const row of this.maze) {
      for (const cell of row) {
        if (cell.type === CONSIDERED || cell.type === SOLUTION) {
          ++result;
        }
      }
    }
    return result;
  }

  /*
   * Count the number of cells in the solution path.
   */
  get cellsInSolution() {
    let result = 0;
    for (const row of this.maze) {
      for (const cell of row) {
        if (cell.type === SOLUTION) {
          ++result;
        }
      }
    }
    return result;
  }
}
