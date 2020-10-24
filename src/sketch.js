let mainCanvas;
let pg;

let t = 0;
let pmouseIsPressed = false;
let mouseIsInsidePolaroid = false;

let cats;
let catCount = 16;
let imageScale = 1;
let held = null;
let fadeSticks = false;
let gameState = 'intro'; // known states: intro, play, win
let winningPolaroidImage;

let sticksFadeoutDelay = 60;
let sticksFadeoutDuration = 60;
let sticksLastReleasedFrame = -sticksFadeoutDuration * 3;

let polaroidHitRadius = 200;
let polaroidPos;
let polaroidLoadingDuration = 120;
let polaroidLoadingAnimationIncrementPerFrame = 1 / polaroidLoadingDuration;
let polaroidLoadingAnimation = 0;
let polaroidLoadingJustCompleted = false;

let rayGrowthDuration = 60;
let rayGrowthStarted = -rayGrowthDuration * 2;
let rayRotationTime = 0;

let targetRectPos;
let targetRectSize;

let catCountInsideTarget = 0;
let catCountInsideTargetNorm = 0;
let catCountInsideTargetLerp = 0;

let catHeld;
let sticksIdle;
let sticksHeld;
let catWalkDown;
let catWalkRight;
let catWalkUp;

let polaroid;
let polaroidIdle;
let polaroidBlep;

let title;
let catTitle;
let catSit;
let catSleep;

let grayscaleBackground = 0.15;
let grayscaleInteractive = 0.35;
let grayscaleWhite = 1;

// noinspection JSUnusedGlobalSymbols
function preload() {
    sticksHeld = loadImage("assets\\chopsticks-hold.png");
    sticksIdle = loadImage("assets\\chopsticks-idle.png");
    catHeld = loadImage("assets\\kitten-held.png");
    catWalkDown = [loadImage("assets\\kitten-down-1.png"), loadImage("assets\\kitten-down-2.png")];
    catWalkRight = [loadImage("assets\\kitten-side-1.png"), loadImage("assets\\kitten-side-2.png")];
    catWalkUp = [loadImage("assets\\kitten-up-1.png"), loadImage("assets\\kitten-up-2.png")];
    polaroid = loadImage("assets\\polaroid.png", loadPolaroidImages);

    title = loadImage("assets\\_title_white.png");
    catTitle = [loadImage("assets\\kitten-lie-1.png"), loadImage("assets\\kitten-lie-2.png")];
    catSit = [loadImage("assets\\kitten-sit-1.png"), loadImage("assets\\kitten-sit-2.png")];
    catSleep = [loadImage("assets\\kitten-sleep-1.png"), loadImage("assets\\kitten-sleep-2.png")];
    // loadImage("assets\\kitten-sit-hat.png");

    // good sounds:
    /*
    *  https://freesound.org/people/Christyboy100/sounds/495694/
    * */
}

function loadPolaroidImages() {
    polaroidBlep = polaroid.get(0, 0, 89, 84);
    polaroidIdle = polaroid.get(90, 0, 89, 84);
}

// noinspection JSUnusedGlobalSymbols
function setup() {
    mainCanvas = createCanvas(1366, 768, P2D);
    frameRate(60);
    noSmooth();
    colorMode(HSB, 1, 1, 1, 1);
    imageMode(CORNER);
    pg = createGraphics(width, height, P2D);
    pg.colorMode(HSB, 1, 1, 1, 1);
    pg.noSmooth();
    pg.background(0);
    pg.imageMode(CENTER);
    pg.rectMode(CENTER);
    polaroidPos = createVector(width - 200, height * .5);
    targetRectPos = createVector(width * .3, height * .5);
    targetRectSize = createVector(1366 * .4, 768 * .4);
}

// noinspection JSUnusedGlobalSymbols
function draw() {
    mainCanvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
    t = radians(frameCount);
    pg.background(grayscaleBackground);
    updateCursor();
    if (gameState === 'intro') {
        drawIntro();
        updateDrawIntroPlayButton();
    }
    if (gameState === 'play' || gameState === 'win') {
        updatePolaroidButton();
        drawPolaroidButton();
    }
    if (gameState === 'play') {
        updateHoldState();
        updateCatCountInsideTarget();
        drawTarget();
        updateDrawWalkingCats();

        drawCursor();
        updateDrawHeldCat();
    }
    if (gameState === 'win') {
        drawWinningPolaroidImage();
        updateDrawPlayAgainButton();
        drawCongratsMessage();
    }
    image(pg, 0, 0);
    pmouseIsPressed = mouseIsPressed;
}

function drawIntro() {
    let catFrame = sin(t * 8) > 0 ? 0 : 1;
    pg.push();
    pg.translate(width * .5, height * .35);
    /*
    pg.noStroke();
    pg.fill(grayscaleInteractive);
    pg.rect(0, 0, title.width*1.5, title.height*1.5);*/
    pg.image(title, 0, 0);
    pg.translate(width * .035, -height * .1);
    pg.scale(2);
    pg.image(catTitle[catFrame], 0, 0);
    pg.pop();
}

function updateDrawIntroPlayButton() {
    let clicked = updateDrawButton(width * .5, height * .75, 300, 100, 'play');
    if (clicked) {
        restartGame();
    }
}

function updateDrawPlayAgainButton() {
    let clicked = updateDrawButton(width * .5, height * .9, 300, 100, 'play again');
    if (clicked) {
        restartGame();
    }
}

function updateDrawButton(x, y, w, h, label) {
    let clicked = false;
    pg.push();
    pg.noStroke();
    pg.fill(grayscaleInteractive);
    let hover = pointRect(mouseX, mouseY, x - w * .5, y - h * .5, w, h);
    if (hover) {
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
    pg.rect(0, 0, w, h);
    pg.noStroke();
    pg.fill(grayscaleWhite);
    pg.textAlign(CENTER, CENTER);
    pg.textStyle(BOLD);
    pg.textSize(50);
    pg.text(label, 0, 0);
    pg.pop();
    return clicked;
}

function drawCongratsMessage() {
    pg.push();
    let message = 'You win! You took a photo of all ' + catCount + ' cats!'
    pg.fill(grayscaleWhite);
    pg.translate(width * .5, height * .1);
    pg.textAlign(CENTER, CENTER);
    pg.textStyle(BOLD);
    pg.textSize(50);
    pg.text(message, 0, 0)
    pg.pop();
}

function drawWinningPolaroidImage() {
    pg.push();
    pg.translate(targetRectPos.x, targetRectPos.y);
    pg.rotate(PI * .025);
    pg.imageMode(CENTER);
    pg.rectMode(CENTER);
    pg.noFill();
    pg.stroke(grayscaleWhite);
    pg.strokeWeight(5);
    pg.rect(0, 0, winningPolaroidImage.width, winningPolaroidImage.height);
    pg.image(winningPolaroidImage, 0, 0);
    pg.pop();
}

function updateCatCountInsideTarget() {
    let result = 0;
    for (let i = 0; i < catCount; i++) {
        let cat = cats[i];
        if (isInsideTargetWorldWrapAware(cat.pos.x, cat.pos.y)) {
            result++;
        }
    }
    catCountInsideTarget = result;
    catCountInsideTargetNorm = clamp(norm(catCountInsideTarget, 0, catCount), 0, 1);
    catCountInsideTargetLerp = lerp(catCountInsideTargetLerp, catCountInsideTargetNorm, .25);
}

function isInsideTargetWorldWrapAware(x, y) {
    return isInsideTarget(x, y) ||
        isInsideTarget(x + width, y) ||
        isInsideTarget(x - width, y) ||
        isInsideTarget(x, y + height) ||
        isInsideTarget(x, y - height);
}

function isInsideTarget(x, y) {
    return x > targetRectPos.x - targetRectSize.x * .5 && x < targetRectPos.x + targetRectSize.x * .5 &&
        y > targetRectPos.y - targetRectSize.y * .5 && y < targetRectPos.y + targetRectSize.y * .5;
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
    pg.fill(grayscaleInteractive);
    pg.noStroke();
    pg.ellipse(0, 0, polaroidHitRadius, polaroidHitRadius);
    pg.stroke(grayscaleWhite);
    pg.strokeWeight(2 + 8 * catCountInsideTargetLerp);
    if (catCountInsideTargetNorm >= 1) {
        pg.ellipse(0, 0, polaroidHitRadius, polaroidHitRadius);
    } else if (catCountInsideTargetLerp > 0.001) {
        // calling arc from -HALF_PI to -HALF_PI+.0001 is counter-intuitively drawn as a full circle, so we need a silly if-statement workaround
        pg.arc(0, 0, polaroidHitRadius, polaroidHitRadius, -HALF_PI, -HALF_PI + TAU * catCountInsideTargetLerp);
    }
    pg.fill(grayscaleWhite);
    pg.noStroke();
    if (polaroidLoadingAnimation > polaroidLoadingAnimationIncrementPerFrame) {
        // same silly if-statement workaround as before
        pg.arc(0, 0, polaroidHitRadius, polaroidHitRadius, -HALF_PI, -HALF_PI + TAU * ease(polaroidLoadingAnimation, 2));
    }
    if (polaroidLoadingAnimation >= 1 || gameState === 'win') {
        if (polaroidLoadingJustCompleted) {
            rayGrowthStarted = frameCount;
        }
        let rayGrowthAnimation = clamp(norm(frameCount, rayGrowthStarted, rayGrowthStarted + rayGrowthDuration), 0, 1)
        rayGrowthAnimation = pow(rayGrowthAnimation, .25);
        rayGrowthAnimation = clamp(rayGrowthAnimation, 0, 1);
        rayRotationTime += ease(rayGrowthAnimation, 1) * .02;
        let rayCount = 20;
        let rayRadiusMiddle = polaroidHitRadius * .75;
        let rayLengthBig = polaroidHitRadius * 0.3 * ease(rayGrowthAnimation, 3);
        let rayLengthSmall = polaroidHitRadius * 0.15 * ease(rayGrowthAnimation, 2);
        pg.stroke(grayscaleWhite);
        pg.strokeWeight(5);
        for (let i = 0; i < rayCount; i++) {
            let iNorm = norm(i, 0, rayCount);
            let theta = rayRotationTime + iNorm * TAU;
            let rayLength = i % 2 === 0 ? rayLengthSmall : rayLengthBig;
            let rayInnerRadius = rayRadiusMiddle - rayLength * .5;
            let rayOuterRadius = rayRadiusMiddle + rayLength * .5;
            pg.line(rayInnerRadius * cos(theta), rayInnerRadius * sin(theta),
                rayOuterRadius * cos(theta), rayOuterRadius * sin(theta));
        }
    }
    pg.translate(3, 5); // the polaroid picture is slightly off center so we need a minor correction
    if (gameState === 'play') {
        pg.image(polaroidIdle, 0, 0);
    } else {
        pg.image(polaroidBlep, 0, 0);
    }
    pg.pop();
}

let useImageCursor;

function updateCursor() {
    cursor(ARROW);
    if (gameState === 'play') {
        mouseIsInsidePolaroid = dist(mouseX, mouseY, polaroidPos.x, polaroidPos.y) < polaroidHitRadius * .5;
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

function winGame() {
    winningPolaroidImage = pg.get(targetRectPos.x - targetRectSize.x * .5, targetRectPos.y - targetRectSize.y * .5, targetRectSize.x, targetRectSize.y);
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

function generateCats() {
    cats = [];
    for (let i = 0; i < catCount; i++) {
        cats.push(new Cat());
    }
}

function updateDrawWalkingCats() {
    for (let i = 0; i < cats.length; i++) {
        let c = cats[i];
        c.updateDraw();
    }
}

function clamp(val, low, high) {
    return constrain(val, low, high);
}

// adapted from the amazing jeffrey thompson: http://www.jeffreythompson.org/collision-detection/point-rect.php
function pointRect(px, py, rx, ry, rw, rh) {
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

// noinspection SpellCheckingInspection
class Cat {

    constructor() {
        this.id = this.uuid();
        this.pos = createVector(random(width), random(height));
        this.stance = 0;
        this.stanceStableMinimumFrames = 360;
        this.stanceChangedFrame = -this.stanceStableMinimumFrames * 2;
        this.direction = floor(random(4));
        this.size = 62 * imageScale;
        this.interactionDist = this.size * .5;
        this.hue = (.7 + random(.4)) % 1;
        this.sat = random(.15, .4);
        this.br = random(.8, 1);
        this.timeOffset = random(TAU);
        this.speedMagnitude = random(.25, .75);
    }

    updateDraw() {
        this.mouseInteract();
        if (this.isHeld()) {
            this.stance = 0;
        } else {
            this.updateStance();
            if (this.isInMovingStance()) {
                this.updateDirection();
                this.move();
                this.checkCollisions();
            }
        }
        this.draw();
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
        if (random(1) > 0.01 && framesSinceStateLastChanged < this.stanceStableMinimumFrames) {
            return;
        }
        let rand = random(1);
        if (rand < 0.5) {
            // sit up or stand up
            this.stance--;
            this.stanceChangedFrame = frameCount;
        } else if (rand > .9) {
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
        if (random(1) < 0.01) {
            this.changeDirection();
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
        pg.push();
        let frame = sin(t * 8 + this.timeOffset) > 0 ? 0 : 1;
        let flipHorizontally = this.direction === 2 && !this.isHeld();
        let img = this.currentImage(frame);
        pg.tint(this.hue, this.sat, this.br);
        this.drawCatAtPos(img, flipHorizontally);
        this.drawCatWrapAround(img, flipHorizontally);
        pg.pop();
    }

    drawCatAtPos(img, flipHorizontally) {
        pg.push();
        pg.translate(this.pos.x, this.pos.y);
        this.flipIfNeeded(flipHorizontally);
        pg.image(img, 0, 0, this.size, this.size);
        pg.pop();
    }

    drawCatWrapAround(img, flipHorizontally) {
        pg.push();
        pg.translate(this.pos.x, this.pos.y);
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
        pg.pop();
    }

    drawCatWithOffset(img, flipHorizontally, x, y) {
        pg.push();
        pg.translate(x, y);
        this.flipIfNeeded(flipHorizontally);
        pg.image(img, 0, 0, this.size, this.size);
        pg.pop();
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
        console.info(this.stance);
        return catHeld;
    }

    flipIfNeeded(flipX) {
        if (flipX) {
            pg.scale(-1, 1);
        } else {
            pg.scale(1, 1);
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
        if (held == null) {
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
            let isOverCatWorldWrapAware = isDirectlyOverCat || isOverCatButAcrossTheScreen;
            if (held == null && mouseIsPressed && isOverCatWorldWrapAware) {
                held = this;
            }
        }
        if (held != null && held.id === this.id) {
            this.pos.x += interactionWorldWrapTeleportX;
            this.pos.y += interactionWorldWrapTeleportY;
            this.pos.x = lerp(this.pos.x, mouseX, .35);
            this.pos.y = lerp(this.pos.y, mouseY, .35);
        }
    }

    isOffsetMouseOverCat(x, y) {
        return dist(mouseX + x, mouseY + y, this.pos.x, this.pos.y) < this.interactionDist;
    }

    checkCollisions() {
        for (let i = 0; i < cats.length; i++) {
            let otherCat = cats[i];
            if (otherCat.id === this.id) {
                continue;
            }
            let distanceToOther = dist(this.pos.x, this.pos.y, otherCat.pos.x, otherCat.pos.y);
            if (distanceToOther < this.size) {
                let fromOtherToThis = p5.Vector.sub(this.pos, otherCat.pos);
                let repulsion = (1 / norm(distanceToOther, 0, this.size)) * .5;
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
