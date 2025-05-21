let readline = require('readline-sync');
// Twenty-One is a card game with a dealer and a player.
// The participants try to get as close to 21 points as possible without going over.


class Deck {
  constructor () {
    this.cards = [['H', 2], ['H', 3], ['H', 4], ['H', 5], ['H', 6], ['H', 7], ['H', 8],
    ['H', 9], ['H', 10], ['H', 'J'], ['H', 'Q'], ['H', 'K'], ['H', 'A'],
    ['D', 2], ['D', 3], ['D', 4], ['D', 5], ['D', 6], ['D', 7], ['D', 8],
    ['D', 9], ['D', 10], ['D', 'J'], ['D', 'Q'], ['D', 'K'], ['D', 'A'],
    ['C', 2], ['C', 3], ['C', 4], ['C', 5], ['C', 6], ['C', 7], ['C', 8],
    ['C', 9], ['C', 10], ['C', 'J'], ['C', 'Q'], ['C', 'K'], ['C', 'A'],
    ['S', 2], ['S', 3], ['S', 4], ['S', 5], ['S', 6], ['S', 7], ['S', 8],
    ['S', 9], ['S', 10], ['S', 'J'], ['S', 'Q'], ['S', 'K'], ['S', 'A']];
  }
  
  shuffle (array) {
    for (let index = array.length - 1; index > 0; index--) {
      let otherIndex = Math.floor(Math.random() * (index + 1));
      [array[index], array[otherIndex]] = [array[otherIndex], array[index]];
    }
  }
  
  deal () {
    let card1 = this.cards.shift();
    let card2 = this.cards.shift();
    let bothCards = [card1, card2];
    return bothCards;
  }
}

class Participant {
  constructor (hand) {
    this.hand = hand;
  }
  
  hit (deck) {
    this.hand.push(deck.shift());
  }
  
  isBusted (hand) {
    return this.score(hand) > 21 ? true : false;
  }
  
  score (hand) {
    let totalScore = 0;
    let worth10 = ['K', 'Q', 'J'];
    let aces = 0;
    let hadAce = false;
    for (let i = 0; i < hand.length; i++) {
      if (hand[i][1] === 'A') aces++;
      else if (worth10.includes(hand[i][1])) {
        totalScore += 10;
      } else totalScore += hand[i][1];
    }
    while (aces > 0) {
      hadAce = true;
      totalScore += 1;
      aces--;
    }
    if (totalScore <= 11 && hadAce) totalScore += 10;
    return totalScore;
  }
}

class Player extends Participant {
  constructor (hand) {
    super(hand);
  }
}

class Dealer extends Participant {
  constructor (hand) {
    super(hand);
  }
}

class TwentyOneGame {
  static RICH_PLAYER = 10;
  
  constructor () {
    this.deck;
    this.player;
    this.dealer;
    this.winner;
    this.playerMoney = 5;
  }
  
  start () {
    console.clear();
    this.displayWelcomeMessage();
    while (true) {
      this.deck = new Deck();
      this.dealCards();
      this.showCards();
      this.playerTurn();
      this.dealerTurn();
      this.determineWinner();
      this.adjustPlayerMoney();
      this.displayResult();
      if (this.broke()) {
        console.log('You ran out of money!');
        break;
      }
      if (this.rich()) {
        console.log('You are rich!');
        break;
      }
      if (this.endGame()) break;
      console.clear();
    }
    this.displayGoodbyeMessage();
  }
  
  dealCards () {
    this.deck.shuffle(this.deck.cards);
    this.player = new Player(this.deck.deal());
    this.dealer = new Dealer(this.deck.deal());
  }
  
  showCards (show) {
    if (show === 'dealerHand') {
      console.log(`Dealers hand: ${this.dealer.hand}`);
    } else if (show === 'myHand') {
      console.log(`My hand: ${this.player.hand}`);
    } else {
      console.log(`My hand: ${this.player.hand}`);
      console.log(`Dealers hand: ${this.dealer.hand[0]}`);
    }
  }
  
  playerTurn () {
    while (true) {
      console.log(`My score: ${this.player.score(this.player.hand)}`);
      console.log('Do you want to hit?(y/n)');
      let choice = readline.question().toLowerCase();
      if (choice !== 'y' && choice !== 'n') console.log('Enter a valid choice(y/n)');
      if (choice === 'y') {
        this.player.hit(this.deck.cards);
        this.showCards();
        this.player.score(this.player.hand);
        console.clear();
        if (this.player.isBusted(this.player.hand)) {
          console.log('You busted!');
          break;
        } else this.showCards();
      }
      if (choice === 'n') {
        console.clear();
        break;
      }
    }
  }
  
  dealerTurn () {
    while (true) {
      this.showCards('dealerHand');
      console.log(`Dealers score is ${this.dealer.score(this.dealer.hand)}`);
      if (this.player.isBusted(this.player.hand)) break;
      if (this.dealer.isBusted(this.dealer.hand)) {
        console.log('Dealer busted!');
        break;
      }
      if (this.dealer.score(this.dealer.hand) >= 17) break;
      this.dealer.hit(this.deck.cards);
    }
  }
  
  displayWelcomeMessage () {
    console.log('Welcome to Twenty One!');
  }
  
  displayGoodbyeMessage () {
    console.log('Thank you for playing Twenty One. Have a nice day.');
  }
  
  displayResult () {
    this.showCards('myHand');
    console.log(`My score is ${this.player.score(this.player.hand)}`);
    console.log(`Money status: ${this.playerMoney}`);
    console.log(`${this.winner} won!`);
  }
  
  determineWinner () {
    if (this.dealer.isBusted(this.dealer.hand)) this.winner = 'You';
    else if (this.player.isBusted(this.player.hand)) this.winner = 'Dealer';
    else if (this.player.score(this.player.hand) < this.dealer.score(this.dealer.hand)) this.winner = 'Dealer';
    else if (this.player.score(this.player.hand) > this.dealer.score(this.dealer.hand)) this.winner = 'You';
    else this.winner = 'Neither';
  }
  
  adjustPlayerMoney () {
    if (this.winner === 'You') this.playerMoney++;
    else if (this.winner === 'Dealer') this.playerMoney--;
  }
  
  endGame () {
    console.log('Do you want to play again?(y/n)');
    let choice = readline.question().toLowerCase();
    if (choice === 'n') return true;
    return false;
  }
  
  broke () {
    if (this.playerMoney === 0) return true;
  }
  
  rich () {
    if (this.playerMoney === TwentyOneGame.RICH_PLAYER) return true;
  }
}

let game = new TwentyOneGame();
game.start();
