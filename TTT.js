let readline = require("readline-sync");

class Square {
  static UNUSED_SQUARE = " ";
  static HUMAN_MARKER = "X";
  static COMPUTER_MARKER = "O";

  constructor(marker = Square.UNUSED_SQUARE) {
    this.marker = marker;
  }

  toString() {
    return this.marker;
  }

  setMarker(marker) {
    this.marker = marker;
  }

  isUnused() {
    return this.marker === Square.UNUSED_SQUARE;
  }

  getMarker() {
    return this.marker;
  }
}

class Board {
  constructor() {
    this.createBoard();
  }
  
  createBoard () {
    this.squares = {};
    for (let counter = 1; counter <= 9; ++counter) {
      this.squares[String(counter)] = new Square();
    }
  }

  display() {
    console.log("");
    console.log("     |     |");
    console.log(`  ${this.squares["1"]}  |  ${this.squares["2"]}  |  ${this.squares["3"]}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.squares["4"]}  |  ${this.squares["5"]}  |  ${this.squares["6"]}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.squares["7"]}  |  ${this.squares["8"]}  |  ${this.squares["9"]}`);
    console.log("     |     |");
    console.log("");
  }

  markSquareAt(key, marker) {
    this.squares[key].setMarker(marker);
  }

  isFull() {
    return this.unusedSquares().length === 0;
  }

  unusedSquares() {
    let keys = Object.keys(this.squares);
    return keys.filter(key => this.squares[key].isUnused());
  }

  countMarkersFor(player, keys) {
    let markers = keys.filter(key => {
      return this.squares[key].getMarker() === player.getMarker();
    });

    return markers.length;
  }

  displayWithClear() {
    console.clear();
    console.log("");
    console.log("");
    this.display();
  }
}

class Player {
  constructor(marker) {
    this.marker = marker;
    this.score = 0;
  }

  getMarker() {
    return this.marker;
  }
  
  incrementScore () {
    this.score++;
  }
}

class Human extends Player {
  constructor() {
    super(Square.HUMAN_MARKER);
  }
}

class Computer extends Player {
  constructor() {
    super(Square.COMPUTER_MARKER);
  }
}

class TTTGame {
  static MATCH_GOAL = 3;
  
  static POSSIBLE_WINNING_ROWS = [
    [ "1", "2", "3" ],            // top row of board
    [ "4", "5", "6" ],            // center row of board
    [ "7", "8", "9" ],            // bottom row of board
    [ "1", "4", "7" ],            // left column of board
    [ "2", "5", "8" ],            // middle column of board
    [ "3", "6", "9" ],            // right column of board
    [ "1", "5", "9" ],            // diagonal: top-left to bottom-right
    [ "3", "5", "7" ],            // diagonal: bottom-left to top-right
  ];

  constructor() {
    this.board = new Board();
    this.human = new Human();
    this.computer = new Computer();
    this.firstPlayer = this.human;
    this.secondPlayer = this.computer;
  }

  play () {
    //orchestrate game play
    this.displayWelcomeMessage();

    this.playOneGame();
    while (true) {
      if (this.matchWinner()) break;
      if (this.playAgain()) {
        this.board.createBoard();
        console.clear();
        console.log('Let\'s play again!');
        console.log('');
        this.playOneGame();
      } else break;
    }
    this.displayMatchWinner();
    this.displayGoodbyeMessage();
  }

  displayWelcomeMessage() {
    console.clear();
    console.log("Welcome to Tic Tac Toe!");
    console.log("");
  }

  displayGoodbyeMessage() {
    console.log("Thanks for playing Tic Tac Toe! Goodbye!");
  }

  displayResults() {
    if (this.isWinner(this.human)) {
      console.log("You won! Congratulations!");
    } else if (this.isWinner(this.computer)) {
      console.log("I won! I won! Take that, human!");
    } else {
      console.log("A tie game. How boring.");
    }
  }
  
  static joinOr (arr, symbol = ', ', word = 'or') {
    if (arr.length === 1) return String(arr[0]);
    if (arr.length === 2) return `${arr[0]} ${word} ${arr[1]}`;
    let lastEl = arr.pop();
    let sentence = `${arr.join(symbol)} ${word} ${lastEl}`;
    arr.push(lastEl);
    return sentence;
  }

  humanMoves() {
    let choice;

    while (true) {
      let validChoices = this.board.unusedSquares();
      const prompt = `Choose a square (${TTTGame.joinOr(validChoices)}): `;
      choice = readline.question(prompt);

      if (validChoices.includes(choice)) break;

      console.log("Sorry, that's not a valid choice.");
      console.log("");
    }

    this.board.markSquareAt(choice, this.human.getMarker());
  }

  computerMoves() {
    let choice = this.offensiveComputerMove() ||
                 this.defensiveComputerMove() ||
                 this.pickCenterSquare()      ||
                 this.pickRandomSquare();

    this.board.markSquareAt(choice, this.computer.getMarker());
  }
  
  pickCenterSquare () {
    return this.board.unusedSquares().includes('5') ? '5' : null;
  }
  
  pickRandomSquare () {
    let validChoices = this.board.unusedSquares();
    let choice;
    do {
        choice = Math.floor((9 * Math.random()) + 1).toString();
      } while (!validChoices.includes(choice));
    return choice;
  }
  
  defensiveComputerMove () {
    return this.computerOffenseOrDefense(this.human);
  }
  
  offensiveComputerMove () {
    return this.computerOffenseOrDefense(this.computer);
  }
  
  computerOffenseOrDefense (player) {
    let choice;
    TTTGame.POSSIBLE_WINNING_ROWS.some(row => {
      if (this.board.countMarkersFor(player, row) === 2) {
        row.forEach(square => {
          if (this.board.squares[square].isUnused()) choice = square;
        });
      }
    });
    return choice;
  }

  gameOver() {
    return this.board.isFull() || this.someoneWon();
  }

  someoneWon() {
    if (this.isWinner(this.human)) {
      this.human.incrementScore();
      return this.isWinner(this.human);
    }
    if (this.isWinner(this.computer)) {
      this.computer.incrementScore();
      return this.isWinner(this.computer);
    }
  }

  isWinner(player) {
    return TTTGame.POSSIBLE_WINNING_ROWS.some(row => {
      return this.board.countMarkersFor(player, row) === 3;
    });
  }
  
  playOneGame () {
    this.board.display();
    while (true) {

      if (this.firstPlayer === this.human) {
        this.humanMoves();
      } else {
        this.computerMoves();
        this.board.displayWithClear();
      }
      if (this.gameOver()) break;

      if (this.secondPlayer === this.computer) {
        this.computerMoves();
      } else {
        this.humanMoves();
      }
      if (this.gameOver()) break;
      
      this.board.displayWithClear();
    }
    
    this.board.displayWithClear();
    this.displayResults();
    this.displayMatchScore();
    this.togglePlayer();
  }
  
  togglePlayer () {
    if (this.firstPlayer === this.human) {
      this.firstPlayer = this.computer;
      this.secondPlayer = this.human;
    }
    else {
      this.firstPlayer = this.human;
      this.secondPlayer = this.computer;
    }
  }
  
  displayMatchScore () {
    console.log(`Match score: Humans score is ${this.human.score} Computers score is ${this.computer.score}`);
  }
  
  displayMatchWinner () {
    if (this.human.score === TTTGame.MATCH_GOAL) console.log('You won the match!');
    if (this.computer.score === TTTGame.MATCH_GOAL) console.log('Computer won the match!');
  }
  
  matchWinner () {
    if (this.human.score === TTTGame.MATCH_GOAL || this.computer.score === TTTGame.MATCH_GOAL) return true;
  }
  
  playAgain() {
    while (true) {
      let answer = readline.question('Do you want to play again (y/n)?').toLowerCase();
      if (answer === 'y') return true;
      if (answer === 'n') return false;
      console.log('Invalid input');
    }
  }
}

let game = new TTTGame();
game.play();