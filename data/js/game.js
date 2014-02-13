(function () {

'use strict';

const NULL_NO = -1;
const TILES_MAX_TOP = 20;

const TILE_WIDTH = 300;
const TILE_HEIGHT = 300;

let Utils = {};

let context;

Utils.createTextElement = function (elType, text, parent) {
    let element = document.createElement(elType);
    element.textContent = text;
    return parent.appendChild(element);
};
Utils.roundNewPosition = function (x, y) {
    return {
        x: x - (x % TILE_WIDTH),
        y: y - (y % TILE_HEIGHT)
    };
};

Utils.tileInPlace = function (tile, newX, newY) {
    let tileImageData = context.getImageData(0, 0, TILE_WIDTH, TILE_HEIGHT);
    let imageData = context.getImageData(newX, newY, TILE_WIDTH, TILE_HEIGHT);
    for (let i = 0; i < imageData.data.length; i++) {
        if (imageData.data[i] !== tileImageData.data[i]) {
            return false;
        }
    }
    return true;
};

Utils.splitCanvas = function (canvas) {
    let tileTemplate = document.getElementById('tileCanvas');
    for (let row = 0; row < canvas.height; row += TILE_HEIGHT) {
        for (let col = 0; col < canvas.width; col += TILE_WIDTH) {
            let templateContent = tileTemplate.content.cloneNode(true);
            let tile = tileTemplate.getElementsByClassName('tile')[0];
            let tileContext = tile.getContext('2d');
            let imageData = tileContext.getImageData(col, row, TILE_WIDTH, TILE_HEIGHT);
            tileContext.putImageData(imageData);
            tile.style.top = (Math.random() * tilesCanvas.height + TILES_MAX_TOP) + 'px';
            tile.style.left = (Math.random() * tilesCanvas.width) + 'px';
            
            //Refer to https://hacks.mozilla.org/2013/04/detecting-touch-its-the-why-not-the-how/
            tile.addEventListener('touchend', function (event) {
                event.preventDefault();
                event.target.click();
            });
            
            tile.addEventListener('click', function () {
                if (selectedTile) {
                    selectedTile.classList.remove('selected');
                }
                selectedTile = this;
                this.classList.add('selected');
            });
            
            document.body.appendChild(tile);
        }
    }
};

let selectedTile = null;

let Game = {
    time: 0,
    tilesRemaining: NULL_NO,
    moves: 0,
    url: ''
};

Game.start = function (canvas, url) {
    context = canvas.getContext('2d');

	Utils.splitCanvas(canvas, context);
    Game.url = url;
	
    document.documentElement.addEventListener('click', function (event) {
        if (selectedTile && !event.target.classList.contains('tile')) {
            selectedTile.classList.remove('selected');
            let pos = Utils.roundNewPosition(event.clientX, event.clientY);
            if (selectedTile.move(pos.x, pos.y) && selectedTile.inPlace()) {
                Game.tilesRemaining--;
                UI.Dashboard.updateTilesRemaining();
                if (Game.tilesRemaining === 0) {
                    Game.end();
                }
            }
            selectedTile = null;
        }
    });
    
    Game.tilesRemaining = tiles.length;
    UI.Dashboard.init();
    Notification.requestPermission();
    PageVisibilityManager.registerVisibilityChange();
    //Minimum delay possible allowed!
    UI.Timer.start();
};

Game.end = function () {
	UI.Scores.load();
    UI.Scores.display();
	UI.Timer.stop();
    UI.Scores.addPrompt();
    UI.Scores.showDialog();
};

let UI = {};

let timerEl = null;
let movesEl = null;
let tilesRemainingEl = null;

UI.Dashboard = {};

UI.Dashboard.init = function () {
    timerEl = document.getElementById('timer');
    movesEl = document.getElementById('moves');
    movesEl.textContent = 0;
    tilesRemainingEl = document.getElementById('tilesRemaining');
    tilesRemainingEl.textContent = Game.tilesRemaining;
};

UI.Dashboard.updateMoves = function () {
    movesEl.textContent = Game.moves;
};

UI.Dashboard.updateTilesRemaining = function () {
    tilesRemainingEl.textContent = Game.tilesRemaining;
};

const SECOND_MILLIS = 1000;

UI.Timer = {
    interval: null
};

UI.Timer.start = function () {
    UI.Timer.interval = setInterval(function () {
        Game.time++;
        UI.Timer.update();
    }, SECOND_MILLIS);
};

UI.Timer.stop = function () {
    clearInterval(UI.Timer.interval);
};

UI.Timer.update = function () {
    const TIME_MULTIPLIER = 60;
    let hours = Math.floor(Game.time / (TIME_MULTIPLIER * TIME_MULTIPLIER));
    let remainingSeconds = Game.time % (TIME_MULTIPLIER * TIME_MULTIPLIER);
    timerEl.textContent = (hours ? hours + ':' : '') + UI.Timer.formatSingleDigit(Math.floor(remainingSeconds / TIME_MULTIPLIER)) +
                ':' + UI.Timer.formatSingleDigit(remainingSeconds % TIME_MULTIPLIER);
};

UI.Timer.formatSingleDigit = function (quantity) {
    return quantity < 10 ? '0' + quantity : quantity;
};

UI.Scores = {
    scores: []
};

UI.Scores.Score = function (player) {
    this.playerName = player;
    this.time = Game.time;
    this.url = Game.url;
    this.moves = Game.moves;
    let date = new Date();
    this.date = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
};

UI.Scores.showDialog = function () {
    let scoresEl = document.getElementById('scoresDialog');
    scoresEl.classList.add('show');
};

UI.Scores.load = function () {
    let i = 0;
    let currentScore = '';
    while (currentScore = localStorage.getItem('score' + i)) {
        UI.scores.push(JSON.parse(currentString));
        i++;
    }
};

UI.Scores.addPrompt = function () {
    let score = new UI.Scores.Score('');
    document.getElementById('ftime').textContent = score.time;
    document.getElementById('furl').textContent = score.url;
    document.getElementById('fdate').textContent = score.date;
    document.getElementById('fmoves').textContent = score.moves;
    document.getElementById('scoreForm').onsubmit = function () {
        score.name = document.getElementById('fplayer').value;
        UI.Scores.add(score);
    };
};

UI.Scores.add = function (score) {
    let i = 0;
    for (; UI.Scores.scores[i] && score.time < UI.Scores.scores[i].time; i++) {
        continue;
    }
    UI.Scores.scores.splice(i, 0, score);
    
    for (; i < UI.Scores.scores.length; i++) {
        localStorage.setItem('score' + i, JSON.stringify(UI.Scores.scores[i]));
    }
};

UI.Scores.display = function () {
    let table = document.getElementById('scores');
    UI.Scores.scores.forEach(function (score) {
        let tr = document.createElement('tr');
        Utils.createTextElement('td', score.playerName, tr);
        Utils.createTextElement('td', score.time, tr);
        Utils.createTextElement('td', score.date, tr);
        Utils.createTextElement('td', score.moves, tr);
        Utils.createTextElement('td', score.url, tr);
        table.appendChild(tr);
    });
    if (!UI.Scores.length) {
        document.getElementById('noScores').classList.add('show');
    }
};

let PageVisibilityManager = {};

PageVisibilityManager.handler = function () {
    if (Game.tilesRemaining) {
        if (document.hidden) {
            UI.Timer.stop();
            let notification = new Notification('Game paused!', {
                dir: 'ltr',
                lang: 'en',
                body: 'Timer was stopped and will be resumed when switching back to game tab. For your own fun, do not cheat.',
                tag: 'visibility change'
            });
        } else {
            UI.Timer.start();
        }
    }
};

PageVisibilityManager.registerVisibilityChange = function () {
    document.addEventListener('visibilitychange', PageVisibilityManager.handler);
    addEventListener('beforeunload', function () {
        document.removeEventListener('visibilitychange', PageVisibilityManager.handler);
    });
};

window.siteOPuzzle = Game.start;

})();