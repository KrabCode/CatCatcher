p5.disableFriendlyErrors = true; // compute faster pls

let mainCanvas;
let pg;
let cg;

let pmouseIsPressed = false;
let mouseIsInsidePolaroid = false;
let useImageCursor;

const grayscaleBackground = .15;
const grayscaleTarget = 0.225;
const grayscaleInteractive = 0.35;
const grayscaleInteractiveHover = 0.5;
const grayscaleBright = 0.75;
const grayscaleWhite = 1;
const rectRoundedness = 100;

let cats;
const defaultCatCount = 99;
let catCount = defaultCatCount;
const catCountMinimum = 1;
const catCountMaximum = 99;
let lastWinCatCount = catCount;

let winMessage;
let winningImageAngle;
const winningImageBackgroundCount = 3;
let winningImageAngles;
let winningImage;
const newspaperAnimationDuration = 40;
const difficultyAnimationDuration = 120;
let winScrenStarted = -newspaperAnimationDuration;

let tutorialPutCatsHereUnderstood = false;
const tutorialPutCatsHereFadeoutDuration = 100;
let tutorialPutCatsHereFadeoutStartFrame = 0;
let tutorialTakeAPhotoUnderstood = false;

const imageScale = 1;
let held = null;
let gameState = 'intro'; // known states: intro, play, win
let pGameState = gameState;
let zenMode = false;
let introCatchphrase;
let mouseVector;

const polaroidDiameter = 200;
const polaroidRadius = 100;
const polaroidRadiusSquared = 10000;
let polaroidPos;
const polaroidLoadingDuration = 120;
const polaroidLoadingAnimationIncrementPerFrame = 1 / polaroidLoadingDuration;
let polaroidLoadingAnimation = 0;
let polaroidLoadingJustCompleted = false;

let repeatingMousePressStarted;
const repeatingMousePressWaitDuration = 20;
const repeatingSpeed = 6;

const bigRayGrowthDuration = 60;
let bigRayGrowthStarted = -bigRayGrowthDuration * 2;

const smallRayAnimationDuration = 60;
let smallRayAnimationStarted = -smallRayAnimationDuration * 2;

let rayRotationTime = 0;
const rayCount = 12;

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

let soundIcon;
let musicIcon;
let mutedSounds = false;
let mutedMusic = true;
let musicPlay;
let musicWin;
let musicVolumeMax;

let soundPolaroidWin;
let soundPolaroidClick;
let soundMouseClick;

let configButtonsAnchor;
let configButtonsRange;
let configButtonsSize;

let fpsSum = 0;
let fpsAvg = 0;

let pLoadingConditionsMet = false;
let pCatsInsideTarget = false;

// noinspection JSUnusedGlobalSymbols
function preload() {
    loadAssets();
}

function loadAssets() {
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
    soundIcon = loadAsset("sound-icon-small.png");
    musicIcon = loadAsset("music-icon-small.png");
    fontComicSans = loadFont('assets\\comic_sans.ttf');

    soundFormats('mp3', 'ogg', 'wav');
    musicPlay = loadSound('assets\\sounds\\play_theme.mp3');
    musicWin = loadSound('assets\\sounds\\win_theme.mp3');
    musicWin.setVolume(0);
    musicPlay.setVolume(0);
    musicVolumeMax = 0.15;
    soundPolaroidClick = loadSound('assets\\sounds\\switch2.wav');
    soundPolaroidClick.setVolume(0.6);
    soundPolaroidWin = loadSound('assets\\sounds\\photo.ogg');
    soundPolaroidWin.setVolume(0.9);
    soundMouseClick = loadSound('assets\\sounds\\click4.wav');
    // soundMouseClick has volume 1, needs to be heard
}

function loadAsset(localPath, successCallback) {
    if (successCallback === null) {
        return loadImage("assets\\images\\" + localPath);
    }
    return loadImage("assets\\images\\" + localPath, successCallback);
}

// noinspection JSUnusedGlobalSymbols
function setup() {
    const idealWidth = 1366;
    const idealHeight = 768;
    let scale = min(clamp(norm(windowWidth, 0, idealWidth), 0, 1), clamp(norm(windowHeight, 0, idealHeight), 0, 1));
    scale = max(scale, 0.75);
    mainCanvas = createCanvas(idealWidth * scale, idealHeight * scale);
    noSmooth();
    frameRate(60);
    colorMode(HSB, 1, 1, 1, 1);
    imageMode(CORNER);
    introCatchphrase = generateIntroCatchphrase();
    cg = createGraphics(width, height, WEBGL);
    cg.colorMode(HSB, 1, 1, 1, 1);
    cg.noSmooth();
    cg.imageMode(CENTER);
    pg = createGraphics(width, height);
    pg.strokeCap(ROUND);
    pg.colorMode(HSB, 1, 1, 1, 1);
    pg.textFont(fontComicSans);
    pg.background(0);
    pg.imageMode(CENTER);
    pg.rectMode(CENTER);
    pg.noSmooth();
    mouseVector = createVector();
    polaroidPos = createVector(width - width * 0.15, height * 0.5);
    targetRectPos = createVector(width * 0.3, height * 0.5);
    targetRectSize = createVector(width * 0.4, height * 0.4);

    configButtonsAnchor = createVector(width * 0.075, height * 0.5);
    configButtonsRange = createVector(0, height * 0.125);
    configButtonsSize = width * 0.055;
}

// noinspection JSUnusedGlobalSymbols
function draw() {
    mainCanvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
    mouseVector.x = mouseX;
    mouseVector.y = mouseY;
    pg.background(grayscaleBackground);
    pg.push();
    updateCursor();
    updateTutorial();
    if (onIntroScreen()) {
        drawIntro();
        updateDrawPlayButton(labelPlayButton);
    }
    if ((onPlayScreen() && !zenMode) || onWinScreen()) {
        updatePolaroidButton();
        drawPolaroidButton();
    }
    if (onPlayScreen()) {
        if (!zenMode) {
            drawTarget();
            drawTutorial();
        }
        updateDrawCats();
        pg.image(cg, width * 0.5, height * 0.5, width, height);
    }
    if (onIntroScreen() || onWinScreen()) {
        updateDrawMuteButtons();
        updateDrawZenToggle();
        updateDrawCatCountSettings();
    }
    if (onWinScreen()) {
        drawWinningImage();
        updateDrawPlayButton(labelAgainButton);
        drawWinMessage();
        drawDownloadButton();
    }
    matchMusicToScreen();
    displayFPS();
    pg.pop();
    image(pg, 0, 0, width, height);
    pmouseIsPressed = mouseIsPressed;
}

function updateDrawCats() {
    cg.clear();
    cg.push();
    cg.translate(-width * 0.5, -height * 0.5);
    updateCatCountInsideTarget();
    sortCatsByY();
    updateDrawFreeCats();
    drawCursor();
    updateDrawHeldCat();
    cg.pop();
}

// noinspection JSUnusedGlobalSymbols
function displayFPS() {
    fpsSum += frameRate();
    if (frameCount % 60 === 0) {
        fpsAvg = fpsSum / 60;
        fpsSum = 0;
    }
    pg.push();
    pg.textAlign(LEFT, CENTER);
    pg.textSize(40);
    pg.fill(grayscaleInteractiveHover);
    pg.noStroke();
    pg.text('fps ' + floor(fpsAvg), 20, 40);
    pg.pop();
}

// noinspection JSUnusedGlobalSymbols
function mousePressed() {
    if (!zenMode && onPlayScreen() && polaroidLoadingAnimation >= 1 && mouseIsInsidePolaroid) {
        winGame();
    }
    pmouseIsPressed = false;
    mouseIsPressed = true;
    playSound(soundMouseClick);
}

// noinspection JSUnusedGlobalSymbols
function mouseReleased() {
    mouseIsPressed = false;
    drop();
}

// noinspection JSUnusedGlobalSymbols
function keyPressed() {
    if (keyCode === ESCAPE) {
        if (onPlayScreen() || onWinScreen()) {
            generateIntroCatchphrase();
            gameState = 'intro';
        }
    }
}

function generateIntroCatchphrase() {
    return introCatchphrase = random([
        'for your pleasure',
        'you can do it',
        'everyone loves cats',
        'just like real life',
        'cuteness overload',
        'share this with your mom',
        'no thoughts, head empty',
        'free range cats',
        'look at them go',
        'how many can you catch?',
        'get your warm fuzzies here'
    ]);
}

function drawIntro() {
    drawIntroTitleWithCat();
    drawIntroCatchphrase();
    drawIntroCredits();
}

function drawIntroTitleWithCat() {
    pg.push();
    pg.translate(width * 0.5, height * 0.45);
    pg.image(title, 0, 0);
    pg.translate(width * 0.035, -height * 0.1);
    pg.scale(2);
    pg.image(catTitle[animateOscillation()], 0, 0);
    pg.pop();
}

function drawIntroCatchphrase() {
    pg.push();
    pg.translate(width * 0.75, height * 0.25);
    pg.fill(grayscaleInteractive);
    pg.noStroke();
    pg.rotate(PI * 0.15);
    pg.textAlign(CENTER, CENTER);
    pg.textSize(26);
    pg.text(introCatchphrase, 0, 0);
    pg.pop();
}

function drawIntroCredits() {
    drawTextLink(width * 0.75, height * 0.795,
        'a game by ', 'Krab', 'https://www.instagram.com/krabcode/');
    drawTextLink(width * 0.75, height * 0.88,
        'with art by ', '235', 'https://www.instagram.com/ahojte235/');
}

function drawTextLink(x, y, prefixText, brightText, linkUrl) {
    pg.push();
    pg.textAlign(LEFT, TOP);
    pg.textSize(35);
    const isOverLink = isPointInRectangle(mouseX, mouseY, x, y, pg.textWidth(prefixText) + pg.textWidth(brightText), 45);
    pg.fill(isOverLink ? grayscaleBright : grayscaleInteractive);
    pg.text(prefixText, x, y);
    if (isOverLink) {
        cursor('pointer');
        pg.push();
        pg.rectMode(CENTER);
        pg.textSize(14);
        pg.fill(grayscaleWhite);
        pg.text(linkUrl, x, y + 45);
        pg.pop();
        if (mouseIsPressed && !pmouseIsPressed) {
            open(linkUrl);
        }
    } else {
        cursor('arrow');
    }
    pg.fill(isOverLink ? grayscaleWhite : grayscaleInteractive);
    pg.text(brightText, x + pg.textWidth(prefixText), y);
    pg.pop();
}

function updateDrawMuteButtons() {
    const x = configButtonsAnchor.x;
    const y0 = configButtonsAnchor.y - configButtonsRange.y;
    const w = configButtonsSize;

    if (updateDrawButton(x, y0, w, w, soundIcon, mutedSounds ? '         x' : '         o', 36)) {
        mutedSounds = !mutedSounds;
        if (!mutedSounds) {
            playSound(soundMouseClick);
        }
    }
    const y1 = configButtonsAnchor.y;
    if (updateDrawButton(x, y1, w, w, musicIcon, mutedMusic ? '         x' : '         o', 36)) {
        mutedMusic = !mutedMusic;
        if (mutedMusic) {
            musicPlay.pause();
            musicWin.pause();
            musicPlay.setVolume(0);
            musicWin.setVolume(0);
        }
        if (!mutedMusic) {
            musicPlay.setVolume(0);
            musicWin.setVolume(0);
            musicPlay.loop();
            musicWin.loop();
            if (onIntroScreen()) {
                musicPlay.fade(musicVolumeMax, 1);
            }
            if (onWinScreen()) {
                musicWin.fade(musicVolumeMax, 1);
            }
        }
    }
}

function matchMusicToScreen() {
    if (pGameState !== 'win' && onWinScreen()) {
        musicPlay.fade(0, 2);
        musicWin.fade(musicVolumeMax, 2);
    } else if (pGameState !== 'play' && onPlayScreen()) {
        musicPlay.fade(musicVolumeMax, 2);
        musicWin.fade(0, 2);
    }
    pGameState = gameState;
}

function onIntroScreen() {
    return gameState === 'intro';
}

function onPlayScreen() {
    return gameState === 'play';
}

function onWinScreen() {
    return gameState === 'win';
}

function updateDrawZenToggle() {
    const x = configButtonsAnchor.x;
    const y = configButtonsAnchor.y + configButtonsRange.y;
    const w = configButtonsSize;

    pg.push();
    pg.strokeWeight(4);
    pg.noFill();
    const isMouseOver = isPointInRectangle(mouseX, mouseY, x - w * 0.5, y - w * 0.5, w, w)
    if (isMouseOver) {
        if (mouseIsPressed && !pmouseIsPressed) {
            zenMode = !zenMode;
        }
    }
    if (zenMode) {
        pg.push();
        pg.stroke(grayscaleBright);
        pg.strokeWeight(3);
        pg.noFill();
        pg.translate(x, y);
        pg.rotate(radians(frameCount));
        for (let r = w; r >= 0; r -= 30) {
            pg.beginShape(TRIANGLE_STRIP);
            const detail = 50;
            for (let v = 0; v <= detail; v++) {
                const vNorm = norm(v, 0, detail);
                const theta = vNorm * TAU * 0.9;
                pg.stroke(lerp(grayscaleBackground, isMouseOver ? grayscaleBright : grayscaleInteractiveHover, vNorm));
                pg.vertex(0.5 * r * cos(theta), 0.5 * r * sin(theta));
                pg.vertex(0.475 * r * cos(theta), 0.475 * r * sin(theta));
            }
            pg.endShape();
        }
        pg.pop();
    } else {
        pg.stroke(isMouseOver ? grayscaleWhite : grayscaleInteractive);
        pg.fill(isMouseOver ? grayscaleInteractiveHover : grayscaleBackground);
        pg.circle(x, y, w);
    }
    pg.noStroke();
    pg.fill(isMouseOver ? grayscaleWhite : grayscaleBright);
    pg.textSize(35);
    pg.textAlign(LEFT, CENTER);
    pg.translate(x + w * 0.75, y - w * 0.2);
    pg.text(zenMode ? 'zen: no goals' : "zen", 0, 0);
    pg.pop();
}

function updateDrawCatCountSettings() {
    const y = height * 0.78;
    const x = width * 0.5;
    const w = width * 0.05;
    const buttonDistance = width * 0.075;
    const catCountSub = updateDrawButton(x - buttonDistance, y, w, w * 0.5, null, '-', 40, true);
    const catCountAdd = updateDrawButton(x + buttonDistance, y, w, w * 0.5, null, '+', 40, true);
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
    pg.textAlign(CENTER, CENTER);
    pg.textSize(30);

    let count = catCount;
    if (onWinScreen() && frameCount < winScrenStarted + newspaperAnimationDuration) {
        count = lastWinCatCount; // display win count for a brief moment to give the +1 change more impact
    }
    const catCountLabel = count + " cat" + (count > 1 ? 's' : '');
    pg.translate(x, y - height * 0.01);
    pg.text(catCountLabel, 0, 0);
    drawAutomaticDifficultyIncrementAnimation(buttonDistance);
    const difficultyIndicator = labelByDifficulty();
    pg.fill(grayscaleInteractiveHover);
    pg.textAlign(CENTER, CENTER);
    pg.textSize(30);
    pg.translate(0, -height * 0.06);
    pg.text(difficultyIndicator, 0, 0);
    pg.pop();
}

function updateDrawPlayButton(label) {
    const clicked = updateDrawButton(width * 0.5, height * 0.9, width * 0.22, height * 0.13, label[animateOscillation()], undefined, undefined, false);
    if (clicked) {
        restartGame();
    }
}

function updateDrawButton(x, y, w, h, labelImage, labelText, textScale, repeating) {
    let clicked = false;
    pg.push();
    pg.noStroke();
    pg.fill(grayscaleInteractive);
    const hover = isPointInRectangle(mouseX, mouseY, x - w * 0.5, y - h * 0.5, w, h);
    if (hover) {
        pg.fill(grayscaleInteractiveHover);
        cursor('pointer');
    }
    const shouldRepeat = repeating && frameCount > repeatingMousePressStarted + repeatingMousePressWaitDuration;
    if (hover && mouseIsPressed && (shouldRepeat || !pmouseIsPressed)) {
        clicked = true;
        const skipThisRepeat = pmouseIsPressed && shouldRepeat && frameCount % repeatingSpeed !== 0;
        if (skipThisRepeat) {
            clicked = false;
        }
        if (repeating != null && !pmouseIsPressed) {
            repeatingMousePressStarted = frameCount;
        }
    }
    pg.translate(x, y);
    if (hover) {
        pg.stroke(grayscaleWhite);
        pg.strokeWeight(3);
    } else {
        pg.tint(grayscaleBright);
    }
    pg.rect(0, 0, w, h, rectRoundedness);
    if (textScale === null) {
        pg.textSize(50);
    } else {
        pg.textSize(textScale);
    }
    if (labelImage !== null) {
        pg.scale(1.5);
        pg.image(labelImage, 0, 0);
    }
    if (labelText !== null) {
        pg.noStroke();
        pg.fill(hover ? grayscaleWhite : grayscaleBright);
        pg.textAlign(CENTER, CENTER);
        pg.textStyle(BOLD);
        pg.text(labelText, 0, -10);
    }
    pg.pop();
    return clicked;
}

function drawWinMessage() {
    pg.push();
    pg.fill(grayscaleWhite);
    pg.translate(width * 0.5, height * 0.1);
    pg.textAlign(CENTER, CENTER);
    pg.textStyle(BOLD);
    pg.textSize(40);
    pg.text(winMessage, 0, 0)
    pg.pop();
}

function drawDownloadButton() {
    if (updateDrawButton(polaroidPos.x, height * 0.9, height * 0.13, height * 0.13, null, 'jpg', 30)) {
        save('Cat_Catcher_' + lastWinCatCount + '_Cat' + (lastWinCatCount > 1 ? 's' : '') + '.jpg');
    }
}

function drawWinningImage() {
    pg.push();
    pg.translate(width * 0.5, height * 0.45);
    const newspaperAnimation = animate(winScrenStarted, newspaperAnimationDuration);
    pg.imageMode(CENTER);
    pg.rectMode(CENTER);
    pg.strokeWeight(5);
    if (newspaperAnimation >= 1) {
        for (let i = 0; i < winningImageBackgroundCount; i++) {
            pg.push();
            pg.rotate(winningImageAngles[i]);
            pg.stroke(grayscaleInteractiveHover);
            pg.fill(grayscaleInteractive);
            pg.rect(0, 0, winningImage.width, winningImage.height);
            pg.pop();
        }
    }
    pg.scale(pow(newspaperAnimation, 2.5));
    pg.rotate(newspaperAnimation * TAU * 2 + winningImageAngle);
    pg.image(winningImage, 0, 0);
    pg.stroke(grayscaleWhite);
    pg.noFill();
    pg.rect(0, 0, winningImage.width, winningImage.height);
    pg.pop();
}

function drawAutomaticDifficultyIncrementAnimation(buttonDistance) {
    if (gameState !== 'win') {
        return;
    }
    const difficultyAnimationStarted = winScrenStarted + newspaperAnimationDuration;
    const difficultyAnimation = animate(difficultyAnimationStarted, difficultyAnimationDuration);
    if (difficultyAnimation <= 0) {
        return;
    }
    const alpha = 1 - difficultyAnimation;
    pg.push();
    pg.noStroke();
    pg.fill(grayscaleWhite, alpha);
    pg.textSize(200);
    pg.textAlign(CENTER, CENTER);
    pg.text('+', buttonDistance, -height * 0.075 - difficultyAnimation * height * 0.075);
    pg.pop();
}

function labelByDifficulty() {
    if (zenMode) {
        return '';
    }
    if (catCount < 5) {
        return 'very easy';
    } else if (catCount < 15) {
        return 'easy';
    } else if (catCount < 25) {
        return 'challenging';
    } else if (catCount < 35) {
        return 'nightmare';
    } else if (catCount < 45) {
        return 'crazy cat lady';
    } else if (catCount < 55) {
        return 'cat shelter';
    } else if (catCount < 65) {
        return 'catastrophy';
    } else {
        return 'impossible';
    }
}

function drawTutorial() {
    pg.push();
    if (!tutorialPutCatsHereUnderstood) {
        tutorialPutCatsHereFadeoutStartFrame = frameCount;
    }
    const tutorialPutCatsHereAlpha = 1. - animate(tutorialPutCatsHereFadeoutStartFrame, tutorialPutCatsHereFadeoutDuration);
    if (tutorialPutCatsHereAlpha > 0) {
        pg.tint(0.6, tutorialPutCatsHereAlpha);
        pg.image(labelTutorialPutCatsHere, targetRectPos.x, targetRectPos.y);
    }
    if (!tutorialTakeAPhotoUnderstood) {
        pg.tint(0.5);
        pg.image(labelTutorialTakeAPhoto, polaroidPos.x - polaroidDiameter * 0.5, polaroidPos.y + polaroidDiameter * 1.1);
        pg.image(labelTutorialBeQuick, polaroidPos.x - polaroidDiameter * 0.5, polaroidPos.y + polaroidDiameter * 1.25);
    }
    pg.pop();
}

function updateTutorial() {
    if (catCountInsideTargetJustFilled && !zenMode) {
        tutorialPutCatsHereUnderstood = true;
    }
    if (onWinScreen()) {
        tutorialTakeAPhotoUnderstood = true;
    }
}

function updateCatCountInsideTarget() {
    let result = 0;
    for (let i = 0; i < catCount; i++) {
        const cat = cats[i];
        if (isInsideTargetWorldWrapAware(cat.pos.x, cat.pos.y)) {
            result++;
        }
    }
    catCountInsideTargetJustFilled = result !== catCountInsideTarget && result === catCount;
    catCountInsideTarget = result;
    catCountInsideTargetNorm = clamp(norm(catCountInsideTarget, 0, catCount), 0, 1);
    catCountInsideTargetLerp = lerp(catCountInsideTargetLerp, catCountInsideTargetNorm, 0.25);
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
    return x > targetRectPos.x - targetRectSize.x * 0.5 &&
        x < targetRectPos.x + targetRectSize.x * 0.5 &&
        y > targetRectPos.y - targetRectSize.y * 0.5 &&
        y < targetRectPos.y + targetRectSize.y * 0.5;
}

function areAllCatsInsideTarget() {
    return catCountInsideTarget === catCount && onPlayScreen();
}

function drawTarget() {
    pg.push();
    pg.translate(targetRectPos.x, targetRectPos.y);
    pg.noStroke();
    pg.fill(grayscaleTarget);
    pg.rect(0, 0, targetRectSize.x, targetRectSize.y);
    pg.pop();
}

function updatePolaroidButton() {
    const allCatsInsideTarget = areAllCatsInsideTarget();
    const loadingConditionsMet = allCatsInsideTarget && mouseIsInsidePolaroid;
    if (!pLoadingConditionsMet && loadingConditionsMet) {
        playSound(soundPolaroidClick);
    }
    if (!pCatsInsideTarget && allCatsInsideTarget) {
        playSound(soundPolaroidClick);
    }
    pLoadingConditionsMet = loadingConditionsMet;
    pCatsInsideTarget = allCatsInsideTarget;
    const polaroidLoadingAnimationLastFrame = polaroidLoadingAnimation;
    if (loadingConditionsMet) {
        polaroidLoadingAnimation += polaroidLoadingAnimationIncrementPerFrame;
    } else {
        polaroidLoadingAnimation -= polaroidLoadingAnimationIncrementPerFrame * 2;
    }
    if (onWinScreen()) {
        polaroidLoadingAnimation = 1;
    }
    polaroidLoadingAnimation = clamp(polaroidLoadingAnimation, 0, 1);
    polaroidLoadingJustCompleted = polaroidLoadingAnimationLastFrame < 1 && polaroidLoadingAnimation >= 1;
    if (polaroidLoadingJustCompleted) {
        playSound(soundPolaroidClick);
    }
}

function drawPolaroidButton() {
    pg.push();
    pg.translate(polaroidPos.x, polaroidPos.y);
    pg.strokeCap(ROUND);
    pg.fill(grayscaleInteractive);
    pg.noStroke();
    pg.circle(0, 0, polaroidRadius * 2);
    pg.stroke(grayscaleWhite);
    pg.strokeWeight(2 + 8 * catCountInsideTargetLerp);
    if (catCountInsideTargetJustFilled) {
        smallRayAnimationStarted = frameCount;
    }
    if (catCountInsideTargetNorm >= 1) {
        drawPolaroidSmallRays();
    }
    if (catCountInsideTargetLerp >= 0.99) {
        pg.circle(0, 0, polaroidRadius * 2);
    } else if (catCountInsideTargetLerp > 0.001) {
        // calling arc from -HALF_PI to -HALF_PI+.0001 is counter-intuitively drawn as a full circle, so we need a silly if-statement workaround
        pg.arc(0, 0, polaroidRadius * 2, polaroidRadius * 2, -HALF_PI, -HALF_PI + TAU * catCountInsideTargetLerp);
    }
    if (polaroidLoadingJustCompleted) {
        bigRayGrowthStarted = frameCount;
    }
    if (polaroidLoadingAnimation > polaroidLoadingAnimationIncrementPerFrame) { // same silly if-statement workaround as before
        pg.fill(onPlayScreen() ? grayscaleWhite : grayscaleInteractive);
        pg.noStroke();
        pg.arc(0, 0, polaroidRadius * 2, polaroidRadius * 2, -HALF_PI, -HALF_PI + TAU * ease(polaroidLoadingAnimation, 2));
    }
    if (polaroidLoadingAnimation >= 1 || onWinScreen()) {
        drawPolaroidBigRays();
    }
    pg.translate(3, 5); // the polaroid picture is slightly off center so we need a minor correction
    pg.image(onPlayScreen() ? polaroidIdle : polaroidBlep, 0, 0);
    pg.pop();
}

function drawPolaroidSmallRays() {
    const growthAnimation = animateGrowth(smallRayAnimationStarted, smallRayAnimationDuration);
    rayRotationTime += growthAnimation * 0.005;
    pg.stroke(grayscaleWhite);
    pg.push();
    pg.strokeWeight(5);
    const extensionLength = polaroidDiameter * 0.15;
    const pointerRadius = polaroidDiameter * 0.65;
    const handleRadius = pointerRadius + extensionLength * growthAnimation;
    for (let i = 0; i < rayCount; i++) {
        const iNorm = norm(i, 0, rayCount);
        const theta = iNorm * TAU + rayRotationTime;
        const pointerX = pointerRadius * cos(theta);
        const pointerY = pointerRadius * sin(theta);
        pg.line(pointerX, pointerY, handleRadius * cos(theta), handleRadius * sin(theta));
        // let arrowheadRadius = pointerRadius + extensionLength * .35 * growthAnimation;
        // pg.line(pointerX, pointerY, arrowheadRadius * cos(theta+.05), arrowheadRadius * sin(theta+.05));
        // pg.line(pointerX, pointerY, arrowheadRadius * cos(theta-.05), arrowheadRadius * sin(theta-.05));
    }
    pg.pop();
}

function drawPolaroidBigRays() {
    const growthAnimation = animateGrowth(bigRayGrowthStarted, bigRayGrowthDuration);
    rayRotationTime += growthAnimation * 0.01;
    const rayRadiusMiddle = polaroidDiameter * 0.75;
    const rayGrowthAnimationEased = ease(growthAnimation, 3);
    const rayLength = polaroidDiameter * 0.3 * rayGrowthAnimationEased;
    pg.stroke(grayscaleWhite);
    pg.strokeWeight(5);
    for (let i = 0; i < rayCount; i++) {
        const iNorm = norm(i, 0, rayCount);
        const theta = iNorm * TAU + TAU / (rayCount * 2.) + rayRotationTime;
        const rayInnerRadius = rayRadiusMiddle - rayLength * 0.5;
        const rayOuterRadius = rayRadiusMiddle + rayLength * 0.5;
        pg.line(rayInnerRadius * cos(theta), rayInnerRadius * sin(theta),
            rayOuterRadius * cos(theta), rayOuterRadius * sin(theta));
    }
}

function playSound(sound) {
    if (mutedSounds) {
        return;
    }
    sound.play();
}

function animateGrowth(start, duration) {
    const animation = animate(start, duration);
    return clamp(pow(animation, 0.25), 0, 1); // juicy numbers
}

function animate(start, duration) {
    return clamp(norm(frameCount, start, start + duration), 0, 1);
}

function updateCursor() {
    cursor(ARROW);
    if (onPlayScreen()) {
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
    cg.push();
    const w = sticksHeld.width * imageScale;
    const h = sticksHeld.height * imageScale;
    const x = mouseX + w * 0.37;
    const y = mouseY + h * -0.37;
    const cursorImage = (!mouseIsPressed && held === null) ? sticksIdle : sticksHeld;
    drawCursorWorldAware(cursorImage, x, y, w, h);
    cg.pop();
}

function drawCursorWorldAware(img, x, y, w, h) {
    cg.push();
    cg.image(img, x, y, w, h);
    cg.tint(1, 0.5);
    cg.image(img, x + width, y, w, h);
    cg.image(img, x, y + height, w, h);
    cg.image(img, x - width, y, w, h);
    cg.image(img, x, y - height, w, h);
    cg.pop();
}

function winGame() {
    playSound(soundPolaroidWin);
    winningImageAngle = nextWinningImageAngle();
    winningImageAngles = [];
    for (let i = 0; i < winningImageBackgroundCount; i++) {
        winningImageAngles.push(nextWinningImageAngle());
    }
    winningImage = pg.get(targetRectPos.x - targetRectSize.x * 0.5, targetRectPos.y - targetRectSize.y * 0.5, targetRectSize.x, targetRectSize.y);
    winScrenStarted = frameCount;
    lastWinCatCount = catCount;
    winMessage = generateNewWinMessage(catCount);
    catCount++;
    gameState = 'win';
}

function nextWinningImageAngle() {
    return random(-PI * 0.05, PI * 0.05);
}

function generateNewWinMessage(n) {
    let newWinMessage = 'You win!\n';
    if (n >= 25) {
        newWinMessage += random([
            'Impressive! You got all ' + n + ' cats.',
            'Amazing! You got all ' + n + ' cats.',
        ]);
    } else if (n > 1) {
        newWinMessage += random([
            'You caught ' + n + ' fidgety cats on camera!',
            'You took a photo of ' + n + ' mischievous cats!',
            'You photographed ' + n + ' restless cats!',
            'You managed to herd ' + n + ' rowdy kittens!',
        ]);
    } else if (n === 1) {
        newWinMessage += 'You took a photo of a lonely cat...';
    } else {
        newWinMessage += 'You broke the game.';
    }
    return newWinMessage;
}

function restartGame() {
    generateCats();
    gameState = 'play';
}

function drop() {
    if (held !== null) {
        held.startDropAnimation();
        held.repulsionLerped.x = 0;
        held.repulsionLerped.y = 0;
        // playSound(soundDropCat);
    }
    held = null;
}

function updateDrawHeldCat() {
    if (held === null) {
        return;
    }
    held.updateDraw();
}

function updateDrawFreeCats() {
    for (let i = 0; i < cats.length; i++) {
        const c = cats[i];
        if (!c.isHeld()) {
            c.updateDraw();
        }
    }
}

function generateCats() {
    const speeds = [];
    for (let i = 0; i < catCount; i++) {
        speeds.push(map(i, 0, catCount - 1, 0.25, 0.75));
    }
    cats = [];
    for (let i = 0; i < catCount; i++) {
        const speed = speeds[i];
        cats.push(new Cat(speed));
    }
}

function sortCatsByY() {
    cats.sort((a, b) => {
        if (a.pos.y < b.pos.y) {
            return -1;
        }
        if (a.pos.y > b.pos.y) {
            return 1;
        }
        return 0;
    });
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
    return p < 0.5 ? 0.5 * pow(2 * p, g) : 1 - 0.5 * pow(2 * (1 - p), g);
}

// used instead of dist for a performance boost
function distSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

function animateOscillation(offset) {
    if (offset === undefined) {
        return floor(frameCount / 22.5) % 2;
    }
    return floor(frameCount / 22.5 + offset) % 2;
}

function random(a, b) {
    if (b === null) {
        return Math.random() * a;
    }
    return min + Math.random() * (max - min);
}

// noinspection SpellCheckingInspection
class Cat {

    constructor(speed) {
        this.id = this.fastGuid();
        this.currentImg = null;
        this.dirStableMinimumFrames = 60;
        this.pos = createVector(random(width), random(height));
        this.stance = 0;
        this.stanceStableMinimumFrames = 120;
        this.stanceChangedFrame = -random(this.stanceStableMinimumFrames * 6);
        this.dirChangedFrame = -random(this.dirStableMinimumFrames * 6);
        this.direction = floor(random(4));
        this.size = 62 * imageScale;
        this.interactionDistSquared = (this.size * 0.5) * (this.size * 0.5);
        this.hue = (0.7 + random(0.4)) % 1;
        this.sat = random(0.15, 0.4);
        this.br = random(0.8, 1);
        this.timeOffset = random(10);
        this.speedMagnitude = speed;
        this.pInsideTarget = false;
        this.exitTargetAnimationDuration = 30;
        this.exitTargetAnimationStarted = -this.exitTargetAnimationDuration * 2;
        this.exitTargetAnimationPos = createVector();
        this.flipHorizontally = false;

        this.dropAnimationDuration = 30;
        this.dropAnimationStarted = -this.dropAnimationDuration * 2;
        this.dropAnimationPos = createVector();
        this.repulsionLerped = createVector();
    }

    updateDraw() {
        this.holdInteract();
        this.updateDrawDropAnimation();
        if (this.isHeld()) {
            this.resetStance();
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
        this.updateCurrentImage();
        this.draw();
    }

    startDropAnimation() {
        this.dropAnimationStarted = frameCount;
        this.dropAnimationPos.x = this.pos.x - this.size * 0.1;
        this.dropAnimationPos.y = this.pos.y + this.size * 0.1;
    }

    updateDrawDropAnimation() {
        // draw on the pg so that it's behind all of the cats that are on the cg
        const dropAnimation = animateGrowth(this.dropAnimationStarted, this.dropAnimationDuration);
        const alpha = 1 - dropAnimation;
        if (alpha > 0) {
            pg.push();
            pg.translate(this.dropAnimationPos.x, this.dropAnimationPos.y);
            pg.strokeWeight(2);
            pg.stroke(grayscaleInteractiveHover);
            const minRadius = 20;
            const maxRadius = 50;
            const r0 = lerp(minRadius, maxRadius, dropAnimation);
            const r1 = lerp(minRadius, maxRadius, pow(dropAnimation, 0.5));
            const rayCount = 16;
            for (let i = 0; i < rayCount; i++) {
                const theta = i * TAU / rayCount + QUARTER_PI;
                pg.line(r0 * cos(theta), r0 * sin(theta), r1 * cos(theta), r1 * sin(theta));
            }
            pg.pop();
        }
    }

    drawCatExitsTargetIndicator() {
        if (zenMode) {
            return;
        }
        const insideTarget = isInsideTarget(this.pos.x, this.pos.y);
        if (!insideTarget && this.pInsideTarget) {
            this.exitTargetAnimationStarted = frameCount;
            this.exitTargetAnimationPos.x = this.pos.x;
            this.exitTargetAnimationPos.y = this.pos.y;
        }
        this.pInsideTarget = insideTarget;
        const exitAnimation = animateGrowth(this.exitTargetAnimationStarted, this.exitTargetAnimationDuration);
        const alpha = 1 - exitAnimation;
        if (alpha > 0) {
            pg.push();
            pg.translate(this.exitTargetAnimationPos.x, this.exitTargetAnimationPos.y);
            pg.stroke(grayscaleWhite, alpha);
            pg.strokeWeight(3);
            pg.noFill();
            const diameter = 120 * exitAnimation;
            pg.ellipse(0, 0, diameter, diameter);
            pg.pop();
        }
    }

    updateCurrentImage() {
        const frame = animateOscillation(this.timeOffset);
        this.currentImg = this.currentImage(frame);
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

    resetStance() {
        this.stance = 1;
        this.stanceChangedFrame = frameCount;
        this.direction = 0;
    }

    updateStance() {
        const framesSinceStateLastChanged = frameCount - this.stanceChangedFrame;
        if (framesSinceStateLastChanged < this.stanceStableMinimumFrames) {
            return;
        }
        const rand = random(1);
        if (rand < 0.05) {
            // sit up or stand up
            this.stance--;
            this.stanceChangedFrame = frameCount;
        }
        if (rand > 0.97) {
            // sit down or start sleeping when sitting already
            this.stance++;
            this.stanceChangedFrame = frameCount;
        }
        this.stance = clamp(this.stance, 0, 2);
    }

    move() {
        const speed = createVector();
        if (this.isFacingRight()) {
            speed.x = 1;
        } else if (this.isFacingDown()) {
            speed.y = 1;
        } else if (this.isFacingLeft()) {
            speed.x = -1;
        } else if (this.isFacingUp()) {
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
        const framesSinceDirLastChanged = frameCount - this.dirChangedFrame;
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
        this.flipHorizontally = this.isFacingLeft() && !this.isHeld();
        cg.tint(this.hue, this.sat, this.br, 1);
        cg.translate(this.pos.x, this.pos.y);
        this.drawCatAtPos();
        this.drawCatWrapAround();
        cg.pop();
    }


    drawCatAtPos() {
        cg.push();
        this.flipIfNeeded();
        // cg.rotate(this.tilt);
        cg.image(this.currentImg, 0, 0);
        cg.pop();
    }

    drawCatAt(x, y) {
        cg.push();
        cg.translate(x, y);
        this.flipIfNeeded();
        // cg.rotate(this.tilt);
        cg.image(this.currentImg, 0, 0);
        cg.pop();
    }

    drawCatWrapAround() {
        cg.push();
        const leftBorder = this.pos.x < this.size / 2;
        const rightBorder = this.pos.x > width - this.size / 2;
        const topBorder = this.pos.y < this.size / 2;
        const bottomBorder = this.pos.y > height - this.size / 2;
        if (leftBorder) {
            this.drawCatAt(width, 0);
            if (topBorder) {
                this.drawCatAt(width, height);
            }
            if (bottomBorder) {
                this.drawCatAt(width, -height);
            }
        }
        if (rightBorder) {
            this.drawCatAt(-width, 0);
            if (topBorder) {
                this.drawCatAt(-width, height);
            }
            if (bottomBorder) {
                this.drawCatAt(-width, -height);
            }
        }
        if (topBorder) {
            this.drawCatAt(0, height);
        }
        if (bottomBorder) {
            this.drawCatAt(0, -height);
        }
        cg.pop();
    }

    currentImage(frame) {
        if (this.isHeld()) {
            return catHeld;
        }
        if (this.isInMovingStance()) {
            if (this.isFacingRight() || this.isFacingLeft()) {
                return catWalkRight[frame];
            } else if (this.isFacingDown()) {
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

    isFacingRight() {
        return this.direction === 0;
    }

    isFacingDown() {
        return this.direction === 1;
    }

    isFacingLeft() {
        return this.direction === 2;
    }

    isFacingUp() {
        return this.direction === 3;
    }

    setFacingRight() {
        this.direction = 0;
    }

    setFacingDown() {
        this.direction = 1;
    }

    setFacingLeft() {
        this.direction = 2;
    }

    setFacingUp() {
        this.direction = 3;
    }

    flipIfNeeded() {
        if (this.flipHorizontally) {
            cg.scale(-1, 1);
        } else {
            cg.scale(1, 1);
        }
    }

    isHeld() {
        if (held === null) {
            return false;
        }
        return held.id === this.id;
    }

    holdInteract() {
        let interactionWorldWrapTeleportX = 0;
        let interactionWorldWrapTeleportY = 0;
        if (held === null && mouseIsPressed) {
            let isOverCatButAcrossTheScreen = false;
            const isDirectlyOverCat = this.isOffsetMouseOverCat(0, 0);
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
                // playSound(soundPickUpCat);
            }
        }
        if (held !== null && held.id === this.id) {
            this.pos.x += interactionWorldWrapTeleportX;
            this.pos.y += interactionWorldWrapTeleportY;
            this.pos.x = mouseX;
            this.pos.y = mouseY;
        }
    }

    isOffsetMouseOverCat(x, y) {
        return distSquared(mouseX + x, mouseY + y, this.pos.x, this.pos.y) < this.interactionDistSquared;
    }

    checkCollisions() {
        const repulsion = createVector();
        for (let i = 0; i < cats.length; i++) {
            const otherCat = cats[i];
            if (otherCat.id === this.id) {
                continue;
            }
            if (!isPointInRectangle(otherCat.pos.x, otherCat.pos.y, this.pos.x - this.size, this.pos.y - this.size, this.size * 2, this.size * 2)) {
                continue;
            }
            const distanceToOther = distSquared(this.pos.x, this.pos.y, otherCat.pos.x, otherCat.pos.y);
            if (distanceToOther < this.interactionDistSquared * 2) {
                if (this.isInSittingStance()) {
                    this.stance--;
                }
                repulsion.add(this.addRepulsion(otherCat.pos, distanceToOther, this.interactionDistSquared * 2, 0.5));
            }
        }
        if (frameCount > this.dropAnimationStarted + this.dropAnimationDuration * 5) {
            const mouseRepulsion = this.worldAwareMouseRepulsion();
            repulsion.add(mouseRepulsion);
        }
        this.repulsionLerped.x = lerp(this.repulsionLerped.x, repulsion.x, 0.05);
        this.repulsionLerped.y = lerp(this.repulsionLerped.y, repulsion.y, 0.05);
        this.repulsionLerped.limit(10);
        if (this.repulsionLerped.mag() > 0.5) {
            const heading = this.repulsionLerped.heading();
            if (heading < -PI * 0.75 || heading > PI * 0.75) {
                this.setFacingLeft();
            } else if (abs(heading) < PI * 0.25) {
                this.setFacingRight();
            } else if (heading > PI * 0.25 && heading < PI * 0.75) {
                this.setFacingDown();
            } else {
                this.setFacingUp();
            }
        }
        this.pos.add(this.repulsionLerped);
    }

    worldAwareMouseRepulsion() {
        const mouseRepulsion = createVector();
        mouseRepulsion.add(this.repulseVectorFrom(mouseX, mouseY));
        if (mouseRepulsion.x + mouseRepulsion.y <= 0.1) {
            mouseRepulsion.add(this.repulseVectorFrom(mouseX + width, mouseY));
        }
        if (mouseRepulsion.x + mouseRepulsion.y <= 0.1) {
            mouseRepulsion.add(this.repulseVectorFrom(mouseX - width, mouseY));
        }
        if (mouseRepulsion.x + mouseRepulsion.y <= 0.1) {
            mouseRepulsion.add(this.repulseVectorFrom(mouseX, mouseY + height));
        }
        if (mouseRepulsion.x + mouseRepulsion.y <= 0.1) {
            mouseRepulsion.add(this.repulseVectorFrom(mouseX, mouseY - height));
        }
        return mouseRepulsion;
    }

    repulseVectorFrom(x, y) {
        const repulseVector = createVector();
        const distanceToMouse = distSquared(this.pos.x, this.pos.y, x, y);
        if (distanceToMouse < this.interactionDistSquared * 6) {
            if (this.isInSittingStance()) {
                this.stance--;
            }
            repulseVector.add(this.addRepulsion(createVector(x, y), distanceToMouse, this.interactionDistSquared * 15, 0.5));
        }
        return repulseVector;
    }

    addRepulsion(from, dist, maxDist, amp) {
        const fromOtherToThis = p5.Vector.sub(this.pos, from);
        let repulsion = (1 / norm(dist, 0, maxDist)) * amp;
        repulsion = min(repulsion, 5);
        return fromOtherToThis.normalize().mult(repulsion);
    }

    // https://stackoverflow.com/a/13403498
    fastGuid() {
        return Math.random().toString(36)
            .slice(2, 15) +
            Math.random().toString(36)
                .slice(2, 15);
    }
}
