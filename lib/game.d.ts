declare const INITIAL_SPEED = 300;
declare const INITIAL_POLE_GAP = 5;
declare const INITIAL_POLE_INT = 8;
declare type Line = [number, number, number];
declare type Position = [number, number];
declare class Canvas {
    private _w;
    private _h;
    private _boxes;
    private _checked;
    private _bird?;
    constructor(parent: HTMLElement, width: number, height: number);
    private _check;
    draw(lines: Line[], position: Position): void;
}
declare class Game {
    private canvas;
    private h;
    private w;
    private poles;
    private poleGap;
    private poleInterval;
    private speed;
    private tickIndex;
    private bird;
    private running;
    private score;
    private onend?;
    constructor(div: HTMLElement);
    start(onend?: () => void): void;
    private stop;
    moveDown(): void;
    moveUp(): void;
    private keyListener;
    private newPole;
    private shiftPoles;
    private detectCollision;
    private tick;
    private endGame;
    private _scoreNode?;
    private setScore;
}
