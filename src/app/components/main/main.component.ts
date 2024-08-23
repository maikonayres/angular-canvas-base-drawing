import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements AfterViewInit {
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement> | undefined;
  private _canvasCtx: CanvasRenderingContext2D | null = null;

  constructor() {

  }


  ngAfterViewInit(): void {
    if (this.canvas?.nativeElement) {
      this._canvasCtx = this.canvas.nativeElement.getContext('2d');
      if (this._canvasCtx) {
        this._canvasCtx.fillStyle = 'rgba(197,49,49,0.52)';
        this._canvasCtx.strokeStyle = '#fb0000';
        // this._canvasCtx.lineWidth = 1;

        this._canvasCtx.strokeRect(10, 10, 20, 20);
        this._canvasCtx.fillRect(5, 5, 20, 20);



        this._canvasCtx.strokeStyle = 'rgba(135,133,133,0.52)';
        this._canvasCtx.fillStyle = 'rgba(135,133,133,0.52)';

        this._canvasCtx.strokeRect(40, 40, 20, 20);
        this._canvasCtx.fillRect(40, 40, 20, 20);
      }
    }
  }


}
