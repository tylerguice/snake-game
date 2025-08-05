import { Component, Inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-game-over-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './game-over-dialog.component.html',
  styleUrl: './game-over-dialog.component.scss',
})

export class GameOverDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<GameOverDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { finalScore: number }
  ) {}

  restartGame() {
    this.dialogRef.close('restart');
  }
}

