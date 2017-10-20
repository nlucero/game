import { Sprite, getSpritePattern } from './sprite.js';
import { Character, CharacterState } from './character.js';
import Game from './game.js';
import { loadImageResource } from './loaders.js';

let game;

Promise.all([loadImageResource('sprites/characters.gif'), loadImageResource('sprites/misc.gif'), loadImageResource('sprites/world.gif')])
    .then(([characterSprites, miscSprites, worldSprites]) => {
        const canvas = document.getElementById("canvas");
        game = new Game(canvas.height - 100, canvas, characterSprites, miscSprites, worldSprites);

        window.addEventListener("keydown", e => game.handleKeyDown(e.keyCode || e.which));
        window.addEventListener("keyup", e => game.handleKeyUp(e.keyCode || e.which));
        canvas.addEventListener("mousedown", e => game.handleMouseDown());
        canvas.addEventListener("mouseup", e => game.handleMouseUp());

        main();
    });

const main = () => {
    game.nextTick();
    window.requestAnimationFrame(main);
}
