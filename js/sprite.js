export class Sprite {
    constructor(spriteSheet, x, y, width, height) {
        this.spriteSheet = spriteSheet;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

export const getSpritePattern = (sprite, repeatPattern = "repeat") => {
    var patternCanvas = document.createElement('canvas');

    patternCanvas.width = sprite.width;
    patternCanvas.height = sprite.height;

    var patternCanvasContext = patternCanvas.getContext('2d');

    patternCanvasContext.drawImage(sprite.spriteSheet, sprite.x, sprite.y, sprite.width, sprite.height, 0, 0, sprite.width, sprite.height);

    return patternCanvasContext.createPattern(patternCanvas, repeatPattern);
}