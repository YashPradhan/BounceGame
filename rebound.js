/*dom objs w references*/
var ball;
var paddle;
var score;
var playingArea;

/*settings menu control*/
var gear;
var controls;
var newButton;
var difficultySelect;
var doneButton;

/*sound variables */
var snd;
var music;
var sndEnabled = false;
var musicEnabled = false;
var beepX;
var beepY;
var beepPaddle;
var beepGameOver;
var bgMusic;


var awidth;
var aheight;
var pWidth;
var pHeight;

var hSpeedBall = 2;
var vSpeedBall = 2;

/*number of px paddle moves based on keyboard*/
var paddleSpeed = 48;

var currentScore = 0;
var timer;
var paddleLeft = 228;
var ballLeft = 100;
var ballTop = 8;

//for mouse and touch screen control 
var drag = false;

window.addEventListener('load', initialize);
window.addEventListener('resize', initialize);

function initialize(){
    /*set variables as references to html objs
    1. we are storing dom objs in local variables
    2. minizing getElementById() calls - expensive operation
    3. improving pace of our game by having only one call per div*/
    ball = document.getElementById('ball');
    paddle = document.getElementById('paddle');
    score = document.getElementById('score');
    playingArea = document.getElementById('playingArea');
    gear = document.getElementById('gear');
    controls = document.getElementById('controls');
    newButton = document.getElementById('new');
    difficultySelect = document.getElementById('difficulty');
    doneButton = document.getElementById('done');
    snd = document.getElementById('snd');
    music = document.getElementById('music');
    layoutPage();
    document.addEventListener('keydown', keyListener, false);
    
    playingArea.addEventListener('mousedown', mouseDown, false);
    playingArea.addEventListener('mousemove', mouseMove, false);
    playingArea.addEventListener('mouseup', mouseUp, false);

    playingArea.addEventListener('touchstart', mouseDown, false);
    playingArea.addEventListener('touchmove', mouseMove, false);
    playingArea.addEventListener('touchend', mouseUp, false);

    gear.addEventListener('click', showSettings, false);
    newButton.addEventListener('click', newGame, false);
    doneButton.addEventListener('click', hideSettings, false);
    difficultySelect.addEventListener('change', function(){
        setDifficulty(difficultySelect.selectedIndex)
    }, false);

    snd.addEventListener('click', toggleSound, false);
    music.addEventListener('click', toggleMusic, false);

    timer = requestAnimationFrame(start); 
}

function layoutPage(){
    awidth = innerWidth;
    aheight = innerHeight;
    pWidth = awidth - 22; //10 on left and right plus 1 on each side for border
    pHeight = aheight - 22; //from css file btw

    playingArea.style.width = pWidth;
    playingArea.style.height = pHeight;
}

/* keyboard function recieved keyboard event by default
used for taking game commands on keyboard */
function keyListener(e){
    /* functionality for aswd keys AND arrow keys*/
    var key = e.keyCode;
    //leftArrow and A key values, as long as paddle on at left edge of screen
    if(paddleLeft > 0 &&(key == 37 || key == 65) ) {
        paddleLeft -= paddleSpeed;
        if(paddleLeft < 0){
            paddleLeft = 0;
        }
    }

    //right arrow and W key, right boundary = playingwidth - (wOfPaddle = 64)
    else if(paddleLeft < pWidth - 64 && (key == 39 || key == 68)) { 
        paddleLeft += paddleSpeed;
        if(paddleLeft > pWidth - 64){
            paddleLeft = pWidth - 64;
        }   
    }

    paddle.style.left = paddleLeft + 'px';
}

/* game loop function */
function start(){
    renderScreenObjs(); //drawing objs on screen
    detectCollisions();
    gameDifficulty()

    /* end conditions */
    if(ballTop < pHeight - 36){ //ball above score label and paddle
        //start() runs in each loops of the browers's animation
        timer = requestAnimationFrame(start); 
        //timer = setTimeout('start()', 50);
    }
    else{
        gameOver();
    }
}

function renderScreenObjs(){
    moveBall();
    updateScore()
}
function moveBall(){
    ballLeft += hSpeedBall;
    ballTop += vSpeedBall;
    ball.style.top = ballTop + 'px';
    ball.style.left = ballLeft + 'px';
}
function updateScore(){
    /* score mechanism: 5 points for every frame that the ball is still in play */
    currentScore += 5;  
    score.innerHTML = "Score: " + currentScore;
}

function detectCollisions(){
    if(collisionX()){
        hSpeedBall *= -1;  //if call collides w standing things |, then dx in other way
    }
    if(collisionY()){
        vSpeedBall *= -1;
    }
}
function collisionX(){
    //including 4 px cushion of colliding on each edge (remember ball width = 16)
    if(ballLeft < 4 || ballLeft > pWidth - 20){
        playSound(beepX);
        return true;
    }
    return false;
}
function collisionY(){
    //including 4 px cushion of colliding on each edge (remember ball width = 16)
    if(ballTop < 4){
        playSound(beepY);
        return true;
    }
    
    if(ballTop > pHeight - 64){ //if at top of paddle
        /*if(ballLeft >= paddleLeft && ballLeft <= paddleLeft + 64){
            return true;
        }*/
        //middle of paddle
        if(ballLeft >= paddleLeft + 16 && ballLeft <= paddleLeft + 48){
            if(vSpeedBall<0){
                vSpeedBall = -2;
            }
            else{
                vSpeedBall = 2;
            }
            playSound(beepPaddle);
            return true;
        }
        //left part of paddle - more difficult
        else if(ballLeft >= paddleLeft && ballLeft < paddleLeft + 16){
            if(vSpeedBall<0){
                vSpeedBall = -8;
            }
            else{
                vSpeedBall = 8;
            }
            playSound(beepPaddle);
            return true;
        }
        //right part of paddle
        else if(ballLeft > paddleLeft + 48 && ballLeft <= paddleLeft + 64){
            if(vSpeedBall<0){
                vSpeedBall = -8;
            }
            else{
                vSpeedBall = 8;
            }
            playSound(beepPaddle);
            return true;
        }
    }

    return false;
}

function gameDifficulty(){
    if(currentScore % 1000 == 0){
        if(vSpeedBall > 0){
            vSpeedBall += 2;
        }
        else{
            vSpeedBall -= 2;
        }
    }
}

function gameOver(){
    cancelAnimationFrame(timer);
    score.innerHTML += "       Game Over!";
    score.style.backgroundColor = "rgb(128, 0, 0)";
    playSound(beepGameOver);
    showSettings();
}

function mouseDown(e){
    drag = true;
}
function mouseMove(e){
    if(drag){
        e.preventDefault();
        //paddle middle aligned w mouse X position
        paddleLeft = e.clientX - 32 || e.targetTouches[0].pageX - 32;
        if(paddleLeft < 0){
            paddleLeft = 0;
        }
        if(paddleLeft > pWidth - 64){
            paddleLeft = pWidth - 64;
        }
        paddle.style.left = paddleLeft + 'px';
    }

}
function mouseUp(e){
    drag = false;
}

function showSettings(){
    controls.style.display = 'block';
    cancelAnimationFrame(timer);
}
function hideSettings(){
    controls.style.display = 'none';
    timer = requestAnimationFrame(start);  /* timer = function which has ptr to game loop -start func */
}
function setDifficulty(diff){
    switch(diff){
        case 0:
            vSpeedBall = 2;
            paddleSpeed = 48;
            break;
        case 1:
            vSpeedBall = 4;
            paddleSpeed = 32;
            break;
        case 2:
            vSpeedBall = 6;
            paddleSpeed = 16; 
            break;    
        default:
            vSpeedBall = 2;
            paddleSpeed = 48;       
    }
}
function newGame(){
    ballTop = 8;
    currentScore = 0;
    dx = 2;
    setDifficulty(difficultySelect.selectedIndex);
    score.style.backgroundColor = 'rgb(32, 128, 64)';
    hideSettings();
}
function initAudio(){
    /* tricking mobile browsers into playing audio?
    1. load the sound files
    2. lower volume to 0
    3. play each file (grants permission to play file)
    4. pause each file
    5. volume to 1, sets it up for next time u play it
    */

    // 1
   beepX = new Audio('sounds/beepX.mp3');
   beepY = new Audio('sounds/beepY.mp3');
   beepPaddle = new Audio('sounds/beepPaddle.mp3');
   beepGameOver = new Audio('sounds/beepGameOver.mp3');
   bgMusic = new Audio('sounds/music.mp3');

   // 2
   beepX.volume = 0;
   beepY.volume = 0;
   beepPaddle.volume = 0;
   beepGameOver.volume = 0;
   bgMusic.volume = 0;

   // 3
   beepX.play();
   beepY.play();
   beepPaddle.play();
   beepGameOver.play();
   bgMusic.play();

   // 4
   beepX.pause();
   beepY.pause();
   beepPaddle.pause();
   beepGameOver.pause();
   bgMusic.pause();

   // 5
   beepX.volume = 1;
   beepY.volume = 1;
   beepPaddle.volume = 1;
   beepGameOver.volume = 1;
   bgMusic.volume = 1;
}
function toggleSound(){
    if(beepX = null){ //audio has not been initialized
        initAudio();
    }
    sndEnabled = !sndEnabled;
}
function playSound(objSound){
    if(sndEnabled){
        objSound.play();
    }
}
function toggleMusic(){
    if(bgMusic = null){ //audio has not been initialized
        initAudio();
    }
    if(musicEnabled){
        bgMusic.pause();
    }
    else{
        bgMusic.loop = true;
        bgMusic.play();
    }
    musicEnabled = !musicEnabled;
}