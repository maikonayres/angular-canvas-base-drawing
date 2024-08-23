import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { DrawToolState } from "../../estate/draw-tool-state";
import { StateEnum } from "../../enums/state.enum";
import { JsonPipe, NgIf } from "@angular/common";
import { IPointModel } from "../../model/i-point.model";
import { VericeEnum } from "../../enums/verice.enum";

@Component({
  selector: 'app-rect',
  standalone: true,
  imports: [
    JsonPipe,
    NgIf
  ],
  templateUrl: './rect.component.html',
  styleUrl: './rect.component.css'
})
export class RectComponent implements AfterViewInit {
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement> | undefined;
  private _ctx: CanvasRenderingContext2D | null = null;

  mouseIsdown = false;
  indexSelected: string = '';
  drawState: any = {};
  cursorPoint: IPointModel = {
    x: 0,
    y: 0
  }

  selectedToolId: string | undefined = undefined;
  hoveredVertice: VericeEnum | undefined = undefined;

  readonly VERTICES: VericeEnum[] = [
    VericeEnum.VERTICE_A,
    VericeEnum.VERTICE_B,
    VericeEnum.VERTICE_C,
    VericeEnum.VERTICE_D,
    VericeEnum.VERTICE_E
  ]

  constructor() {

  }

  ngAfterViewInit(): void {
    if (this.canvas?.nativeElement) {
      const canvas = this.canvas?.nativeElement;
      this._ctx = this.canvas.nativeElement.getContext('2d');
      if (this._ctx && canvas) {

        setTimeout(() => {
          this.addTool();
        }, 2)
        console.log(this._ctx);
      }
    }
  }

  removeTool() {
    delete this.drawState[this.indexSelected];
  }


  addTool() {
    const tool = new DrawToolState(this._ctx!);
    this.indexSelected = tool.getId();
    this.drawState[this.indexSelected] = tool;
  }

  getTool(): DrawToolState {
    return this.drawState[this.indexSelected];
  }



  draw() {
    this.clear();
    Object.keys(this.drawState).forEach((tool) => {
      if (
        this.drawState[tool].getState() === StateEnum.IDLE ||
        this.drawState[tool].getState() === StateEnum.DRAG ||
        this.drawState[tool].getState() === StateEnum.ROTATE

      ) {
        this.drawLineIdle(this._ctx!, this.drawState[tool]);
      }
    })

    switch (this.getTool().getState()) {
      case StateEnum.DRAW:
        this.drawLineDrawing(this._ctx!, this.getTool());
        break;

      case StateEnum.ROTATE:
        this.drawLineInRotate(this._ctx!, this.getTool());
        break;
    }
  }

  getHoveredVertice(): VericeEnum | undefined {
    return this.hoveredVertice;
  }

  setHoveredVertice(value: VericeEnum | undefined): void {
    this.hoveredVertice = value;
  }

  setHoveredToolId(id: string | undefined): void {
    this.selectedToolId = id;
  }

  mousemove($event: MouseEvent) {
    const {x, y} = $event;
    this.cursorPoint = {x, y};
    this.getTool().triggerMouseMove({x, y});
    this.draw();
  }

  mousedown($event: MouseEvent) {
    const {x, y} = $event;
    this.mouseIsdown = true;
    if (this.selectedToolId) {
      this.selectShape(this.selectedToolId);
    }
    // console.log(this.hoveredVertice);
    // this.getTool().triggerMouseDown({x, y}, {
    //   hoveredShapeId: this.selectedToolId,
    //   hoveredVertice: this.getHoveredVertice(),
    //   isHovered: true
    // });
    // this.draw();
  }

  mouseleave($event: MouseEvent) {
    this.mouseup($event);
  }

  mouseup($event: MouseEvent) {
    const {x, y} = $event;
    this.mouseIsdown = false;

    this.getTool().triggerMouseUp({x, y});
    this.draw();
  }

  getVertice(drawState: DrawToolState, vertice: VericeEnum): IPointModel {
    let verticeCoord: IPointModel = {
      x: 0,
      y: 0
    }
    switch (vertice) {
      case VericeEnum.VERTICE_A:
        verticeCoord = drawState.getVerticeA();
        break;

      case VericeEnum.VERTICE_B:
        verticeCoord = drawState.getVerticeB();
        break;

      case VericeEnum.VERTICE_C:
        verticeCoord = drawState.getVerticeC();
        break;

      case VericeEnum.VERTICE_D:
        verticeCoord = drawState.getVerticeD();
        break;

      case VericeEnum.VERTICE_E:
        verticeCoord = drawState.getVerticeE();
        break;
    }
    return verticeCoord;
  }

  drawVertices(ctx: CanvasRenderingContext2D, drawState: DrawToolState): void {
    this.VERTICES.forEach((vertice) => {
      const controlStartPoint = new Path2D();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'blue';
      ctx.fillStyle = "yellow";
      const verticeCoord = this.getVertice(drawState, vertice);
      controlStartPoint.arc(verticeCoord.x, verticeCoord.y, 6, 0, 2 * Math.PI);
      const isHovered = ctx.isPointInPath(controlStartPoint, this.cursorPoint.x, this.cursorPoint.y);
      if ((drawState.getState() === StateEnum.IDLE) && isHovered) {
        this.setHoveredToolId(drawState.getId());
        this.setHoveredVertice(vertice);
        ctx.strokeStyle = '#7f7f7f';
        ctx.fillStyle = '#d9d9d9'
      }
      if (vertice === VericeEnum.VERTICE_E) {
        ctx.strokeStyle = '#E60707FF';
        ctx.fillStyle = '#E60707FF'
      }
      ctx.fill(controlStartPoint);
      ctx.stroke(controlStartPoint);


      const path = new Path2D();
      path.moveTo(drawState.getVerticeA().x, drawState.getVerticeA().y);
      path.lineTo(drawState.getVerticeD().x, drawState.getVerticeD().y);

      path.moveTo(drawState.getVerticeB().x, drawState.getVerticeB().y);
      path.lineTo(drawState.getVerticeC().x, drawState.getVerticeC().y);
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke(path);
    })
  }

  drawMiddle(ctx: CanvasRenderingContext2D, drawState: DrawToolState): void {
    const controlStartPoint = new Path2D();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'green';
    ctx.fillStyle = "yellow";
    controlStartPoint.arc(drawState.getCenterPoint().x, drawState.getCenterPoint().y, 6, 0, 2 * Math.PI);
    const isHovered = ctx.isPointInPath(controlStartPoint, this.cursorPoint.x, this.cursorPoint.y);
    if (isHovered) {
      ctx.strokeStyle = '#7f7f7f';
      ctx.fillStyle = '#d9d9d9'
    }
    ctx.fill(controlStartPoint);
    ctx.stroke(controlStartPoint);
    // console.log(drawState.getCenterPoint());
  }

  drawLineIdle(ctx: CanvasRenderingContext2D, drawState: DrawToolState): void {

    const path = new Path2D();
    path.moveTo(drawState.getStartPoint().x, drawState.getStartPoint().y);
    path.lineTo(drawState.getEndPoint().x, drawState.getEndPoint().y);
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const isHovered = ctx.isPointInStroke(path, this.cursorPoint.x, this.cursorPoint.y);
    if (isHovered) {
      this.setHoveredToolId(drawState.getId());
      ctx.strokeStyle = 'green'
    }
    ctx.stroke(path);
    this.drawVertices(ctx, drawState);
    this.drawMiddle(ctx, drawState);
  }

  drawLineInRotate(ctx: CanvasRenderingContext2D, drawState: DrawToolState): void {
    const line = new Path2D();
    line.moveTo(drawState.getStartPointRotate().x, drawState.getStartPointRotate().y);
    line.lineTo(drawState.getMovePoint().x, drawState.getMovePoint().y);
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke(line);

    // ctx.save();
    // ctx.translate(drawState.getCenterPoint().x, drawState.getCenterPoint().y);
    // console.log(drawState.angle);
    // ctx.rotate(drawState.angle);
    //
    // const path = new Path2D();
    // path.moveTo(drawState.getStartPointRotate().x - drawState.getCenterPoint().x, drawState.getStartPointRotate().y - drawState.getCenterPoint().y);
    // path.lineTo(drawState.getEndPoint().x - drawState.getCenterPoint().x, drawState.getEndPoint().y - drawState.getCenterPoint().y);
    // ctx.strokeStyle = 'blue'
    // ctx.lineWidth = 4;
    // ctx.lineCap = 'round';
    // ctx.stroke(path);
    //
    // this.drawVertices(ctx, drawState);
    // this.drawMiddle(ctx, drawState);
    //
    // ctx.restore();


    this.drawVertices(ctx, drawState);
    this.drawMiddle(ctx, drawState);
  }

  drawLineDrawing(ctx: CanvasRenderingContext2D, drawState: DrawToolState): void {

    const path = new Path2D();
    path.moveTo(drawState.getStartPoint().x, drawState.getStartPoint().y);
    path.lineTo(drawState.getMovePoint().x, drawState.getMovePoint().y);
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke(path);

    this.drawVertices(ctx, drawState);
    this.drawMiddle(ctx, drawState);
  }

  clear() {
    if (!this.mouseIsdown) {
      this.setHoveredToolId('');
      this.setHoveredVertice(undefined);
    }
    this._ctx?.clearRect(0, 0, this.canvas!.nativeElement.width, this.canvas!.nativeElement.height)
  }

  protected readonly Object = Object;

  selectShape(item: string) {
    this.indexSelected = item
    // console.log(item);
  }

}


// ctx.save();
// ctx.translate(drawState.getCenterPoint().x, drawState.getCenterPoint().y);
// console.log(drawState.angle);
// ctx.rotate(drawState.angle);
//
// const path = new Path2D();
// path.moveTo(drawState.getStartPointRotate().x - drawState.getCenterPoint().x, drawState.getStartPointRotate().y - drawState.getCenterPoint().y);
// path.lineTo(drawState.getEndPoint().x - drawState.getCenterPoint().x, drawState.getEndPoint().y - drawState.getCenterPoint().y);
// ctx.strokeStyle = 'blue'
// ctx.lineWidth = 4;
// ctx.lineCap = 'round';
// ctx.stroke(path);
//
// this.drawVertices(ctx, drawState);
// this.drawMiddle(ctx, drawState);
//
// ctx.restore();

// console.log('In draw', drawState.getId(), ctx.isPointInStroke(path, drawState.getMovePoint().x, drawState.getMovePoint().y));

// const isHovered = ctx.isPointInStroke(controlStartPoint, drawState.getMovePoint().x, drawState.getMovePoint().y);


// verticeA(ctx: CanvasRenderingContext2D, drawState: DrawToolState): void {
//   const controlStartPoint = new Path2D();
//   ctx.lineWidth = 1;
//   ctx.strokeStyle = 'blue';
//   ctx.fillStyle = "yellow";
//   controlStartPoint.arc(drawState.getVerticeA().x, drawState.getVerticeA().y, 6, 0, 2 * Math.PI);
//   const isHovered = ctx.isPointInPath(controlStartPoint, this.cursorPoint.x, this.cursorPoint.y);
//   if (isHovered) {
//     this.setHoveredToolId(drawState.getId());
//     this.setHoveredVertice(VericeEnum.VERTICE_A);
//     ctx.strokeStyle = '#7f7f7f';
//     ctx.fillStyle = '#d9d9d9'
//   }
//   ctx.fill(controlStartPoint);
//   ctx.stroke(controlStartPoint);
// }
//
// verticeB(ctx: CanvasRenderingContext2D, drawState: DrawToolState): void {
//   const controlStartPoint = new Path2D();
//   ctx.lineWidth = 1;
//   ctx.strokeStyle = 'blue';
//   ctx.fillStyle = "yellow";
//   controlStartPoint.arc(drawState.getVerticeB().x, drawState.getVerticeB().y, 6, 0, 2 * Math.PI);
//   const isHovered = ctx.isPointInPath(controlStartPoint, this.cursorPoint.x, this.cursorPoint.y);
//   if (isHovered) {
//     this.setHoveredToolId(drawState.getId());
//     this.setHoveredVertice(VericeEnum.VERTICE_B);
//     ctx.strokeStyle = '#7f7f7f';
//     ctx.fillStyle = '#d9d9d9'
//
//   }
//   ctx.fill(controlStartPoint);
//   ctx.stroke(controlStartPoint);
// }
//
// verticeC(ctx: CanvasRenderingContext2D, drawState: DrawToolState): void {
//   const controlStartPoint = new Path2D();
//   ctx.lineWidth = 1;
//   ctx.strokeStyle = 'blue';
//   ctx.fillStyle = "yellow";
//   controlStartPoint.arc(drawState.getVerticeC().x, drawState.getVerticeC().y, 6, 0, 2 * Math.PI);
//   const isHovered = ctx.isPointInPath(controlStartPoint, this.cursorPoint.x, this.cursorPoint.y);
//   if (isHovered) {
//     this.setHoveredToolId(drawState.getId());
//     this.setHoveredVertice(VericeEnum.VERTICE_C);
//     ctx.strokeStyle = '#7f7f7f';
//     ctx.fillStyle = '#d9d9d9'
//   }
//   ctx.fill(controlStartPoint);
//   ctx.stroke(controlStartPoint);
// }
//
// verticeD(ctx: CanvasRenderingContext2D, drawState: DrawToolState): void {
//   const controlStartPoint = new Path2D();
//   ctx.lineWidth = 1;
//   ctx.strokeStyle = 'blue';
//   ctx.fillStyle = "yellow";
//   controlStartPoint.arc(drawState.getStartPoint().x, drawState.getEndPoint().y, 6, 0, 2 * Math.PI);
//   const isHovered = ctx.isPointInPath(controlStartPoint, this.cursorPoint.x, this.cursorPoint.y);
//   if (isHovered) {
//     this.setHoveredToolId(drawState.getId());
//     this.setHoveredVertice(VericeEnum.VERTICE_D);
//     ctx.strokeStyle = '#7f7f7f';
//     ctx.fillStyle = '#d9d9d9'
//
//   }
//   ctx.fill(controlStartPoint);
//   ctx.stroke(controlStartPoint);
// }
//
// verticeE(ctx: CanvasRenderingContext2D, drawState: DrawToolState): void {
//   const controlStartPoint = new Path2D();
//   ctx.lineWidth = 1;
//   ctx.strokeStyle = 'blue';
//   ctx.fillStyle = "yellow";
//   controlStartPoint.arc((drawState.getStartPoint().x + drawState.getEndPoint().x) / 2, drawState.getEndPoint().y - 60, 6, 0, 2 * Math.PI);
//   const isHovered = ctx.isPointInPath(controlStartPoint, this.cursorPoint.x, this.cursorPoint.y);
//   if (isHovered) {
//     this.setHoveredToolId(drawState.getId());
//     this.setHoveredVertice(VericeEnum.VERTICE_E);
//     ctx.strokeStyle = '#7f7f7f';
//     ctx.fillStyle = '#d9d9d9'
//
//   }
//   ctx.fill(controlStartPoint);
//   ctx.stroke(controlStartPoint);
// }
