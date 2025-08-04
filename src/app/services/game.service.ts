import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Point {
  x: number;
  y: number;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private boardSize = 20;

  snakeSubject = new BehaviorSubject<Point[]>([
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ]);
  snake$ = this.snakeSubject.asObservable();

  directionSubject = new BehaviorSubject<Direction>('right');
  direction$ = this.directionSubject.asObservable();

  foodSubject = new BehaviorSubject<Point>(this.generateFood());
  food$ = this.foodSubject.asObservable();

  scoreSubject = new BehaviorSubject<number>(0);
  score$ = this.scoreSubject.asObservable();

  isGameOverSubject = new BehaviorSubject<boolean>(false);
  isGameOver$ = this.isGameOverSubject.asObservable();

  gameLoopSubscription?: Subscription;

  startGame() {
    this.reset();
    this.gameLoopSubscription = interval(150).subscribe(() => this.moveSnake());
  }

  stopGame() {
    this.gameLoopSubscription?.unsubscribe();
  }

  reset() {
    this.snakeSubject.next([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ]);
    this.directionSubject.next('right');
    this.foodSubject.next(this.generateFood());
    this.scoreSubject.next(0);
    this.isGameOverSubject.next(false);
  }

  changeDirection(newDir: Direction) {
    const opposite: Record<Direction, Direction> = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    };
    const currentDir = this.directionSubject.getValue();
    if (currentDir !== opposite[newDir]) {
      this.directionSubject.next(newDir);
    }
  }

  private moveSnake() {
    if (this.isGameOverSubject.getValue()) return;

    const snake = this.snakeSubject.getValue();
    const head = { ...snake[0] };
    const direction = this.directionSubject.getValue();

    switch (direction) {
      case 'up': head.y--; break;
      case 'down': head.y++; break;
      case 'left': head.x--; break;
      case 'right': head.x++; break;
    }

    // Wrap edges
    head.x = (head.x + this.boardSize) % this.boardSize;
    head.y = (head.y + this.boardSize) % this.boardSize;

    // Self collision
    if (snake.some(seg => this.isSamePosition(seg, head))) {
      this.isGameOverSubject.next(true);
      this.stopGame();
      return;
    }

    const newSnake = [head, ...snake];

    // Eat food
    if (this.isSamePosition(head, this.foodSubject.getValue())) {
      this.scoreSubject.next(this.scoreSubject.getValue() + 1);
      this.foodSubject.next(this.generateFood());
      // grow - do NOT pop tail
    } else {
      newSnake.pop();
    }

    this.snakeSubject.next(newSnake);
  }

  private generateFood(): Point {
    let position: Point;
    do {
      position = {
        x: Math.floor(Math.random() * this.boardSize),
        y: Math.floor(Math.random() * this.boardSize),
      };
    } while (this.snakeSubject.getValue().some(seg => this.isSamePosition(seg, position)));
    return position;
  }

  private isSamePosition(a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y;
  }
}
