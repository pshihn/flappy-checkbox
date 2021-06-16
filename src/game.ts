const INITIAL_SPEED = 300;
const INITIAL_POLE_GAP = 5;
const INITIAL_POLE_INT = 8;

type Line = [number, number, number]; //x, y, length
type Position = [number, number];

class Canvas {
  private _w: number;
  private _h: number;
  private _boxes: HTMLInputElement[] = [];
  private _checked: HTMLInputElement[] = [];
  private _bird?: HTMLInputElement;

  constructor(parent: HTMLElement, width: number, height: number) {
    this._w = width;
    this._h = height;
    parent.innerHTML = '';
    parent.style.gridTemplateColumns = `repeat(${this._w}, 1fr)`;
    parent.style.width = `${this._w * 18}px`;
    for (let i = 0; i < this._h; i++) {
      for (let j = 0; j < this._w; j++) {
        const i = document.createElement('input');
        i.type = 'checkbox';
        i.tabIndex = -1;
        this._boxes.push(i);
        parent.appendChild(i);
      }
    }
  }

  private _check(x: number, y: number, bird: boolean) {
    const i = (y * this._w) + x;
    const cb = this._boxes[i];
    if (cb) {
      cb.checked = true;
      this._checked.push(cb);

      if (bird) {
        if (this._bird) {
          this._bird.classList.remove('bird');
        }
        this._bird = cb;
        cb.classList.add('bird');
      }
    }
  }

  draw(lines: Line[], position: Position) {
    this._checked.forEach((d) => d.checked = false);
    this._checked = [];
    for (const [x, y, l] of lines) {
      for (let i = 0; i < l; i++) {
        this._check(x, y + i, false);
      }
    }
    this._check(...position, true);
  }
}

class Game {
  private canvas: Canvas;
  private h = 16;
  private w: number;
  private poles: Line[] = [];
  private poleGap = INITIAL_POLE_GAP;
  private poleInterval = INITIAL_POLE_INT;
  private speed = INITIAL_SPEED;
  private tickIndex = 0;
  private bird: Position = [0, 0];
  private running = false;
  private score = 0;
  private onend?: () => void;

  constructor(div: HTMLElement) {
    const ww = window.innerWidth;
    this.w = Math.min(32, Math.floor(ww / 18));
    this.canvas = new Canvas(div, this.w, this.h);
  }

  start(onend?: () => void) {
    if (!this.running) {
      this.onend = onend;
      this.running = true;
      this.bird = [2, Math.floor(this.h / 2)];
      this.poles = [];
      this.poleGap = INITIAL_POLE_GAP;
      this.poleInterval = INITIAL_POLE_INT;
      this.speed = INITIAL_SPEED;
      this.tickIndex = 0;
      this.setScore(0);
      this.tick();
      document.addEventListener('keydown', this.keyListener);
    }
  }

  private stop() {
    if (this.running) {
      this.running = false;
      document.removeEventListener('keydown', this.keyListener);
    }
  }

  moveDown() {
    if (this.running) {
      this.bird[1] = Math.min(this.h - 1, this.bird[1] + 1);
    }
  }
  moveUp() {
    if (this.running) {
      this.bird[1] = Math.max(0, this.bird[1] - 1);
    }
  }

  private keyListener = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'W':
      case 'w':
        this.moveUp();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.moveDown();
        break;
    }
  };

  private newPole() {
    const rand = 1 + Math.round(Math.random() * (this.h - this.poleGap - 1));
    this.poles.push([
      this.w - 1,
      0,
      rand
    ], [
      this.w - 1,
      rand + this.poleGap - 1,
      this.h - (rand + this.poleGap - 1)
    ]);
  }

  private shiftPoles() {
    const newPoles: Line[] = [];
    for (const pole of this.poles) {
      if (pole[0] > 0) {
        pole[0]--;
        newPoles.push(pole);
      }
    }
    this.poles = newPoles;
  }

  private detectCollision(): boolean {
    const [bx, by] = this.bird;
    for (const [x, y, l] of this.poles) {
      if (x === bx) {
        if (y === 0) {
          if (by < (y + l)) {
            return true;
          }
        } else if (by >= y) {
          return true;
        }
        this.setScore(this.score + 0.5);
      }
    }
    return false;
  }

  private tick() {
    if (!this.running) {
      return;
    }
    this.shiftPoles();
    if (this.tickIndex === 0) {
      this.newPole();
    }
    this.tickIndex = (this.tickIndex + 1) % this.poleInterval;
    this.canvas.draw(this.poles, this.bird);
    if (this.detectCollision()) {
      this.endGame();
      return;
    }
    setTimeout(() => this.tick(), this.speed);
  }

  private endGame() {
    this.stop();
    if (this.onend) {
      this.onend();
    }
    setTimeout(() => window.alert(`Game Over!\nYour score: ${Math.floor(this.score)}`));
  }

  private _scoreNode?: HTMLElement;
  private setScore(value: number) {
    if (!this._scoreNode) {
      this._scoreNode = document.getElementById('score')!;
    }
    if (this.score !== value) {
      this.score = value;
      this._scoreNode.textContent = `${Math.floor(value)}`;
      if (value >= 5) {
        this.speed = INITIAL_SPEED / (Math.floor(value / 5) * 1.2);
      }
      if (value >= 10) {
        this.poleInterval = Math.max(3, INITIAL_POLE_INT - Math.floor(value / 10));
      }
      if (value >= 15) {
        this.poleGap = Math.max(2, INITIAL_POLE_GAP - Math.floor(value / 15));
      }
    }
  }
}


(() => {
  const div = document.getElementById('canvas')!;
  const game = new Game(div);
  document.getElementById('startButton')!.addEventListener('click', () => {
    const ip = document.getElementById('infoPanel')!;
    ip.style.display = 'none';
    game.start(() => {
      ip.style.display = 'block';
    });
  });
  document.getElementById('btnup')!.addEventListener('click', () => game.moveUp());
  document.getElementById('btndown')!.addEventListener('click', () => game.moveDown());
})();