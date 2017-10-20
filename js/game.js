import { Character, CharacterState } from './character.js';
import { Sprite, getSpritePattern } from './sprite.js';
import Platform from './platform.js'

const GameState = {
    PLAYING: 0,
    GAME_OVER: 1
};

const debug = false;
const gravity = 0.2;

const platformVx = -3;
const platformWidth = 250;
const platformHeight = 20;

export default class Game {
    constructor(yBottom, canvas, characterSprites, miscSprites, worldSprites) {
        this._yBottom = yBottom;
        this._canvas = canvas;
        this._canvasContext = this._canvas.getContext("2d");
        this._canvasWidth = canvas.width;
        this._canvasHeight = canvas.height;
        this._characterSprites = characterSprites;
        this._miscSprites = miscSprites;
        this._worldSprites = worldSprites;

        this._initGame();
    }

    nextTick() {
        this._character.nextTick();
        this._platforms.forEach(platform => platform.nextTick());

        this._updatePlatforms();
        this._updateCharacter();
        this._updateGameState();

        this._draw();
    }

    handleKeyDown(keyCode) {
        switch (keyCode) {
            case 38: // Up
                this._character.requestJumpStart();
                break;
            default:
                break;
        }
    }

    handleKeyUp(keyCode) {
        switch (keyCode) {
            case 38: // Up
                this._character.requestJumpEnd();
                break;
            default:
                break;
        }
    }

    handleMouseDown() {
        switch (this._state) {
            case GameState.PLAYING:
                this._character.requestJumpStart();
                break;

            case GameState.GAME_OVER:
                this._initGame();
                break;

            default:
                break;
        }
    }

    handleMouseUp() {
        switch (this._state) {
            case GameState.PLAYING:
                this._character.requestJumpEnd();
                break;

            case GameState.GAME_OVER:
                this._initGame();
                break;

            default:
                break;
        }
    }

    _initGame() {
        this._state = GameState.PLAYING;
        this._score = 0;
        this._platforms = this._initPlatforms();
        this._character = this._initCharacter();
    }

    _initPlatforms() {
        return [
            new Platform(100, this._yBottom, platformVx, platformWidth, platformHeight),
            new Platform(100 + platformWidth + 100, this._yBottom, platformVx, platformWidth, platformHeight),
        ]
    }

    _initCharacter() {
        const character = new Character(this._characterSprites, 100);
        character.y = this._yBottom - character.height / 2;

        return character;
    }

    _updateGameState() {
        if ((this._character.y + this._character.height / 2) >= this._canvasHeight) {
            this._state = GameState.GAME_OVER;
        }
    }

    _updateCharacter() {
        const collidingPlatform = this._getCollidingPlatform();

        switch (this._character.state) {
            case CharacterState.STANDING:
                if (collidingPlatform) {
                    this._character.vy = 0;
                    this._character.y = collidingPlatform.y - this._character.height / 2;
                } else {
                    this._character.state = CharacterState.FALLING;
                    this._character.vy = gravity;
                }
                break;

            case CharacterState.JUMP_BOOSTING:
                break;

            case CharacterState.JUMP_FALLING:
            case CharacterState.FALLING:
                if (collidingPlatform) {
                    this._character.state = CharacterState.STANDING;
                    this._score++;
                    this._character.vy = 0;
                    this._character._ticksJumpBoosting = 0;
                    this._character.y = collidingPlatform.y - this._character.height / 2;
                } else {
                    this._character.vy += gravity;
                }

                break;

            default:
                break;
        }
    }

    _draw() {
        switch (this._state) {
            case GameState.PLAYING:
                this._drawBackground();
                this._drawPlatforms();
                this._drawCharacter();
                this._drawScoreboard();

                if (debug) {
                    this._drawDebuggingInfo();
                }

                break;

            case GameState.GAME_OVER:
                this._drawGameOverScreen();
                break;

            default:
                break;
        }
    }

    _drawBackground() {
        const backgroundSprite = new Sprite(this._miscSprites, 0, 0, 16, 25);
        const backgroundPattern = getSpritePattern(backgroundSprite);
        this._canvasContext.fillStyle = backgroundPattern;
        this._canvasContext.fillRect(0, 0, this._canvasWidth, this._canvasHeight);
    }

    _drawPlatforms() {
        const columnSprite = new Sprite(this._worldSprites, 18, 154, 96, 72);
        const platformSprite = new Sprite(this._worldSprites, 2, 138, 128, 16);
        const columnPattern = getSpritePattern(columnSprite);

        this._platforms.forEach((platform) => {
            this._canvasContext.fillStyle = columnPattern;
            this._canvasContext.fillRect(
                platform.x + platform.width * 0.25 / 2,
                platform.y + platform.height - 1,
                platform.width * 0.75,
                this._canvasHeight - platform.y,
            );
            this._canvasContext.drawImage(
                platformSprite.spriteSheet,
                platformSprite.x,
                platformSprite.y,
                platformSprite.width,
                platformSprite.height,
                platform.x,
                platform.y,
                platform.width,
                platform.height,
            );
        });
    }

    _drawCharacter() {
        const sprite = this._character.currentAnimationSprite;

        this._canvasContext.drawImage(
            sprite.spriteSheet,
            sprite.x,
            sprite.y,
            sprite.width,
            sprite.height,
            this._character.x - this._character.width / 2,
            this._character.y - this._character.height / 2,
            this._character.width,
            this._character.height,
        );

    }

    _drawGameOverScreen() {
        this._drawBackground();

        this._canvasContext.fillStyle = 'black';
        this._canvasContext.textAlign = 'center';

        this._canvasContext.font = '30px Verdana';
        this._canvasContext.fillText("GAME OVER", this._canvasWidth / 2, 200);

        this._canvasContext.font = '14px Verdana';
        this._canvasContext.fillText('Click to continue', this._canvasWidth / 2, 500);
    }

    _drawScoreboard() {
        this._canvasContext.fillStyle = 'black';
        this._canvasContext.textAlign = 'start';

        this._canvasContext.font = '20px Verdana';
        this._canvasContext.fillText(`Score: ${this._score}`, 10, 20);
    }

    _drawDebuggingInfo() {
        this._canvasContext.fillStyle = 'black';
        this._canvasContext.textAlign = 'end';

        this._canvasContext.font = '20px Verdana';
        this._canvasContext.fillText(`Vy: ${character.vy}`, this._canvasWidth, 20);
    }

    _updatePlatforms() {
        const firstPlatform = this._platforms[0];

        if ((firstPlatform.x + firstPlatform.width) < 0) {
            this._platforms = this._platforms.splice(1);
        }

        const lastPlatform = this._platforms[this._platforms.length - 1];

        if ((lastPlatform.x + lastPlatform.width) <= (this._canvasWidth * 0.75)) {
            this._platforms.push(new Platform(this._canvasWidth, this._getNextPlatformYCoord(), platformVx, platformWidth, platformHeight));
        }
    }

    _getNextPlatformYCoord() {
        const lastPlatform = this._platforms[this._platforms.length - 1];
        let nextPlatformYCoord = null;

        do {
            nextPlatformYCoord = Math.random() * this._yBottom;
        } while (nextPlatformYCoord - lastPlatform.y <= -200);

        return nextPlatformYCoord;
    }

    _getCollidingPlatform() {
        const charBottom = this._character.bottom;
        const charLeft = this._character.left;
        const charRight = this._character.rigth;

        for (const platform of this._platforms) {
            const platformBottom = platform.bottom;
            const platformLeft = platform.left;
            const platformRight = platform.right;

            if (charBottom >= platform.y && charBottom <= platformBottom
                && ((charLeft >= platformLeft && charLeft <= platformRight) || (charRight >= platformLeft && charRight <= platformRight))
            ) {
                return platform;
            }
        }

        return null;
    }
}
