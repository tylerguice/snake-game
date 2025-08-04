import { Component, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

type Direction = 'up' | 'down' | 'left' | 'right';
interface Position {
  x: number;
  y: number;
}

@Component({
  selector: 'app-game-board',
  imports: [MatButtonModule],
  templateUrl: './game-board.html',
  styleUrl: './game-board.scss'
})
export class GameBoard implements AfterViewInit {

  @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private boardSize = 20; // 20 x 20 grid
  private tileSize = 20; // pixels per tile
  private snake: Position[] = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
  ];
  private direction: Direction = 'right';
  private gameInterval: any;
  private food: Position = this.generateFood();
  private score: number = 0;
  private isGameOver = false;
  private lastUpdateTime = 0;
  private moveDelay = 200; // milliseconds between moves

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.startGame();
  }

  private gameLoop = (timestamp: number) => {
    if (this.isGameOver) return;

    const delta = timestamp - this.lastUpdateTime;

    if (delta > this.moveDelay) {
      this.updateSnake();
      this.drawBoard();
      this.lastUpdateTime = timestamp;
    }

    requestAnimationFrame(this.gameLoop);
  };

  startGame() {
    this.snake = [{ x: 10, y: 10 }];
    this.direction = 'right';
    this.food = this.generateFood();
    this.score = 0;
    this.isGameOver = false;
    this.lastUpdateTime = 0;

    requestAnimationFrame(this.gameLoop);
  }

  private drawBoard() {
    this.ctx.clearRect(0, 0, this.boardSize * this.tileSize, this.boardSize * this.tileSize);

    // Background
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.boardSize * this.tileSize, this.boardSize * this.tileSize);

    // Snake
    this.ctx.fillStyle = '#4caf50';
    for (const segment of this.snake) {
      this.ctx.fillRect(
        segment.x * this.tileSize,
        segment.y * this.tileSize,
        this.tileSize,
        this.tileSize
      );
    }

      // Food
      this.ctx.fillStyle = '#e53935'; // red
      this.ctx.fillRect(
        this.food.x * this.tileSize,
        this.food.y * this.tileSize,
        this.tileSize,
        this.tileSize
      );

      // Score
      this.ctx.fillStyle = '#000';
      this.ctx.font = '16px Arial';
      this.ctx.fillText(`Score: ${this.score}`, 10, 20);
  }

private updateSnake() {
  const head = { ...this.snake[0] };

  switch (this.direction) {
    case 'up': head.y--; break;
    case 'down': head.y++; break;
    case 'left': head.x--; break;
    case 'right': head.x++; break;
  }

  // Wrap around edges
  head.x = (head.x + this.boardSize) % this.boardSize;
  head.y = (head.y + this.boardSize) % this.boardSize;

  // Self-collision check
  if (this.snake.some(segment => this.isSamePosition(segment, head))) {
    this.isGameOver = true;
    clearInterval(this.gameInterval);
    alert('Game Over! Score: ' + this.score);
    return;
  }

  this.snake.unshift(head);

  if (this.isSamePosition(head, this.food)) {
    this.score++;
    this.food = this.generateFood();
    // no pop = grow
  } else {
    this.snake.pop(); // move forward
  }
}

  private isSamePosition(a: Position, b: Position): boolean {
    return a.x === b.x && a.y === b.y;
  }

  private generateFood(): Position {
    let position: Position;
    do {
      position = {
        x: Math.floor(Math.random() * this.boardSize),
        y: Math.floor(Math.random() * this.boardSize)
      };
    } while (this.snake.some(segment => this.isSamePosition(segment, position)));

    return position;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const key = event.key;
    if (key === 'ArrowUp' && this.direction !== 'down') this.direction = 'up';
    if (key === 'ArrowDown' && this.direction !== 'up') this.direction = 'down';
    if (key === 'ArrowLeft' && this.direction !== 'right') this.direction = 'left';
    if (key === 'ArrowRight' && this.direction !== 'left') this.direction = 'right';
  }
}
