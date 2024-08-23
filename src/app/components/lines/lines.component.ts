import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';


interface HorizontalLine {
  lineWidth: number, // espessura linha
  margin: {
    top?: number,
    bottom?: number,
    left?: number,
    right?: number,
  }
  boxWidth: number,
  boxHeight: number,
  offsetY: number,
  lineLength: number,

}

@Component({
  selector: 'app-lines',
  standalone: true,
  imports: [],
  templateUrl: './lines.component.html',
  styleUrl: './lines.component.css'
})
export class LinesComponent implements AfterViewInit {
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement> | undefined;
  private _ctx: CanvasRenderingContext2D | null = null;

  constructor() {

  }

  drawHorizontalLine(ctx: CanvasRenderingContext2D, startPoint: number, finalPoint: number, offSetY: number, lineWidth: number, color: string): void {
    ctx.beginPath()
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.moveTo(startPoint, offSetY);
    ctx.lineTo(finalPoint, offSetY);
    ctx.stroke();
  }

  ngAfterViewInit(): void {

    if (this.canvas?.nativeElement) {
      const canvas = this.canvas?.nativeElement;
      this._ctx = this.canvas.nativeElement.getContext('2d');
      if (this._ctx && canvas) {

        const line = new Path2D()
        this._ctx.beginPath()
        this._ctx.lineWidth = 3;
        this._ctx.strokeStyle = "#000";
        line.moveTo(0, 100);
        line.lineTo(150, 100);
        this._ctx.stroke(line);

        const lineWidth = (canvas.height / 10);
        for (let i = 0; i <= 10; ++i) {
          this.drawHorizontalLine(this._ctx, 0, canvas.width, lineWidth * i - (lineWidth / 2), lineWidth, i % 2 == 0 ? "rgba(207,207,207,0.52)" : "rgba(35,35,35,0.52)");
        }


        let pontas = 5;
        let vertices = pontas * 2;
        let angulo = (Math.PI * 2) / vertices;
        let raioInterno = 60;
        let raioExterno = 120;

        let xx = canvas.width / 2;
        let yy = canvas.height / 2;

        this._ctx.strokeStyle = 'red';
        this._ctx.fillStyle = 'green'
        this._ctx.lineWidth = 6;

        this._ctx.beginPath();

        for (let i = 0; i < vertices; i++) {
          let x = 0
          let y = 0;
          if (i % 2 == 0) {
            x = Math.cos(angulo * i) * raioExterno;
            y = Math.sin(angulo * i) * raioExterno;
          } else {
            x = Math.cos(angulo * i) * raioInterno;
            y = Math.sin(angulo * i) * raioInterno;
          }
          this._ctx.lineTo(xx + x, yy + y)

        }
        this._ctx.closePath();
        this._ctx.fill();
        this._ctx.stroke();

        // this.createHorizontalLine(
        //   this._canvasCtx,
        //   {
        //     lineWidth: 10,
        //     margin: {
        //       top: 0,
        //       bottom: 0,
        //       left: 10,
        //       right: 50,
        //     },
        //     boxWidth: canvas.width,
        //     boxHeight: canvas.height,
        //     offsetY: 35,
        //     lineLength: canvas.height
        //   }
        // )

        // const offsetX = 100;
        // const offsetY = boxHeight / 2;
        // const lineWidth = 1;
        //
        // this._canvasCtx.lineWidth = lineWidth;
        // this._canvasCtx.strokeStyle = 'rgba(0,123,255,0.9)';
        //
        // this._canvasCtx.beginPath();
        // this._canvasCtx.moveTo(offsetX, offsetY + (lineWidth / 2)); // padding
        // this._canvasCtx.lineTo(boxWidth - offsetX, offsetY + (lineWidth / 2));
        // this._canvasCtx.stroke();
        //
        //
        // for (let i = 0; i < 20; i++) {
        //   this._canvasCtx.beginPath();
        //   this._canvasCtx.moveTo(offsetX, offsetY + i * 10); // padding
        //   this._canvasCtx.lineTo(boxWidth - offsetX, offsetY +  i * 10);
        //   this._canvasCtx.stroke();
        // }
        //
        // this._canvasCtx.fillStyle = 'rgba(197,49,49,0.52)';
        // this._canvasCtx.strokeStyle = '#fb0000';
        // // this._canvasCtx.lineWidth = 1;
        //
        // this._canvasCtx.strokeRect(10, 10, 20, 20);
        // this._canvasCtx.fillRect(5, 5, 20, 20);
        //
        //
        // this._canvasCtx.strokeStyle = 'rgba(135,133,133,0.52)';
        // this._canvasCtx.fillStyle = 'rgba(135,133,133,0.52)';
        // this._canvasCtx.strokeRect(40, 40, 20, 20);
        // this._canvasCtx.fillRect(40, 40, 20, 20);
      }
    }
  }


  mousemove($event: MouseEvent) {
    // console.log('mousemove', $event);
  }

  mousedown($event: MouseEvent) {
    console.log('mousedown', $event);
  }

  mouseup($event: MouseEvent) {
    console.log('mouseup', $event);
  }

  mouseover($event: MouseEvent) {
    console.log('mouseover', $event);
  }

  mouseout($event: MouseEvent) {
    console.log('mouseout', $event);
  }
}
