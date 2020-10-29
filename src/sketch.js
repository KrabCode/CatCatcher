// p5.disableFriendlyErrors = true; // compute fester

let mainCanvas;
let pg;
let cg;

let pmouseIsPressed = false;
let mouseIsInsidePolaroid = false;
let useImageCursor;

let grayscaleBackground = 0.15;
let grayscaleInteractive = 0.35;
let grayscaleInteractiveHover = 0.5;
let grayscaleWhite = 1;
let rectRoundedness = 100;

let cats;
let defaultCatCount = 7;
// let defaultCatCount = 99;
let catCount = defaultCatCount;
let catCountMinimum = 1;
let catCountMaximum = 99;
let winMessage;
let winningPolaroidAngle;
let winningPolaroidImage;

let tutorialPutCatsHereUnderstood = false;
let tutorialPutCatsHereFadeoutDuration = 100;
let tutorialPutCatsHereFadeoutStartFrame = 0;
let tutorialTakeAPhotoUnderstood = false;

let imageScale = 1;
let held = null;
let fadeSticks = false;
let gameState = 'intro'; // known states: intro, play, win
let introCatchphrase;

let sticksFadeoutDelay = 60;
let sticksFadeoutDuration = 60;
let sticksLastReleasedFrame = -sticksFadeoutDuration * 3;

let polaroidDiameter = 200;
let polaroidRadius = 100;
let polaroidRadiusSquared = 10000;
let polaroidPos;
let polaroidLoadingDuration = 120;
let polaroidLoadingAnimationIncrementPerFrame = 1 / polaroidLoadingDuration;
let polaroidLoadingAnimation = 0;
let polaroidLoadingJustCompleted = false;

let bigRayGrowthDuration = 60;
let bigRayGrowthStarted = -bigRayGrowthDuration * 2;

let smallRayAnimationDuration = 60;
let smallRayAnimationStarted = -smallRayAnimationDuration * 2;

let rayRotationTime = 0;
let rayCount = 12;

let targetRectPos;
let targetRectSize;

let catCountInsideTargetJustFilled = false;
let catCountInsideTarget = 0;
let catCountInsideTargetNorm = 0;
let catCountInsideTargetLerp = 0;

let catHeld;
let sticksIdle;
let sticksHeld;
let catWalkDown;
let catWalkRight;
let catWalkUp;

let polaroidIdle;
let polaroidBlep;

let title;
let catTitle;
let catSit;
let catSleep;

let labelPlayButton;
let labelAgainButton;
let labelTutorialTakeAPhoto;
let labelTutorialPutCatsHere;
let labelTutorialBeQuick;

let fontComicSans;

// noinspection JSUnusedGlobalSymbols
function preload() {
    polaroidBlep = loadAsset("polaroid-blep.png");
    polaroidIdle = loadAsset("polaroid-idle.png");
    sticksHeld = loadAsset("chopsticks-hold.png");
    sticksIdle = loadAsset("chopsticks-idle.png");
    catHeld = loadAsset("kitten-held.png");
    catWalkDown = [loadAsset("kitten-down-1.png"), loadAsset("kitten-down-2.png")];
    catWalkRight = [loadAsset("kitten-side-1.png"), loadAsset("kitten-side-2.png")];
    catWalkUp = [loadAsset("kitten-up-1.png"), loadAsset("kitten-up-2.png")];
    title = loadAsset("_title_white.png");
    catTitle = [loadAsset("kitten-lie-1.png"), loadAsset("kitten-lie-2.png")];
    catSit = [loadAsset("kitten-sit-1.png"), loadAsset("kitten-sit-2.png")];
    catSleep = [loadAsset("kitten-slipp-1.png"), loadAsset("kitten-slipp-2.png")];
    labelPlayButton = [loadAsset("button-play-1.png"), loadAsset("button-play-2.png")];
    labelAgainButton = [loadAsset("button-again-1.png"), loadAsset("button-again-2.png")];
    labelTutorialTakeAPhoto = loadAsset("tutorial-thentakeaphoto.png");
    labelTutorialPutCatsHere = loadAsset("tutorial-putcatshere.png");
    labelTutorialBeQuick = loadAsset("tutorial-bequick.png");
    fontComicSans = loadFont('assets\\comic_sans.ttf');
    // soundFormats('mp3');
    // meowSound = loadSound('assets/sounds/meow.mp3');
}

function loadAsset(localPath, successCallback) {
    if(successCallback == null) {
        return loadImage("assets\\images\\" + localPath);
    }
    return loadImage("assets\\images\\" + localPath, successCallback);
}

// noinspection JSUnusedGlobalSymbols
function setup() {
    mainCanvas = createCanvas(1366, 768);
    frameRate(60);
    noSmooth();
    colorMode(HSB, 1, 1, 1, 1);
    imageMode(CORNER);
    introCatchphrase = generateIntroCatchphrase();
    pg = createGraphics(width, height);
    cg = createGraphics(width, height, WEBGL);
    cg.colorMode(HSB, 1, 1, 1, 1);
    cg.imageMode(CENTER);
    pg.strokeCap(ROUND);
    pg.colorMode(HSB, 1, 1, 1, 1);
    pg.background(0);
    pg.imageMode(CENTER);
    pg.rectMode(CENTER);
    pg.noSmooth();
    pg.textFont(fontComicSans);
    polaroidPos = createVector(width - 300, height * .5);
    targetRectPos = createVector(width * .3, height * .5);
    targetRectSize = createVector(1366 * .4, 768 * .4);
}

// noinspection JSUnusedGlobalSymbols
function displayFPS() {
    pg.push();
    pg.textAlign(LEFT, CENTER);
    pg.textSize(40);
    pg.fill(grayscaleInteractiveHover);
    pg.noStroke();
    pg.text('fps ' + frameRate().toFixed(0), 20, 40);
    pg.pop();
}

function sortCatsByY() {
    cats.sort(function(a, b) {
        if (a.pos.y < b.pos.y) {
            return -1;
        }
        if (a.pos.y > b.pos.y) {
            return 1;
        }
        return 0;
    });
}

// noinspection JSUnusedGlobalSymbols
function draw() {
    mainCanvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
    pg.background(grayscaleBackground);
    pg.push();

    updateCursor();
    updateTutorial();
    if (gameState === 'intro') {
        // updateDrawIntroShader();
        drawIntro();
        updateDrawPlayButton(labelPlayButton);
    }
    if (gameState === 'play' || gameState === 'win') {
        updatePolaroidButton();
        drawPolaroidButton();
    }
    if (gameState === 'play') {
        cg.clear();
        cg.push();
        cg.translate(-width*.5, -height*.5);
        updateHoldState();
        updateCatCountInsideTarget();
        drawTarget();
        drawTutorial();
        sortCatsByY();
        updateDrawFreeCats();
        drawCursor();
        updateDrawHeldCat();
        cg.pop();
        pg.image(cg, width*.5, height*.5, width, height);
    }
    if (gameState === 'win') {
        drawWinningPolaroidImage();
        updateDrawPlayButton(labelAgainButton);
        drawCongratsMessage();
    }
    if (gameState === 'intro' || gameState === 'win') {
        updateDrawCatCountSettings();
    }
    // displayFPS();
    pg.pop();
    image(pg, 0, 0, width, height);
    pmouseIsPressed = mouseIsPressed;
}

// noinspection JSUnusedGlobalSymbols
function mousePressed() {
    if (gameState === 'play' && polaroidLoadingAnimation >= 1 && mouseIsInsidePolaroid) {
        winGame();
    }
}

// noinspection JSUnusedGlobalSymbols
function mouseReleased() {
    drop();
}

// noinspection JSUnusedGlobalSymbols
function keyPressed() {
    if(gameState === 'play' && keyCode === ESCAPE) {
        generateIntroCatchphrase();
        gameState = 'intro';
    }
}

function generateIntroCatchphrase() {
    let justOne = false;
    if(justOne) {
        return 'pls rember\nwen you feel scare or frigten\nnever forget ttimes wen u feeled happy\nwen day is dark\nalways rember happy day';
    }
    return introCatchphrase = random([
        'early access',
        'for your pleasure',
        'you can do it',
        'just like real life',
        'cuteness overload',
        '100% instagrammable',
        'share this with your mom',
        'no thoughts\nhead empty',
        'free range cats',
        'cats love me',
        'your advertisement here',
        'get your warm fuzzies here',
        'wen day is dark\nalways rember happy day',
    ]);
}

function drawIntro() {
    pg.push();
    pg.translate(width * .5, height * .45);
    pg.image(title, 0, 0);
    pg.translate(width * .035, -height * .1);
    pg.scale(2);
    pg.image(catTitle[animateOscillation()], 0, 0);
    pg.pop();
    pg.push();
    pg.translate(width * .75, height * .25);
    pg.fill(grayscaleInteractive);
    pg.noStroke();
    pg.rotate(PI * .15);
    pg.textAlign(CENTER,CENTER);
    pg.textSize(35);
    pg.text(introCatchphrase, 0, 0);
    pg.pop();
}

function updateDrawCatCountSettings() {
    let catCountSub = updateDrawButton(width * .1, height * .9, 70, 40, null, '-', 40);
    let catCountAdd = updateDrawButton(width * .25, height * .9, 70, 40, null, '+', 40);
    if (catCountSub) {
        catCount--;
    }
    if (catCountAdd) {
        catCount++;
    }
    catCount = clamp(catCount, catCountMinimum, catCountMaximum);
    pg.push();
    pg.noStroke();
    pg.fill(grayscaleWhite);
    pg.textAlign(RIGHT, CENTER);
    pg.textStyle();
    pg.textSize(30);
    let catCountLabel = catCount + " cat" + (catCount > 1 ? 's' : '');
    pg.text(catCountLabel, width * .2125, height * .895);
    let difficultyIndicator = 'difficulty: ';
    if (catCount < 8) {
        difficultyIndicator += 'easy';
    } else if (catCount < 16) {
        difficultyIndicator += 'normal';
    } else if (catCount < 24) {
        difficultyIndicator += 'hard';
    } else if (catCount < 32) {
        difficultyIndicator += 'brutal';
    } else {
        difficultyIndicator += 'nightmare';
    }
    pg.fill(grayscaleInteractiveHover);
    pg.textAlign(LEFT, CENTER);
    pg.text(difficultyIndicator, width * .08, height * .82);
    pg.pop();
}

function updateDrawPlayButton(label) {
    let clicked = updateDrawButton(width * .5, height * .88, 300, 100, label[animateOscillation()]);
    if (clicked) {
        restartGame();
    }
}

function updateDrawButton(x, y, w, h, labelImage, labelText, textScale) {
    let clicked = false;
    pg.push();
    pg.noStroke();
    pg.fill(grayscaleInteractive);
    let hover = isPointInRectangle(mouseX, mouseY, x - w * .5, y - h * .5, w, h);
    if (hover) {
        pg.fill(grayscaleInteractiveHover);
        cursor('pointer');
    }
    if (hover && mouseIsPressed && !pmouseIsPressed) {
        clicked = true;
    }
    pg.translate(x, y);
    if (hover) {
        pg.stroke(grayscaleWhite);
        pg.strokeWeight(3);
    }
    pg.rect(0, 0, w, h, rectRoundedness);
    if (textScale == null) {
        pg.textSize(50);
    } else {
        pg.textSize(textScale);
    }
    if (labelImage != null) {
        pg.scale(1.5);
        pg.image(labelImage, 0, 0);
    }
    if (labelText != null) {
        pg.noStroke();
        pg.fill(grayscaleWhite);
        pg.textAlign(CENTER, CENTER);
        pg.textStyle(BOLD);
        pg.text(labelText, 0, -10);
    }
    pg.pop();
    return clicked;
}

function drawCongratsMessage() {
    pg.push();
    pg.fill(grayscaleWhite);
    pg.translate(width * .5, height * .1);
    pg.textAlign(CENTER, CENTER);
    pg.textStyle(BOLD);
    pg.textSize(50);
    pg.text(winMessage, 0, 0)
    pg.pop();
}

function drawWinningPolaroidImage() {
    pg.push();
    pg.translate(targetRectPos.x, targetRectPos.y);
    pg.rotate(winningPolaroidAngle);
    pg.imageMode(CENTER);
    pg.rectMode(CENTER);
    pg.image(winningPolaroidImage, 0, 0);
    pg.noFill();
    pg.stroke(grayscaleWhite);
    pg.strokeWeight(5);
    pg.rect(0, 0, winningPolaroidImage.width, winningPolaroidImage.height);
    pg.pop();
}

function drawTutorial() {
    pg.push();
    if (!tutorialPutCatsHereUnderstood) {
        tutorialPutCatsHereFadeoutStartFrame = frameCount;
    }
    let tutorialPutCatsHereAlpha = 1. - animate(tutorialPutCatsHereFadeoutStartFrame, tutorialPutCatsHereFadeoutDuration);
    if (tutorialPutCatsHereAlpha > 0) {
        pg.tint(.6, tutorialPutCatsHereAlpha);
        pg.image(labelTutorialPutCatsHere, targetRectPos.x, targetRectPos.y);
    }
    if (!tutorialTakeAPhotoUnderstood) {
        pg.tint(.5);
        pg.image(labelTutorialTakeAPhoto, polaroidPos.x - polaroidDiameter * .5, polaroidPos.y + polaroidDiameter*1.1);
        pg.image(labelTutorialBeQuick, polaroidPos.x - polaroidDiameter * .5, polaroidPos.y + polaroidDiameter * 1.25);
    }
    pg.pop();
}

function updateTutorial() {
    if (catCountInsideTargetJustFilled) {
        tutorialPutCatsHereUnderstood = true;
    }
    if (gameState === 'win') {
        tutorialTakeAPhotoUnderstood = true;
    }
}

function updateCatCountInsideTarget() {
    let result = 0;
    for (let i = 0; i < catCount; i++) {
        let cat = cats[i];
        if (isInsideTargetWorldWrapAware(cat.pos.x, cat.pos.y)) {
            result++;
        }
    }
    catCountInsideTargetJustFilled = result !== catCountInsideTarget && result === catCount;
    catCountInsideTarget = result;
    catCountInsideTargetNorm = clamp(norm(catCountInsideTarget, 0, catCount), 0, 1);
    catCountInsideTargetLerp = lerp(catCountInsideTargetLerp, catCountInsideTargetNorm, .25);
}

function isInsideTargetWorldWrapAware(x, y) {
    return isInsideTarget(x, y) ||
        isInsideTarget(x + width, y) ||
        isInsideTarget(x - width, y) ||
        isInsideTarget(x, y + height) ||
        isInsideTarget(x, y - height) ||
        isInsideTarget(x + width, y + height) ||
        isInsideTarget(x + width, y - height) ||
        isInsideTarget(x - width, y + height) ||
        isInsideTarget(x - width, y - height);
}

function isInsideTarget(x, y) {
    return x > targetRectPos.x - targetRectSize.x * .5 &&
        x < targetRectPos.x + targetRectSize.x * .5 &&
        y > targetRectPos.y - targetRectSize.y * .5 &&
        y < targetRectPos.y + targetRectSize.y * .5;
}

function areAllCatsInsideTarget() {
    return catCountInsideTarget === catCount;
}

function drawTarget() {
    pg.push();
    pg.translate(targetRectPos.x, targetRectPos.y);
    pg.noStroke();
    pg.fill(grayscaleInteractive);
    pg.rect(0, 0, targetRectSize.x, targetRectSize.y);
    pg.pop();
}

function updatePolaroidButton() {
    let loadingConditionsMet = areAllCatsInsideTarget() && mouseIsInsidePolaroid;
    let polaroidLoadingAnimationLastFrame = polaroidLoadingAnimation;
    if (loadingConditionsMet) {
        polaroidLoadingAnimation += polaroidLoadingAnimationIncrementPerFrame;
    } else {
        polaroidLoadingAnimation -= polaroidLoadingAnimationIncrementPerFrame * 2;
    }
    if (gameState === 'win') {
        polaroidLoadingAnimation = 1;
    }
    polaroidLoadingAnimation = clamp(polaroidLoadingAnimation, 0, 1);
    polaroidLoadingJustCompleted = polaroidLoadingAnimationLastFrame < 1 && polaroidLoadingAnimation >= 1;
}

function drawPolaroidButton() {
    pg.push();
    pg.translate(polaroidPos.x, polaroidPos.y);
    pg.strokeCap(ROUND);
    pg.fill(grayscaleInteractive);
    pg.noStroke();
    pg.circle(0,0,polaroidRadius*2);
    pg.stroke(grayscaleWhite);
    pg.strokeWeight(2 + 8 * catCountInsideTargetLerp);
    if (catCountInsideTargetJustFilled) {
        smallRayAnimationStarted = frameCount;
    }
    if (catCountInsideTargetNorm >= 1) {
        drawPolaroidSmallRays();
    }
    if (catCountInsideTargetLerp >= .99) {
        pg.circle(0,0,polaroidRadius*2);
    } else if (catCountInsideTargetLerp > 0.001) {
        // calling arc from -HALF_PI to -HALF_PI+.0001 is counter-intuitively drawn as a full circle, so we need a silly if-statement workaround
        pg.arc(0,0,polaroidRadius*2,polaroidRadius*2, -HALF_PI, -HALF_PI + TAU * catCountInsideTargetLerp);
    }
    if (polaroidLoadingJustCompleted) {
        bigRayGrowthStarted = frameCount;
    }
    if (polaroidLoadingAnimation > polaroidLoadingAnimationIncrementPerFrame) {
        // same silly if-statement workaround as before
        pg.fill(grayscaleWhite);
        pg.noStroke();
        pg.arc(0,0,polaroidRadius*2,polaroidRadius*2, -HALF_PI, -HALF_PI + TAU * ease(polaroidLoadingAnimation, 2));
    }
    if (polaroidLoadingAnimation >= 1 || gameState === 'win') {
        drawPolaroidBigRays();
    }
    pg.translate(3, 5); // the polaroid picture is slightly off center so we need a minor correction
    pg.image(gameState === 'play' ? polaroidIdle : polaroidBlep, 0, 0);
    pg.pop();
}

function drawPolaroidSmallRays() {
    let growthAnimation = animateGrowth(smallRayAnimationStarted, smallRayAnimationDuration);
    rayRotationTime += growthAnimation * .005;
    pg.stroke(grayscaleWhite);
    pg.push();
    pg.strokeWeight(5);
    let extensionLength = polaroidDiameter * 0.15;
    let pointerRadius = polaroidDiameter * 0.65;
    let handleRadius = pointerRadius + extensionLength * growthAnimation;
    for (let i = 0; i < rayCount; i++) {
        let iNorm = norm(i, 0, rayCount);
        let theta = iNorm * TAU + rayRotationTime;
        let pointerX = pointerRadius * cos(theta);
        let pointerY = pointerRadius * sin(theta);
        pg.line(pointerX, pointerY, handleRadius * cos(theta), handleRadius * sin(theta));
        // let arrowheadRadius = pointerRadius + extensionLength * .35 * growthAnimation;
        // pg.line(pointerX, pointerY, arrowheadRadius * cos(theta+.05), arrowheadRadius * sin(theta+.05));
        // pg.line(pointerX, pointerY, arrowheadRadius * cos(theta-.05), arrowheadRadius * sin(theta-.05));
    }
    pg.pop();
}

function drawPolaroidBigRays() {
    let growthAnimation = animateGrowth(bigRayGrowthStarted, bigRayGrowthDuration);
    rayRotationTime += growthAnimation * .01;
    let rayRadiusMiddle = polaroidDiameter * .75;
    let rayGrowthAnimationEased = ease(growthAnimation, 3);
    let rayLength = polaroidDiameter * 0.3 * rayGrowthAnimationEased;
    pg.stroke(grayscaleWhite);
    pg.strokeWeight(5);
    for (let i = 0; i < rayCount; i++) {
        let iNorm = norm(i, 0, rayCount);
        let theta = iNorm * TAU + TAU / (rayCount * 2.) + rayRotationTime;
        let rayInnerRadius = rayRadiusMiddle - rayLength * .5;
        let rayOuterRadius = rayRadiusMiddle + rayLength * .5;
        pg.line(rayInnerRadius * cos(theta), rayInnerRadius * sin(theta),
            rayOuterRadius * cos(theta), rayOuterRadius * sin(theta));
    }
}

function animateGrowth(start, duration) {
    let animation = animate(start, duration);
    return clamp(pow(animation, .25), 0, 1); // juicy numbers
}

function animate(start, duration) {
    return clamp(norm(frameCount, start, start + duration), 0, 1);
}

function updateCursor() {
    cursor(ARROW);
    if (gameState === 'play') {
        mouseIsInsidePolaroid = distSquared(mouseX, mouseY, polaroidPos.x, polaroidPos.y) < polaroidRadiusSquared;
        useImageCursor = true;
        if (mouseIsInsidePolaroid && areAllCatsInsideTarget()) {
            useImageCursor = false;
            if (polaroidLoadingAnimation > 0 && polaroidLoadingAnimation < 1) {
                cursor('progress');
            } else if (polaroidLoadingAnimation >= 1) {
                cursor('pointer');
            }
        }
    }

}

function drawCursor() {
    if (!useImageCursor) {
        return;
    }
    noCursor();
    pg.push();
    let w = sticksHeld.width * imageScale;
    let h = sticksHeld.height * imageScale;
    let x = mouseX + w * 0.37;
    let y = mouseY + h * -0.37;
    if (held != null) {
        pg.image(sticksHeld, x, y, w, h);
    } else {
        if (fadeSticks) {
            let sticksFadeout = constrain(norm(frameCount - sticksFadeoutDelay, sticksLastReleasedFrame,
                sticksLastReleasedFrame + sticksFadeoutDelay), 0, 1);
            pg.tint(1, 1 - sticksFadeout);
        }
        pg.image(sticksIdle, x, y, w, h);
    }
    pg.pop();
}

function winGame() {
    winningPolaroidAngle = random(-PI * .05, PI * .05);
    winningPolaroidImage = pg.get(targetRectPos.x - targetRectSize.x * .5, targetRectPos.y - targetRectSize.y * .5, targetRectSize.x, targetRectSize.y);
    let newWinMessage = 'You win!\n';
    if (catCount >= 16) {
        newWinMessage += random([
            'Impressive! You got all ' + catCount + ' cats.',
            'Amazing! You got all ' + catCount + ' cats.',
        ]);
    } else if (catCount > 1) {
        newWinMessage += random([
            'You caught ' + catCount + ' fidgety cats on camera!',
            'You took a photo of ' + catCount + ' mischievous cats!',
            'You photographed ' + catCount + ' restless cats!',
            'You managed to herd ' + catCount + ' rowdy kittens!',
        ]);
    } else if (catCount === 1) {
        newWinMessage += 'You took a photo of a lonely cat...';
    } else {
        newWinMessage += 'You broke the game.';
    }
    winMessage = newWinMessage;
    gameState = 'win';
}

function restartGame() {
    generateCats();
    gameState = 'play';
}

function updateHoldState() {
    if (held != null && !mouseIsPressed) {
        drop();
    }
}

function drop() {
    held = null;
    sticksLastReleasedFrame = frameCount;
}

function updateDrawHeldCat() {
    if (held == null) {
        return;
    }
    held.updateDraw();
}

function updateDrawFreeCats() {
    for (let i = 0; i < cats.length; i++) {
        let c = cats[i];
        if (!c.isHeld()) {
            c.updateDraw();
        }
    }
}

function generateCats() {
    cats = [];
    for (let i = 0; i < catCount; i++) {
        cats.push(new Cat());
    }
}

function clamp(val, low, high) {
    return constrain(val, low, high);
}

// adapted from the amazing jeffrey thompson: http://www.jeffreythompson.org/collision-detection/point-rect.php
function isPointInRectangle(px, py, rx, ry, rw, rh) {
    return (px >= rx &&
        px <= rx + rw &&
        py >= ry &&
        py <= ry + rh);
}

// from the easing function tutorial by Etienne Jacob: https://necessarydisorder.wordpress.com/
function ease(p, g) {
    if (p < 0.5)
        return 0.5 * pow(2 * p, g);
    else
        return 1 - 0.5 * pow(2 * (1 - p), g);
}

// used instead of dist for a performance boost
function distSquared(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return dx * dx + dy * dy;
}

function animateOscillation(offset) {
    if (offset == null) {
        return floor(frameCount / 22.5) % 2;
    }
    return floor(frameCount / 22.5 + offset) % 2;
}

// noinspection SpellCheckingInspection
class Cat {
    // TODO drag tilt
    constructor() {
        this.id = this.uuid();
        this.pos = createVector(random(width), random(height));
        this.stance = 0;
        this.stanceStableMinimumFrames = 120;
        this.stanceChangedFrame = -random(this.stanceStableMinimumFrames * 6);
        this.dirStableMinimumFrames = 60;
        this.dirChangedFrame = -random(this.dirStableMinimumFrames * 6);
        this.direction = floor(random(4));
        this.size = 62 * imageScale;
        this.interactionDistSquared = (this.size * .5) * (this.size * .5);
        this.hue = (.7 + random(.4)) % 1;
        this.sat = random(.15, .4);
        this.br = random(.8, 1);
        this.timeOffset = random(10);
        this.speedMagnitude = random(.25, .75);
        this.pInsideTarget = false;
        this.exitTargetAnimationDuration = 30;
        this.exitTargetAnimationStarted = -this.exitTargetAnimationDuration * 2;
        this.exitTargetAnimationPos = createVector();
    }

    updateDraw() {
        this.mouseInteract();
        if (this.isHeld()) {
            this.stance = 0;
            this.stanceChangedFrame = frameCount;
        } else {
            this.updateStance();
            if (this.isInMovingStance()) {
               this.updateDirection();
               this.move();
            }
            if (!this.isInSleepingStance()) {
               this.checkCollisions();
            }
        }
        this.drawCatExitsTargetIndicator();
        this.draw();
    }

    drawCatExitsTargetIndicator() {
        let insideTarget = isInsideTarget(this.pos.x, this.pos.y);
        if (!insideTarget && this.pInsideTarget) {
            this.exitTargetAnimationStarted = frameCount;
            this.exitTargetAnimationPos.x = this.pos.x;
            this.exitTargetAnimationPos.y = this.pos.y;
        }
        this.pInsideTarget = insideTarget;
        let exitAnimation = animateGrowth(this.exitTargetAnimationStarted, this.exitTargetAnimationDuration);
        let alpha = 1 - exitAnimation;
        if (alpha > 0) {
            pg.push();
            pg.translate(this.exitTargetAnimationPos.x, this.exitTargetAnimationPos.y);
            pg.stroke(grayscaleWhite, alpha);
            pg.strokeWeight(3);
            pg.noFill();
            let diameter =  120 * exitAnimation;
            pg.ellipse(0,0,diameter, diameter);
            pg.pop();
        }
    }


    isInMovingStance() {
        return this.stance === 0;
    }

    isInSittingStance() {
        return this.stance === 1;
    }

    isInSleepingStance() {
        return this.stance === 2;
    }

    updateStance() {
        let framesSinceStateLastChanged = frameCount - this.stanceChangedFrame;
        if (framesSinceStateLastChanged < this.stanceStableMinimumFrames) {
            return;
        }
        let rand = random(1);
        if (rand < 0.05) {
            // sit up or stand up
            this.stance--;
            this.stanceChangedFrame = frameCount;
        }
        if (rand > .97) {
            // sit down or start sleeping when sitting already
            this.stance++;
            this.stanceChangedFrame = frameCount;
        }
        this.stance = clamp(this.stance, 0, 2);
    }

    move() {
        let speed = createVector();
        if (this.direction === 0) {
            speed.x = 1;
        } else if (this.direction === 1) {
            speed.y = 1;
        } else if (this.direction === 2) {
            speed.x = -1;
        } else if (this.direction === 3) {
            speed.y = -1;
        }
        speed.mult(this.speedMagnitude);
        this.pos.add(speed);
        if (this.pos.x < this.size / 2) {
            this.pos.x += width;
        }
        if (this.pos.x > width + this.size / 2) {
            this.pos.x -= width;
        }
        if (this.pos.y < this.size / 2) {
            this.pos.y += height;
        }
        if (this.pos.y > height + this.size / 2) {
            this.pos.y -= height;
        }
    }


    updateDirection() {
        let framesSinceDirLastChanged = frameCount - this.dirChangedFrame;
        if (framesSinceDirLastChanged < this.dirStableMinimumFrames) {
            return;
        }
        if (random(1) < 0.01) {
            this.changeDirection();
            this.dirChangedFrame = frameCount;
        }
    }

    changeDirection() {
        if (random(1) > 0.5) {
            this.direction++;
        } else {
            this.direction--;
        }
        while (this.direction < 0) {
            this.direction += 4;
        }
        this.direction %= 4;
    }


    draw() {
        cg.push();
        let frame = animateOscillation(this.timeOffset);
        let flipHorizontally = this.direction === 2 && !this.isHeld();
        let img = this.currentImage(frame);
        cg.tint(this.hue, this.sat, this.br, 1);
        this.drawCatAtPos(img, flipHorizontally);
        this.drawCatWrapAround(img, flipHorizontally);
        cg.pop();
    }

    drawCatAtPos(img, flipHorizontally) {
        cg.push();
        cg.translate(this.pos.x, this.pos.y);
        this.flipIfNeeded(flipHorizontally);
        cg.image(img, 0, 0);
        cg.pop();
    }

    drawCatWrapAround(img, flipHorizontally) {
        cg.push();
        cg.translate(this.pos.x, this.pos.y);
        let leftBorder = this.pos.x < this.size / 2;
        let rightBorder = this.pos.x > width - this.size / 2;
        let topBorder = this.pos.y < this.size / 2;
        let bottomBorder = this.pos.y > height - this.size / 2;
        if (leftBorder) {
            this.drawCatWithOffset(img, flipHorizontally, width, 0);
            if (topBorder) {
                this.drawCatWithOffset(img, flipHorizontally, width, height);
            }
            if (bottomBorder) {
                this.drawCatWithOffset(img, flipHorizontally, width, -height);
            }
        }
        if (rightBorder) {
            this.drawCatWithOffset(img, flipHorizontally, -width, 0);
            if (topBorder) {
                this.drawCatWithOffset(img, flipHorizontally, -width, height);
            }
            if (bottomBorder) {
                this.drawCatWithOffset(img, flipHorizontally, -width, -height);
            }
        }
        if (topBorder) {
            this.drawCatWithOffset(img, flipHorizontally, 0, height);
        }
        if (bottomBorder) {
            this.drawCatWithOffset(img, flipHorizontally, 0, -height);
        }
        cg.pop();
    }

    drawCatWithOffset(img, flipHorizontally, x, y) {
        cg.push();
        cg.translate(x, y);
        this.flipIfNeeded(flipHorizontally);
        cg.image(img, 0, 0);
        cg.pop();
    }

    currentImage(frame) {
        if (this.isHeld()) {
            return catHeld;
        }
        if (this.isInMovingStance()) {
            if (this.direction === 0 || this.direction === 2) {
                return catWalkRight[frame];
            } else if (this.direction === 1) {
                return catWalkDown[frame];
            }
            return catWalkUp[frame];
        } else if (this.isInSittingStance()) {
            return catSit[frame];
        } else if (this.isInSleepingStance()) {
            return catSleep[frame];
        }

        return catHeld;
    }

    flipIfNeeded(flipX) {
        if (flipX) {
            cg.scale(-1, 1);
        } else {
            cg.scale(1, 1);
        }
    }

    isHeld() {
        if (held == null) {
            return false;
        }
        return held.id === this.id;
    }

    mouseInteract() {
        let interactionWorldWrapTeleportX = 0;
        let interactionWorldWrapTeleportY = 0;
        if (held == null && mouseIsPressed) {
            let isOverCatButAcrossTheScreen = false;
            let isDirectlyOverCat = this.isOffsetMouseOverCat(0, 0);
            if (!isDirectlyOverCat) {
                isOverCatButAcrossTheScreen = true;
                if (this.isOffsetMouseOverCat(width, 0)) {
                    interactionWorldWrapTeleportX += -width;
                } else if (this.isOffsetMouseOverCat(-width, 0)) {
                    interactionWorldWrapTeleportX += width;
                } else if (this.isOffsetMouseOverCat(0, height)) {
                    interactionWorldWrapTeleportY += -height;
                } else if (this.isOffsetMouseOverCat(0, -height)) {
                    interactionWorldWrapTeleportY += height;
                } else if (this.isOffsetMouseOverCat(width, height)) {
                    interactionWorldWrapTeleportX += -width;
                    interactionWorldWrapTeleportY += -height;
                } else if (this.isOffsetMouseOverCat(-width, height)) {
                    interactionWorldWrapTeleportX += width;
                    interactionWorldWrapTeleportY += -height;
                } else if (this.isOffsetMouseOverCat(width, -height)) {
                    interactionWorldWrapTeleportX += -width;
                    interactionWorldWrapTeleportY += height;
                } else if (this.isOffsetMouseOverCat(-width, -height)) {
                    interactionWorldWrapTeleportX += width;
                    interactionWorldWrapTeleportY += height;
                } else {
                    isOverCatButAcrossTheScreen = false;
                }
            }
            if (isDirectlyOverCat || isOverCatButAcrossTheScreen) {
                held = this;
            }
        }
        if (held != null && held.id === this.id) {
            this.pos.x += interactionWorldWrapTeleportX;
            this.pos.y += interactionWorldWrapTeleportY;
            this.pos.x = mouseX;
            this.pos.y = mouseY;
            //  this.pos.x = lerp(this.pos.x, mouseX, .35);
            //  this.pos.y = lerp(this.pos.y, mouseY, .35);
        }
    }

    isOffsetMouseOverCat(x, y) {
        return distSquared(mouseX + x, mouseY + y, this.pos.x, this.pos.y) < this.interactionDistSquared;
    }

    checkCollisions() {
        for (let i = 0; i < cats.length; i++) {
            let otherCat = cats[i];
            if (otherCat.id === this.id) {
                continue;
            }
            if (!isPointInRectangle(otherCat.pos.x, otherCat.pos.y, this.pos.x - this.size, this.pos.y - this.size, this.size * 2, this.size * 2)) {
                continue;
            }
            let distanceToOther = distSquared(this.pos.x, this.pos.y, otherCat.pos.x, otherCat.pos.y);
            if (distanceToOther < this.interactionDistSquared * 2) {
                if (this.isInSittingStance()) {
                    this.stance--;
                }
                let fromOtherToThis = p5.Vector.sub(this.pos, otherCat.pos);
                let repulsion = (1 / norm(distanceToOther, 0, this.interactionDistSquared)) * .5;
                repulsion = min(repulsion, 5);
                this.pos.add(fromOtherToThis.normalize().mult(repulsion));
            }
        }
    }

    uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
