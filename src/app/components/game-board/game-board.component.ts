import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Point, Direction } from '../../services/game.service';
import { Subscription } from 'rxjs';
import { GameOverDialogComponent } from '../game-over-dialog/game-over-dialog.component';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss',
})

export class GameBoard implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  currentScore = 0;
  boardSize = 20;
  tileSize = 20;
  private ctx!: CanvasRenderingContext2D;
  private subs: Subscription[] = [];

  constructor(
    private gameService: GameService,
    private dialog: MatDialog
  ) {}

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;

    this.gameService.startGame();

    this.subs.push(
      this.gameService.snake$.subscribe(() => this.draw()),
      this.gameService.food$.subscribe(() => this.draw()),
      this.gameService.score$.subscribe(score => this.currentScore = score),
      this.gameService.isGameOver$.subscribe(isOver => {
        if (isOver) {
          this.handleGameOver();
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.gameService.stopGame();
  }

  startGame() {
    this.gameService.stopGame();  // stop current game loop
    this.gameService.reset();     // reset state
    this.gameService.startGame(); // start fresh
  }

  private draw() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    // this.ctx.fillStyle = '#f0f0f0';
    // this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.drawGrid();

    const ctx = this.ctx;
    const tile = this.tileSize;
    const radius = 4;
    const spacing = 2;

    // Snake
    ctx.fillStyle = '#4caf50';
    for (const segment of this.gameService.snakeSubject.getValue()) {
      const px = segment.x * tile + spacing / 2;
      const py = segment.y * tile + spacing / 2;
      const w = tile - spacing;
      const h = tile - spacing;
      this.drawRoundedRect(ctx, px, py, w, h, radius);
      ctx.fill();
    }

    // Food
    ctx.fillStyle = '#e53935';
    const food = this.gameService.foodSubject.getValue();
    const fpx = food.x * tile + spacing / 2;
    const fpy = food.y * tile + spacing / 2;
    this.drawRoundedRect(ctx, fpx, fpy, tile - spacing, tile - spacing, radius);
    ctx.fill();
  }

  private drawGrid() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;
    const size = this.boardSize;      // e.g. 20 cells wide/high
    const tile = this.tileSize;       // e.g. 20 pixels
    const gridCornerRadius = 5;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Checkerboard color
        const isLight = (x + y) % 2 === 0;
        ctx.fillStyle = isLight ? '#525180ff' : '#464673ff'; // light and dark blue shades

        // Draw cell background
        const px = x * tile;
        const py = y * tile;

        this.drawRoundedRect(ctx, px, py, tile, tile, gridCornerRadius);
        ctx.fill();

        // Draw border lines (stroke) around each cell for grid lines
        ctx.strokeStyle = '#363561ff'; // grid line color
        ctx.lineWidth = 1;

        // Use strokeRect for border
        ctx.strokeRect(x * tile, y * tile, tile, tile);
      }
    }
  }

  private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private handleGameOver() {
    const dialogRef = this.dialog.open(GameOverDialogComponent, {
      width: '450px',
      disableClose: true,
      data: {
        finalScore: this.currentScore
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'restart') {
        this.startGame();
      }
    });
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
