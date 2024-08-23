import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { NgIf } from "@angular/common";
import { IPointModel } from "../../model/i-point.model";
import { VericeEnum } from "../../enums/verice.enum";
import { BaseToolState } from "./state/base-tool.state";

interface verticeModel {
  coord: IPointModel,
  color: string
}

@Component({
  selector: 'app-base-tool',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './base-tool.component.html',
  styleUrl: './base-tool.component.css'
})
export class BaseToolComponent implements AfterViewInit {

  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement> | undefined;
  protected readonly Object = Object;

  private readonly _initialPosition: IPointModel = {
    x: -1000,
    y: -1000,
  }
  readonly VERTICES: VericeEnum[] = [
    VericeEnum.VERTICE_A,
    VericeEnum.VERTICE_B,
    VericeEnum.VERTICE_C,
    VericeEnum.VERTICE_D,
    VericeEnum.VERTICE_E
  ]

  private _ctx: CanvasRenderingContext2D | null = null;
  private _selectedShapeId: string = '';
  private _cursorPosition: IPointModel = this._initialPosition;

  private _hoveredShapeId: string | undefined = undefined;
  private _hoveredVertice: VericeEnum | undefined = undefined;
  private _mouseIsdown = false;

  shapes: any = {};

  constructor() {

  }

  ngAfterViewInit(): void {
    if (this.canvas?.nativeElement) {
      const canvas = this.canvas?.nativeElement;
      this._ctx = this.canvas.nativeElement.getContext('2d');
      if (this._ctx && canvas) {

        setTimeout(() => {
          this.addShape();
          console.log(this.shapes);
        }, 10)
      }
    }
  }

  private _getShape(): BaseToolState {
    return this.shapes[this._selectedShapeId];
  }

  addShape(): void {
    const shape = new BaseToolState(this._ctx!);
    this.setSelectedShapeId(shape.getId());
    this.shapes[this.getSelectedShapeId()] = shape;
  }

  removeShape(): void {
    delete this.shapes[this.getSelectedShapeId()];
    this.setSelectedShapeId('')
  }

  mousedown($event: MouseEvent): void {
    const {x, y} = $event;
    this._mouseIsdown = true;
    this._setCursorPosition({x, y});
    let haveShapePristine: boolean = false;

    Object.keys(this.shapes).forEach((shapeId) => {
      const shape = this.shapes[shapeId] as BaseToolState;
      if (shape.getIsPristine()) {
        haveShapePristine = true;
        this.setSelectedShapeId(shapeId);
        this.setHoveredShapeId(shapeId);
        return;
      }
    });

    if (!!this.getHeveredShapeId()) {
      this.setSelectedShapeId(this.getHeveredShapeId()!)
    }

    if (this._getShape() && this._getShape().getId() === this.getSelectedShapeId() && this._getShape().getId() === this.getHeveredShapeId()) {
      this._getShape()
        .triggerMouseDown(
          this._getCursorPosition(),
          {
            selectedShapeId: this.getSelectedShapeId(),
            hoveredShapeId: this.getHoveredVertice(),
            hoveredVertice: this.getHoveredVertice(),
          });
    }

    this.draw();
  }

  mousemove($event: MouseEvent): void {
    const {x, y} = $event;
    this._setCursorPosition({x, y});
    if (this._mouseIsdown && this._getShape() && (this._getShape().getId() === this.getSelectedShapeId()) && (this._getShape().getId() === this.getHeveredShapeId())) {
      this._getShape()
        .triggerMouseMove(this._getCursorPosition());
    }
    this.draw();
  }

  mouseleave($event: MouseEvent) {
    this.mouseup($event);
  }

  mouseup($event: MouseEvent): void {
    const {x, y} = $event;
    this._setCursorPosition({x, y});
    if (this._getShape() && this._getShape().getId() === this.getSelectedShapeId()) {
      this._getShape().triggerMouseUp(this._getCursorPosition());
    }
    this._mouseIsdown = false;
    this.draw();
  }

  draw() {
    this.clear();
    Object.keys(this.shapes).forEach((shapeId) => {
      this.drawLineVirtual(this._ctx!, this.shapes[shapeId]);
      this.drawVertices(this._ctx!, this.shapes[shapeId]);
      this.drawMiddlePoint(this._ctx!, this.shapes[shapeId]);
    });
  }

  drawLineVirtual(ctx: CanvasRenderingContext2D, drawState: BaseToolState): void {
    const path = new Path2D();
    path.moveTo(drawState.getVerticeA().x, drawState.getVerticeA().y);
    path.lineTo(drawState.getVerticeB().x, drawState.getVerticeB().y);
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const isHovered = ctx.isPointInStroke(path, this._getCursorPosition().x, this._getCursorPosition().y);

    if (!this._mouseIsdown && isHovered) {
      ctx.strokeStyle = 'green'
      this.setHoveredShapeId(drawState.getId());
    }
    if (drawState.getId() === this.getSelectedShapeId()) {
      ctx.strokeStyle = 'green'
    }

    ctx.stroke(path);
  }

  drawMiddlePoint(ctx: CanvasRenderingContext2D, drawState: BaseToolState): void {
    const controlStartPoint = new Path2D();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'green';
    ctx.fillStyle = "yellow";
    const middleX = (drawState.getVerticeA().x + drawState.getVerticeB().x) / 2;
    const middleY = (drawState.getVerticeA().y + drawState.getVerticeB().y) / 2;
    controlStartPoint.arc(middleX, middleY, 6, 0, 2 * Math.PI);
    const isHovered = ctx.isPointInPath(controlStartPoint, this._getCursorPosition().x, this._getCursorPosition().y);
    if (isHovered) {
      ctx.strokeStyle = '#7f7f7f';
      ctx.fillStyle = '#d9d9d9'
    }
    ctx.fill(controlStartPoint);
    ctx.stroke(controlStartPoint);
  }

  drawVertices(ctx: CanvasRenderingContext2D, drawState: BaseToolState): void {
    this.VERTICES.forEach((vertice) => {
      if (drawState.getId() === this.getSelectedShapeId()) {
        const controlStartPoint = new Path2D();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'blue';
        ctx.fillStyle = "yellow";
        const {coord, color} = this._getVertice(drawState, vertice);
        controlStartPoint.arc(coord.x, coord.y, 6, 0, 2 * Math.PI);
        const isHovered = ctx.isPointInPath(controlStartPoint, this._getCursorPosition().x, this._getCursorPosition().y);
        if (isHovered) {
          ctx.strokeStyle = '#7f7f7f';
          ctx.fillStyle = color;
          this.setHoveredShapeId(drawState.getId());
          this.setHoveredVertice(vertice);
        }
        ctx.fill(controlStartPoint);
        ctx.stroke(controlStartPoint);
      }
    });
  }

  private _getVertice(drawState: BaseToolState, vertice: VericeEnum): verticeModel {
    let coord = this._initialPosition;
    let color = '#E60707FF';

    switch (vertice) {
      case VericeEnum.VERTICE_A:
        coord = drawState.getVerticeA();
        color = '#1df306';
        break;

      case VericeEnum.VERTICE_B:
        coord = drawState.getVerticeB();
        color = '#e6b907';
        break;

      case VericeEnum.VERTICE_C:
        coord = drawState.getVerticeC();
        color = '#9407e6';
        break;

      case VericeEnum.VERTICE_D:
        coord = drawState.getVerticeD();
        color = '#0755e6';
        break;

      case VericeEnum.VERTICE_E:
        coord = drawState.getVerticeE();
        color = '#f66b09';
        break;
    }
    return {
      coord,
      color
    };
  }

  clear() {
    if (!this._mouseIsdown) {
      this.setHoveredVertice(undefined);
      this.setHoveredShapeId(undefined);
    }
    this._ctx?.clearRect(0, 0, this.canvas!.nativeElement.width, this.canvas!.nativeElement.height)
  }

  copyShape(): void {


  }


  getHeveredShapeId(): string | undefined {
    return this._hoveredShapeId;
  }

  setHoveredShapeId(value: string | undefined): void {
    this._hoveredShapeId = value;
  }

  getHoveredVertice(): VericeEnum | undefined {
    return this._hoveredVertice;
  }

  setHoveredVertice(value: VericeEnum | undefined): void {
    this._hoveredVertice = value;
  }

  getSelectedShapeId(): string {
    return this._selectedShapeId;
  }

  setSelectedShapeId(value: string) {
    this._selectedShapeId = value;
  }

  private _getCursorPosition(): IPointModel {
    return this._cursorPosition;
  }

  private _setCursorPosition(value: IPointModel) {
    this._cursorPosition = value;
  }

}
