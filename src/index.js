import './styles.css';

document.addEventListener('DOMContentLoaded', () => {
    const gameboardPlayer = document.getElementById('gameboard-player');
    const gameboardComputer = document.getElementById('gameboard-computer');
    const startPlayButton = document.getElementById('start-play-button');
    let gameStarted = false;
    let playerShipsPlaced = 0;
    const maxPlayerShips = 5;

    createGameboard(gameboardPlayer, handlePlayerBoardClick);
    createGameboard(gameboardComputer, handleComputerBoardClick);

    startPlayButton.addEventListener('click', () => {
        gameStarted = true;
        startPlayButton.disabled = true;
    });

    function createGameboard(gameboard, clickHandler) {
        for (let i = 0; i < 100; i++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.index = i;
            square.addEventListener('click', clickHandler);
            gameboard.appendChild(square);
        }
    }

    function handlePlayerBoardClick(event) {
        if (gameStarted && playerShipsPlaced < maxPlayerShips) {
            placeShip(event.target);
        } else if (gameStarted && playerShipsPlaced === maxPlayerShips) {
            // Logik shoot player
        }
    }

    function handleComputerBoardClick(event) {
        if (gameStarted) {
            // Logik shoot computer
        }
    }

    function placeShip(square) {
        if (!square.classList.contains('ship')) {
            square.classList.add('ship');
            playerShipsPlaced++;
        }
    }
});

class Ship {
    constructor(length) {
        this.length = length;
        this.hits = Array(length).fill(false);
        this.sunk = false;
    }

    hit(position) {
        if (position < 0 || position >= this.length) {
            throw new Error('Invalid position');
        }
        this.hits[position] = true;
        this.checkSunk();
    }

    checkSunk() {
        this.sunk = this.hits.every(hit => hit);
    }

    isSunk() {
        return this.sunk;
    }
}

class Gameboard {
    constructor(size) {
        this.size = size;
        this.ships = [];
        this.attacks = Array(size).fill().map(() => Array(size).fill(null));
    }

    placeShip(ship, coordinates) {
        this.ships.push({ ship, coordinates });
    }

    receiveAttack(x, y) {
        let hitShip = null;
        this.ships.forEach(({ ship, coordinates }) => {
            // Logik Treffer
        });

        this.attacks[x][y] = hitShip !== null;
    }

    allShipsSunk() {
        return this.ships.every(({ ship }) => ship.isSunk());
    }
}

class Player {
    constructor(gameboard) {
        this.gameboard = gameboard;
        this.attacks = new Set();
    }

    makeAttack(x, y) {
        if (this.attacks.has(`${x},${y}`)) {
            return false;
        }

        this.gameboard.receiveAttack(x, y);
        this.attacks.add(`${x},${y}`);
    }
}
