import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

interface Cordinate {
  x: number,
  y: number
}

@Component({
  selector: 'app-square',
  standalone: true,
  imports: [],
  templateUrl: './square.component.html',
  styleUrl: './square.component.css'
})
export class SquareComponent implements AfterViewInit {
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement> | undefined;
  private _ctx: CanvasRenderingContext2D | null = null;

  mouseIsdown = false;
  mousedownCordinate: Cordinate = {
    x: 0,
    y: 0
  }

  mouseUpCordinate: Cordinate = {
    x: 0,
    y: 0
  }

  mouseMoveCordinate: Cordinate = {
    x: 0,
    y: 0
  }

  draw = {
    mousedownCordinate: this.mousedownCordinate,
    mouseUpCordinate: this.mouseUpCordinate,
    mouseMoveCordinate: this.mouseMoveCordinate,
  }

  win = {
    width: 0,
    height: 0,
  }

  constructor() {

  }

  ngAfterViewInit(): void {

    if (this.canvas?.nativeElement) {
      const canvas = this.canvas?.nativeElement;
      this._ctx = this.canvas.nativeElement.getContext('2d');
      if (this._ctx && canvas) {
        this.win = {
          width: canvas.width,
          height: canvas.height
        }
      }
    }
  }

  drawEvent(): void {
    console.log('drawEvent', this.draw);

    const dX = Math.pow(this.draw.mousedownCordinate.x, 1) - Math.pow(this.draw.mouseUpCordinate.x, 1);
    const dY = Math.pow(this.draw.mousedownCordinate.y, 1) - Math.pow(this.draw.mouseUpCordinate.y, 1);

    console.log(dX, dY); // distance x
    // console.log(Math.pow(this.draw.mousedownCordinate.y, 1) - Math.pow(this.draw.mouseUpCordinate.y, 1)); // distance y

    // this.drawLine(this._ctx!, this.draw.mousedownCordinate, this.draw.mouseUpCordinate);
  }

  distanX(): number {
    return Math.pow(this.draw.mousedownCordinate.x, 1) - Math.pow(this.draw.mouseUpCordinate.x, 1)
  }

  drawLine(ctx: CanvasRenderingContext2D, startPoint: Cordinate, finalPoint: Cordinate): void {
    ctx.beginPath()
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255, 255, 255, 1)";
    ctx.lineCap = "round";
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(finalPoint.x, finalPoint.y);
    ctx.stroke();
  }

  save(): void {
    this._ctx!.save()
  }

  mousemoveEvent($event: MouseEvent) {
    const coord = this.mouseMoveCordinate = {
      x: $event.x,
      y: $event.y
    }

    // this.clear();
    // const dX = Math.pow(this.draw.mousedownCordinate.x, 1) - Math.pow(coord.x, 1);
    // console.log(Math.sign(dX));
    // this.drawRoundedRectangle(this._ctx!,Math.sign(dX) * coord.x, coord.y, 80, 50, 2)

    if (this.mouseIsdown) {
      this.clear();

      this.drawSquare(this._ctx!, coord.x);
      this.drawLine(this._ctx!, this.draw.mousedownCordinate, coord);

      this.verticalLine(this._ctx!, this.draw.mousedownCordinate.x)

      const dX = Math.pow(this.draw.mousedownCordinate.x, 1) - Math.pow(coord.x, 1);

      let width = 72;
      let heigth = 30;
      const offsetX = 10
      let cordX = coord.x;
      if (dX > 0) {
        cordX = cordX - width - offsetX;
      }else {
        cordX = cordX + offsetX;
      }

      console.log(Math.sign(dX));


      this.drawRoundedRectangle(this._ctx!, cordX, coord.y, width, heigth, 4)
      this.drawText(this._ctx!,cordX, coord.y, width, heigth,'18/07/2024');

      // this.drawRoundedRectangle(this._ctx!, this.draw.mousedownCordinate.x, this.draw.mousedownCordinate.y, width, heigth, 4)

      this.verticalLine(this._ctx!, coord.x)


    }
    this.draw.mouseMoveCordinate = coord;
  }

  drawBoxtext(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, text: string): void {
    ctx.fillStyle = '#FF0000'; // Red color for the rectangle

    ctx.fillRect(x, y, width, height); // x, y, width, height

    // Step 3: Add text inside the rectangle
    ctx.fillStyle = '#000'; // White color for the text
    ctx.font = '12px'; // Font size and family
    ctx.textAlign = 'center'; // Center align the text
    ctx.textBaseline = 'middle'; // Center align the text vertically
    ctx.fillText(text, x + width / 2, y + height / 2);
  }

  drawText(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, text: string) {
    ctx.fillStyle = '#000'; // White color for the text
    ctx.font = '12px Arial'; // Font size and family
    ctx.textAlign = 'center'; // Center align the text
    ctx.textBaseline = 'middle'; // Center align the text vertically
    ctx.fillText(text, x + width / 2, y + height / 2);
  }

  drawRoundedRectangle(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.fill();
  }

  drawSquare(ctx: CanvasRenderingContext2D, coordX: number) {
    const dX = Math.pow(this.draw.mousedownCordinate.x, 1) - Math.pow(coordX, 1);
    ctx.beginPath()
    ctx.fillStyle = 'rgba(25, 188, 254, 0.06)';

    ctx.fillRect(this.draw.mousedownCordinate.x, 0, -dX, this.canvas!.nativeElement.height);
    ctx.stroke();
  }

  // mousemoveEvent($event: MouseEvent) {
  //   const coord = this.mouseMoveCordinate = {
  //     x: $event.x,
  //     y: $event.y
  //   }
  //   if (this.mouseIsdown) {
  //     this.drawLine(this._ctx!, this.draw.mouseMoveCordinate, coord);
  //   }
  //   this.draw.mouseMoveCordinate = coord;
  // }
  verticalLine(ctx: CanvasRenderingContext2D, coordX: number): void {
    ctx.beginPath()
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(25, 188, 254, 1)";
    ctx.lineCap = "round";
    ctx.moveTo(coordX, 0);
    ctx.lineTo(coordX, this.win.height);
    ctx.stroke();
  }

  mousedownEvent($event: MouseEvent) {
    this.clear();
    this.mouseIsdown = true;
    this.draw.mousedownCordinate = this.mousedownCordinate = {
      x: $event.x,
      y: $event.y
    }
    this.draw.mouseUpCordinate = this.mouseUpCordinate = {
      x: $event.x,
      y: $event.y
    }
    const ctx = this.canvas!.nativeElement.getContext('2d')
    this.verticalLine(this._ctx!, this.draw.mousedownCordinate.x)


    // this.drawLine(this._ctx!, this.draw.mousedownCordinate, this.draw.mousedownCordinate);
  }

  mouseupEvent($event: MouseEvent) {
    this.mouseIsdown = false;
    this.draw.mouseUpCordinate = this.mouseUpCordinate = {
      x: $event.x,
      y: $event.y
    }
    console.log(Math.abs(this.distanX()));
    if (Math.abs(this.distanX()) <= 2) {
      this.clear();
    }
    this.draw.mouseMoveCordinate = {
      x: 0,
      y: 0
    }
    // this.drawEvent()
  }

  clear() {
    this._ctx?.clearRect(0, 0, this.canvas!.nativeElement.width, this.canvas!.nativeElement.height)
  }

  mouseoutEvent($event: MouseEvent) {
    // this.clear();
  }

}
