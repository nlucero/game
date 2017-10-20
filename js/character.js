import { Sprite } from './sprite.js';

const TICKS_PER_WALKING_SPRITE = 10;
const MAX_JUMP_BOOSTING_TICKS = 40;

export const CharacterState = {
    STANDING: 0,
    JUMP_BOOSTING: 1,
    JUMP_FALLING: 2,
    FALLING: 3
};

export class Character {
    constructor(sprites, x, y, vx = 0, vy = 0, height = 72, width = 36) {
        this._sprites = sprites;
        this._walkingAnimationSprites = [
            new Sprite(this._sprites, 296, 1, 16, 32),
            new Sprite(this._sprites, 315, 1, 15, 32),
            new Sprite(this._sprites, 331, 1, 16, 32),
        ];
        this._jumpImpulse = -6;
        this._ticksWalking = 0;
        this._ticksJumpBoosting = 0;

        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.height = height;
        this.width = width;
        this.state = CharacterState.STANDING;
    }

    nextTick() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.state === CharacterState.STANDING) {
            this._walk();
        } else if (this.state === CharacterState.JUMP_BOOSTING) {
            this._boostJump();
        }
    }

    requestJumpStart() {
        if ([CharacterState.FALLING, CharacterState.JUMP_FALLING].indexOf(this.state) === -1) {
            this.state = CharacterState.JUMP_BOOSTING;
        }
    }

    requestJumpEnd() {
        this.state = CharacterState.JUMP_FALLING;
        this._ticksJumpBoosting = 0;
    }

    get top() {
        return this.y - this.height / 2;
    }

    get bottom() {
        return this.y + this.height / 2;
    }

    get left() {
        return this.x - this.width / 2;
    }

    get right() {
        return this.x + this.width / 2;
    }

    get currentAnimationSprite() {
        if (this.state === CharacterState.STANDING) {
            return this._walkingAnimationSprites[Math.floor(this._ticksWalking / TICKS_PER_WALKING_SPRITE)];
        } else if (this._isMidAir()) {
            return new Sprite(this._sprites, 369, 2, 16, 31);
        }
    }

    _walk() {
        this._ticksWalking =
            (this._ticksWalking + 1) % (this._walkingAnimationSprites.length * TICKS_PER_WALKING_SPRITE);
    }

    _boostJump() {
        this._ticksJumpBoosting++;
        this.vy = this._jumpImpulse;

        if (this._ticksJumpBoosting >= MAX_JUMP_BOOSTING_TICKS) {
            this.state = CharacterState.JUMP_FALLING;
            this._ticksJumpBoosting = 0;
        }
    }

    _isMidAir() {        
        return [
            CharacterState.JUMP_BOOSTING,
            CharacterState.JUMP_FALLING,
            CharacterState.FALLING
        ].includes(this.state);
    }
}