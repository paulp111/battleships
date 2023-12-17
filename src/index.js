import './styles.css';
import './selectionScreen.js';

//---------Ship forms + offsets---------------
const shipForms = {
    ship1: { size: 4, offsets: [[0, 0], [0, 1], [0, 2], [0, 3]] },
    ship2: { size: 3, offsets: [[0, 0], [1, 0], [0, 1], [1, 1]] },
    ship3: { size: 2, offsets: [[0, 0], [0, 1]] },
};

let isHorizontal = true;

//-----------------Load Game------------------
document.addEventListener('DOMContentLoaded', () => {
    const gameboardPlayer = document.getElementById('gameboard-player');
    const gameboardComputer = document.getElementById('gameboard-computer');
    let gameStarted = false;
    let playerShipsPlaced = 0;
    const maxPlayerShips = Object.keys(shipForms).length;

//--------------Gameboard-----------------
    createGameboard(gameboardPlayer, playerBoardClick);
    createGameboard(gameboardComputer, computerBoardClick);


//------------Start + Computer Place---------
    document.addEventListener('gameStart', (e) => {
        gameStarted = true;
        const computerGameboard = new Gameboard(10);
        const computerPlayer = new ComputerPlayer(computerGameboard);
        computerPlayer.placeShipsRnd(shipForms);
    });
//--------------Hit on Enemy Gameboard-----------
    function computerBoardClick(event) {
        if (gameStarted) {
            playerShoot(event.target);
        }
    }
//---------------Player Shooting------------------
    function playerShoot(square) {
        const index = parseInt(square.dataset.index);
        if (!gameboardComputer.attacks[index]) {
            gameboardComputer.receiveAtk(index);
            if (gameboardComputer.attacks[index] === 'hit') {
                square.style.backgroundColor = 'green'; // Hitmarker Ship
            } else {
                square.style.backgroundColor = 'red'; // Hitmarker Water
            }
            square.classList.add('shot');
            computerTurn(); 
        }
    }
    
//----------------Comp Shooting--------------- 
    function computerTurn() {
        let index;
        do {
            index = Math.floor(Math.random() * 100);
        } while (gameboardPlayer.attacks[index] !== null);
    
        gameboardPlayer.receiveAtk(index);
        const square = gameboardPlayer.children[index];
        if (gameboardPlayer.attacks[index] === 'hit') {
            square.style.backgroundColor = 'green'; //Hitmarker Ship
        } else {
            square.style.backgroundColor = 'red'; //Hitmarker Water
        }
        square.classList.add('shot');
    }

//---------------Hrz/Vert Button------------
    const rotateBtn = document.getElementById('rotate-button');
    if (rotateBtn) {
        rotateBtn.addEventListener('click', () => {
            isHorizontal = !isHorizontal;
            rotateBtn.textContent = isHorizontal ? 'Horizontal' : 'Vertikal'; 
            console.log(`Schiffsausrichtung: ${isHorizontal ? 'horizontal' : 'vertikal'}`);
        });
        rotateBtn.textContent = 'Horizontal'; 
    }


//-------------------Gameboard-----------------
    function createGameboard(gameboard, clickHandler) {
        for (let i = 0; i < 100; i++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.index = i;
            square.addEventListener('click', clickHandler);
            gameboard.appendChild(square);
        }
    }

//------------Player Gameboard Click-------------
    function playerBoardClick(event) {
        if (gameStarted && playerShipsPlaced < maxPlayerShips) {
            const shipFormKey = sessionStorage.getItem('selectedShipForm');
            placeShip(event.target, shipForms[shipFormKey]);
        } else if (gameStarted && playerShipsPlaced === maxPlayerShips) {
            //Fix
        }
    }

    function computerBoardClick(event) {
        if (gameStarted && playerShipsPlaced === maxPlayerShips) {
            playerShoot(event.target);
        }
    }

    function playerShoot(square) {
        const index = parseInt(square.dataset.index);
        if (!gameboardComputer.attacks[index]) {
            gameboardComputer.receiveAtk(index);
            if (gameboardComputer.attacks[index] === 'hit') {
                square.style.backgroundColor = 'green'; 
            } else {
                square.style.backgroundColor = 'red'; 
            }
        }
    }

//-------------Ship Placement----------------
    function placeShip(square, shipForm) {
        const index = parseInt(square.dataset.index);
        const shipRow = Math.floor(index / 10);
        const shipCol = index % 10;
        let canPlaceShip = true;


//Offsets/Ausrichtung
        const offsets = shipForm.offsets.map(offset => 
            isHorizontal ? offset : [offset[1], offset[0]]
        );
//Placement Checking
        for (const [dx, dy] of offsets) {
            const targetRow = shipRow + dx;
            const targetCol = shipCol + dy;
            if (targetRow < 0 || targetRow >= 10 || targetCol < 0 || targetCol >= 10) {
                canPlaceShip = false;
                break;
            }
            const targetIndex = targetRow * 10 + targetCol;
            const targetSquare = gameboardPlayer.children[targetIndex];
            if (targetSquare.classList.contains('ship')) {
                canPlaceShip = false;
                break;
            }
        }
//Valid Placement
        if (canPlaceShip) {
            for (const [dx, dy] of offsets) {
                const targetRow = shipRow + dx;
                const targetCol = shipCol + dy;
                const targetIndex = targetRow * 10 + targetCol;
                const targetSquare = gameboardPlayer.children[targetIndex];
                targetSquare.classList.add('ship');
            }
            playerShipsPlaced++;
        } else {
            console.log("Schiff kann hier nicht platziert werden.");
        }
    }
    
});

//START GAME
document.addEventListener('gameStart', (e) => {
    gameStarted = true;
    computerPlayer.placeShipsRnd(shipForms);
    computerTurn(); //PC first turn
});

//---------------CLASS SHIPS----------------
class Ship {
    constructor(length) {
        this.length = length; //Ship Length
        this.hits = Array(length).fill(false); //hits status
        this.sunk = false; //sunk status 
    }

//register hits
    hit(position) {
        if (position < 0 || position >= this.length) {
            throw new Error('Invalid position');
        }
        this.hits[position] = true; //mark hit
        this.checkSunk(); 
    }

// all parts hit?
    checkSunk() {
        this.sunk = this.hits.every(hit => hit);
    }
//destroyed
    isSunk() {
        return this.sunk;
    }
}

//--------GAMEBOARD CLASS-------------------
class Gameboard {
    constructor(size) {
        this.size = size; //GB size
        this.ships = []; //Ship list
        this.attacks = new Array(size * size).fill(null); //pos status
    }
//place Ships
    placeShip(ship, coordinates) {
        this.ships.push({ ship, coordinates }); //add to list
        coordinates.forEach(index => {
            this.attacks[index] = 'ship'; //Coordinates
        });
    }

//Hits on map
    receiveAtk(index) {
        let hit = false;
        this.ships.forEach(({ ship, coordinates }) => {
            if (coordinates.includes(index)) {
                ship.hit();
                hit = true;
            }
        });
        this.attacks[index] = hit ? 'hit' : 'miss';
    }
//allsunk
    allShipsSunk() {
        return this.ships.every(({ ship }) => ship.isSunk());
    }
}

//----------- CLASS PLAYER---------------------
class Player {
    constructor(gameboard) {
        this.gameboard = gameboard; //Player GB
        this.attacks = new Set(); //save Attack
    }
//attack
    makeAttack(x, y) {
        if (this.attacks.has(`${x},${y}`)) {
            return false; //double tap
        }

        this.gameboard.receiveAtk(x, y); //handle hit 
        this.attacks.add(`${x},${y}`); //save hit
        return true;
    }
}

//-------------------CLASS COMPUTER------------------
class ComputerPlayer extends Player {
    constructor(gameboard) {
        super(gameboard); 
    }
//random Placement
    placeShipsRnd(shipForms) {
        for (const key in shipForms) {
            let placed = false;
            while (!placed) {
                const shipForm = shipForms[key]; //picked ship
                const isHorizontal = Math.random() < 0.5; //ausrichtung
                let row = Math.floor(Math.random() * 10); //Rnd Zeile
                let col = Math.floor(Math.random() * 10); //Rnd Col
//alignment 
                const offsets = shipForm.offsets.map(offset => 
                    isHorizontal ? offset : [offset[1], offset[0]]
                );

                let validPos = true;
//Validate Pos
                for (const [dx, dy] of offsets) {
                    const targetRow = row + dx;
                    const targetCol = col + dy;
                    if (targetRow < 0 || targetRow >= 10 || targetCol < 0 || targetCol >= 10 || this.gameboard.attacks[targetRow * 10 + targetCol] === 'ship') {
                        validPos = false;
                        break;
                    }
                }
//place Ship if pos valid 
                if (validPos) {
                    const coordinates = offsets.map(([dx, dy]) => (row + dx) * 10 + (col + dy));
                    this.gameboard.placeShip(new Ship(shipForm.size), coordinates);
                    placed = true;
                }
            }
        }
    }
}

