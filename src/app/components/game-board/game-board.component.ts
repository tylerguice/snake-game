import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Point, Direction } from '../../services/game.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'game-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
})
export class GameBoard implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  private subs: Subscription[] = [];

  boardSize = 20;
  tileSize = 20;

  constructor(private gameService: GameService) {}

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;

    this.gameService.startGame();

    this.subs.push(
      this.gameService.snake$.subscribe(() => this.draw()),
      this.gameService.food$.subscribe(() => this.draw()),
      this.gameService.isGameOver$.subscribe(isOver => {
        if (isOver) {
          alert('Game Over! Score: ' + this.gameService.score$);
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.gameService.stopGame();
  }

  private draw() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    this.ctx.fillStyle = '#4caf50';
    for (const segment of this.gameService.snakeSubject.getValue()) {
      this.ctx.fillRect(
        segment.x * this.tileSize,
        segment.y * this.tileSize,
        this.tileSize,
        this.tileSize
      );
    }

    // Draw food
    const food = this.gameService.foodSubject.getValue();
    this.ctx.fillStyle = '#e53935';
    this.ctx.fillRect(
      food.x * this.tileSize,
      food.y * this.tileSize,
      this.tileSize,
      this.tileSize
    );

    // Draw score
    this.ctx.fillStyle = '#000';
    this.ctx.font = '16px Arial';
    this.ctx.fillText('Score: ' + this.gameService.scoreSubject.getValue(), 10, 20);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp': this.gameService.changeDirection('up'); break;
      case 'ArrowDown': this.gameService.changeDirection('down'); break;
      case 'ArrowLeft': this.gameService.changeDirection('left'); break;
      case 'ArrowRight': this.gameService.changeDirection('right'); break;
    }
  }
}
