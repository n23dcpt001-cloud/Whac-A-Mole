const bgMusic = new Audio("./sounds/background.mp3");
const hitSound = new Audio("./sounds/hit.mp3");
const gameOverSound = new Audio("./sounds/gameover.mp3");
const clickSound = new Audio("./sounds/click.mp3");

bgMusic.loop = true;
bgMusic.volume = 0.7;

hitSound.volume = 0.3;
gameOverSound.volume = 0.7;
clickSound.volume = 0.5;
let currMoleTile;
let currPlantTile;
let score = 0;
let gameOver = false;

window.onload = function() {
    setGame();

    document.addEventListener("click", function startMusic() {
        bgMusic.play();
        document.removeEventListener("click", startMusic);
    });
}
function setGame() {
    //set up the grid in html
    for (let i = 0; i < 9; i++) { //i goes from 0 to 8, stops at 9
        //<div id="0-8"></div>
        let tile = document.createElement("div");
        tile.id = i.toString();
        tile.addEventListener("click", selectTile);
        document.getElementById("board").appendChild(tile);
    }
    setInterval(setMole, 1000); // 1000 miliseconds = 1 second, every 1 second call setMole
    setInterval(setPlant, 2000); // 2000 miliseconds = 2 seconds, every 2 second call setPlant
}

function getRandomTile() {
    //math.random --> 0-1 --> (0-1) * 9 = (0-9) --> round down to (0-8) integers
    let num = Math.floor(Math.random() * 9);
    return num.toString();
}

function setMole() {
    if (gameOver) {
        return;
    }
    if (currMoleTile) {
        currMoleTile.innerHTML = "";
    }
    let mole = document.createElement("img");
    mole.src = "./monty-mole.png";

    let num = getRandomTile();
    if (currPlantTile && currPlantTile.id == num) {
        return;
    }
    currMoleTile = document.getElementById(num);
    currMoleTile.appendChild(mole);
}

function setPlant() {
    if (gameOver) {
        return;
    }
    if (currPlantTile) {
        currPlantTile.innerHTML = "";
    }
    let plant = document.createElement("img");
    plant.src = "./piranha-plant.png";

    let num = getRandomTile();
    if (currMoleTile && currMoleTile.id == num) {
        return;
    }
    currPlantTile = document.getElementById(num);
    currPlantTile.appendChild(plant);
}

function selectTile() {
    if (gameOver) {
        return;
    }
    if (this == currMoleTile) {
    score += 10;
    document.getElementById("score").innerText = score.toString();

    hitSound.currentTime = 0;
    hitSound.play();
    }
    else if (this == currPlantTile) {
    document.getElementById("score").innerText = "GAME OVER: " + score.toString();
    gameOver = true;

    bgMusic.pause();

    gameOverSound.currentTime = 0;
    gameOverSound.play();
    }
}