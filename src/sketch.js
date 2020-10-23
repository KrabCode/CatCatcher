
let mainCanvas;
let pg;

let t = 0;
let pmouseIsPressed = false;
let mouseIsInsidePolaroid = false;

let cats;
let catCount = 12;
let imageScale = 1;
let held = null;
let fadeSticks = false;
let gameState = 'play'; // known states: play, win
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

// noinspection JSUnusedGlobalSymbols
function preload() {
    sticksHeld = loadImage("assets\\chopsticks-hold.png");
    sticksIdle = loadImage("assets\\chopsticks-idle.png");
    catHeld =    loadImage("assets\\kitten-held.png");
    catWalkDown = [loadImage("assets\\kitten-down-1.png"), loadImage("assets\\kitten-down-2.png")];
    catWalkRight = [loadImage("assets\\kitten-side-1.png"), loadImage("assets\\kitten-side-2.png")];
    catWalkUp = [loadImage("assets\\kitten-up-1.png"), loadImage("assets\\kitten-up-2.png")];
    polaroid = loadImage("assets\\polaroid.png", loadPolaroidImages);

    // loadImage("assets\\_title.png");
    // loadImage("assets\\kitten-lie-1.png");
    // loadImage("assets\\kitten-lie-2.png");
    // loadImage("assets\\kitten-sit-1.png");
    // loadImage("assets\\kitten-sit-2.png");
    // loadImage("assets\\kitten-sit-hat.png");
    // loadImage("assets\\kitten-sleep-1.png");
    // loadImage("assets\\kitten-sleep-2.png");
}

function loadPolaroidImages() {
    polaroidIdle = polaroid.get(0,0,89,84);
    polaroidBlep = polaroid.get(90,0,89,84);
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
    polaroidPos = createVector(width - 200, height * .5);
    targetRectPos = createVector(width * .3, height * .5);
    targetRectSize = createVector(1366 * .4, 768 * .4);
    generateCats();
}

// noinspection JSUnusedGlobalSymbols
function draw() {
    mainCanvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
    t = radians(frameCount);
    drawBackground();
    updatePolaroidButton();
    drawPolaroidButton();
    if (gameState === 'play') {
        updateHoldState();
        updateCatCountInsideTarget();
        drawTarget();
        updateDrawWalkingCats();
        updateCursor();
        drawCursor();
        updateDrawHeldCat();
    }
    if (gameState === 'win') {
        drawWinningPolaroidImage();
    }
    image(pg, 0, 0);
    pmouseIsPressed = mouseIsPressed;
}

function drawBackground() {
    pg.push();
    pg.background(.15);
    pg.rectMode(CENTER);
    pg.noStroke();
}

function drawWinningPolaroidImage() {
    pg.push();
    pg.translate(targetRectPos.x, targetRectPos.y);
    pg.rotate(PI * .025);
    pg.imageMode(CENTER);
    pg.rectMode(CENTER);
    pg.noFill();
    pg.stroke(1);
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
    pg.fill(.35);
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
    pg.fill(0.35);
    pg.noStroke();
    pg.ellipse(0, 0, polaroidHitRadius, polaroidHitRadius);
    pg.stroke(1);
    pg.strokeWeight(2 + 8 * catCountInsideTargetLerp);
    if (catCountInsideTargetNorm >= 1) {
        pg.ellipse(0, 0, polaroidHitRadius, polaroidHitRadius);
    } else if (catCountInsideTargetLerp > 0.001) {
        // calling arc from -HALF_PI to -HALF_PI+.0001 is counter-intuitively drawn as a full circle, so we need a silly if-statement workaround
        pg.arc(0, 0, polaroidHitRadius, polaroidHitRadius, -HALF_PI, -HALF_PI + TAU * catCountInsideTargetLerp);
    }
    pg.fill(150);
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
        pg.stroke(1);
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

function updateCursor() {
    mouseIsInsidePolaroid = dist(mouseX, mouseY, polaroidPos.x, polaroidPos.y) < polaroidHitRadius * .5;
}

function drawCursor() {
    if (mouseIsInsidePolaroid && areAllCatsInsideTarget()) {
        if (polaroidLoadingAnimation > 0 && polaroidLoadingAnimation < 1) {
            cursor('progress');
        } else if (polaroidLoadingAnimation >= 1) {
            cursor('pointer');
        }
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
    } else if (gameState === 'win') {
        restartGame();
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

// from the easing function tutorial by Etienne Jacob here https://necessarydisorder.wordpress.com/
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
        this.direction = floor(random(4));
        this.size = 62 * imageScale;
        this.hue = (.7 + random(.4)) % 1;
        this.sat = random(.15, .4);
        this.br = random(.8, 1);
        this.timeOffset = random(TAU);
        this.speedMagnitude = random(.25, .75);
    }

    updateDraw() {
        this.mouseInteract();
        if (!this.thisHeld()) {
            this.updateDirection();
            this.move();
            this.checkCollisions();
        }
        this.draw();
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
        let flipHorizontally = this.direction === 2 && !this.thisHeld();
        let img = this.getImageByState(frame);
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
        if (this.pos.x < this.size / 2) {
            pg.translate(width, 0);
        }
        if (this.pos.x > width - this.size / 2) {
            pg.translate(-width, 0);
        }
        if (this.pos.y < this.size / 2) {
            pg.translate(0, height);
        }
        if (this.pos.y > height - this.size / 2) {
            pg.translate(0, -height);
        }
        this.flipIfNeeded(flipHorizontally);
        pg.image(img, 0, 0, this.size, this.size);
        pg.pop();
    }

    getImageByState(frame) {
        if (this.thisHeld()) {
            return catHeld;
        }
        if (this.direction === 0 || this.direction === 2) {
            return catWalkRight[frame];
        } else if (this.direction === 1) {
            return catWalkDown[frame];
        } else if (this.direction === 3) {
            return catWalkUp[frame];
        }
        return catHeld;
    }

    flipIfNeeded(flipX) {
        if (flipX) {
            pg.scale(-1, 1);
        } else {
            pg.scale(1, 1);
        }
    }

    thisHeld() {
        if (held === null) {
            return false;
        }
        return held.id === this.id;
    }

    mouseInteract() {
        let interactionDist = this.size * .5;
        let isOverCatButAcrossTheScreen = false;
        let interactionWorldWrapTeleportX = 0;
        let interactionWorldWrapTeleportY = 0;
        let isDirectlyOverCat = dist(mouseX, mouseY, this.pos.x, this.pos.y) < interactionDist;
        if (!isDirectlyOverCat) {
            if (dist(mouseX + width, mouseY, this.pos.x, this.pos.y) < interactionDist) {
                interactionWorldWrapTeleportX -= width;
                isOverCatButAcrossTheScreen = true;
            } else if (dist(mouseX - width, mouseY, this.pos.x, this.pos.y) < interactionDist) {
                interactionWorldWrapTeleportX += width;
                isOverCatButAcrossTheScreen = true;
            }
            if (dist(mouseX, mouseY + height, this.pos.x, this.pos.y) < interactionDist) {
                interactionWorldWrapTeleportY -= height;
                isOverCatButAcrossTheScreen = true;
            } else if (dist(mouseX, mouseY - height, this.pos.x, this.pos.y) < interactionDist) {
                interactionWorldWrapTeleportY += height;
                isOverCatButAcrossTheScreen = true;
            }
        }
        let isOverCatWorldWrapAware = isDirectlyOverCat || isOverCatButAcrossTheScreen;
        if (held === null && mouseIsPressed && isOverCatWorldWrapAware) {
            held = this;
        }
        if (held != null && held.id === this.id) {
            this.pos.x += interactionWorldWrapTeleportX;
            this.pos.y += interactionWorldWrapTeleportY;
            this.pos.x = lerp(this.pos.x, mouseX, .35);
            this.pos.y = lerp(this.pos.y, mouseY, .35);
        }
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