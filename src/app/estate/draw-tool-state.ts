import { StateEnum } from "../enums/state.enum";
import { IPointModel } from "../model/i-point.model";
import { v4 as uuidv4 } from 'uuid';
import { ParamsModel } from "../model/params.model";
import { VericeEnum } from "../enums/verice.enum";

export class DrawToolState {


  private readonly DISPLACEMENT = 60;
  private readonly defaultPoint: IPointModel = {
    x: -1, y: -1
  };

  private _id: string = '';
  private _width = 0;
  private _height = 0;
  private _isPristine = true;
  private _isHovered = false;


  degrees = 0;
  private _centerPoint: IPointModel = this.defaultPoint;

  private _mouseIsDown = false;
  private _state = StateEnum.IDLE;

  private _startPointDrag = this.defaultPoint;
  private _startPointRotate = this.defaultPoint;

  private _verticeA = this.defaultPoint;
  private _verticeB = this.defaultPoint;
  private _verticeC = this.defaultPoint;
  private _verticeD = this.defaultPoint;
  private _verticeE = this.defaultPoint;

  private _startPoint = this.defaultPoint;
  private _movePoint = this.defaultPoint;
  private _endPoint = this.defaultPoint;

  private _startPointBuffer = this.defaultPoint;
  private _endPointBuffer = this.defaultPoint;

  private _directionX: number = 0;
  private _directionY: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this._id = this._generateId();
    this._setWidth(ctx.canvas.width);
    this._setHeight(ctx.canvas.height);
  }

  private _generateId(): string {
    return uuidv4();
  }

  getId(): string {
    return this._id;
  }

  getMouseIsDown(): boolean {
    return this._mouseIsDown;
  }

  setMouseIsDown(value: boolean) {
    this._mouseIsDown = value;
  }


  amountDisplacement(startPoint: number, endPoint: number): number {
    return Math.pow(startPoint, 1) - Math.pow(endPoint, 1);
  }

  private direction(startPoint: number, endPoint: number): number {
    const direction = Math.pow(startPoint, 1) - Math.pow(endPoint, 1);
    return (direction >= 0) ? 1 : -1;
  }

  triggerMouseDown(value: IPointModel, params: ParamsModel) {
    this.setMouseIsDown(true);
    if (this.getIsPristine()) {
      this._setIsPristine(false);
      this._setState(StateEnum.DRAW);
      this._setEndPoint({...value});
      this._setMovePoint({...value});
      this._setStartPoint({...value});
      this._setVertices();
    } else {
      if (params.selectedShapeId === this.getId()) {

        if (params.hoveredVertice === undefined) {
          this._setStartPointDrag({...value});
          this._setState(StateEnum.DRAG);
        }

        if (params.hoveredVertice === VericeEnum.VERTICE_E) {
          this._setStartPointRotate({...value});
          this._setState(StateEnum.ROTATE);
        }

        this._setVertices();
      }
    }
  }

  triggerMouseUp(value: IPointModel) {

    if ((this.getState() === StateEnum.DRAW)) {
      this._setStartPointBuffer({...this.getStartPoint()});
      this._setEndPointBuffer({...value});
      this._setEndPoint(value);
    }

    if ((this.getState() === StateEnum.DRAG)) {
      this._setStartPointBuffer({...this.getStartPoint()});
      this._setEndPointBuffer({...this.getEndPoint()});
    }

    if ((this.getState() === StateEnum.ROTATE)) {
      this._setStartPointBuffer({...this.getStartPoint()});
      this._setEndPointBuffer({...this.getEndPoint()});
    }

    this.setMouseIsDown(false);
    this._setState(StateEnum.IDLE);
  }

  triggerMouseMove(value: IPointModel) {
    this._setMovePoint({...value});
    if (this.getMouseIsDown()) {


      if (this.getState() === StateEnum.DRAW) {
        this._setEndPoint({...value});
        this._setVertices();
      }

      if (this.getState() === StateEnum.DRAG) {
        this._setNewInitalPoint({...value});
        this._setNewEndPoint({...value});
        this._setVertices();
      }

      if (this.getState() === StateEnum.ROTATE) {
        this._setNewInitalPoint({...value});
        this._setNewEndPoint({...value});
        this._setVerticesRotate(value.x);
      }
    }
  }

  private _setVerticesRotate(value: number): void {
    const directionX = this.amountDisplacement(this.getStartPointRotate().x, value) / 2;
    this.degrees = this.clamp(directionX, -90, 90);
    console.log(this.degrees);

    const verticeA = this._rotatePoint(
      this._getStartPointBuffer().x,
      this._getStartPointBuffer().y,
      this.getCenterPoint().x,
      this.getCenterPoint().y,
      -this.degrees
    );

    const verticeB = this._rotatePoint(
      this._geEendPointBuffer().x,
      this._geEendPointBuffer().y,
      this.getCenterPoint().x,
      this.getCenterPoint().y,
      -this.degrees
    );

    const verticeC = this._rotatePoint(
      this._getStartPointBuffer().x,
      this._geEendPointBuffer().y,
      this.getCenterPoint().x,
      this.getCenterPoint().y,
      -this.degrees
    );

    const verticeD = this._rotatePoint(
      this._geEendPointBuffer().x,
      this._getStartPointBuffer().y,
      this.getCenterPoint().x,
      this.getCenterPoint().y,
      -this.degrees
    );

    this._setVerticeA(verticeA);
    this._setVerticeB(verticeB);
    this._setVerticeC(verticeC);
    this._setVerticeD(verticeD);

    const direction = this.direction(verticeA.y, verticeB.y);

    const verticeE = this._rotatePoint(
      this.getCenterPoint().x,
      this._getStartPointBuffer().y - this.DISPLACEMENT,
      this.getCenterPoint().x,
      this.getCenterPoint().y,
      -this.degrees
    );

    this._setVerticeE(verticeE);

    // this._setVerticeE({
    //   x: this.getCenterPoint().x,
    //   y: (direction >= 0 ? this.getVerticeB().y : this.getVerticeA().y) - this.DISPLACEMENT
    // })

    this._setStartPoint({...verticeA});
    this._setEndPoint({...verticeB});

  }

  private _setVertices(): void {

    const verticeA = this._rotatePoint(
      this.getStartPoint().x,
      this.getStartPoint().y,
      this.getCenterPoint().x,
      this.getCenterPoint().y,
      -this.degrees
    );

    this._setVerticeA(verticeA)

    const verticeB = this._rotatePoint(
      this.getEndPoint().x,
      this.getEndPoint().y,
      this.getCenterPoint().x,
      this.getCenterPoint().y,
      -this.degrees
    );

    this._setVerticeB(verticeB)

    this._setVerticeC({
      x: this.getStartPoint().x,
      y: this.getEndPoint().y
    })

    this._setVerticeD({
      x: this.getEndPoint().x,
      y: this.getStartPoint().y
    })

    const startPoint = this.getStartPoint();
    const endPoint = this.getEndPoint();
    const direction = this.direction(startPoint.y, endPoint.y);


    if (this.getState() !== StateEnum.ROTATE) {
      this._setCenterPoint({
        x: (startPoint.x + endPoint.x) / 2,
        y: (startPoint.y + endPoint.y) / 2,
      })

      this._setVerticeE({
        x: this.getCenterPoint().x,
        y: (direction >= 0 ? this.getVerticeB().y : this.getVerticeA().y) - this.DISPLACEMENT
      })
    }
    this._setStartPoint({...verticeA});
    this._setEndPoint({...verticeB});
  }

  getAngleBetweenLines(a: IPointModel, b: IPointModel): number {
    const deltaY = b.y - a.y;
    const deltaX = b.x - a.x;
    const angleInRadians = Math.atan2(deltaY, deltaX);
    return angleInRadians * (180 / Math.PI);
  }

  private _setNewInitalPoint(value: IPointModel): void {
    const deltaStartX = value.x - this._getStartPointDrag().x;
    const deltaStartY = value.y - this._getStartPointDrag().y;
    const startPoint = {
      x: this._getStartPointBuffer().x + deltaStartX,
      y: this._getStartPointBuffer().y + deltaStartY,
    };
    this._setStartPoint(startPoint)
  }

  private _setNewEndPoint(value: IPointModel): void {
    const deltaEndX = value.x - this._getStartPointDrag().x;
    const deltaEndY = value.y - this._getStartPointDrag().y;
    const endPoint = {
      x: this._geEendPointBuffer().x + deltaEndX,
      y: this._geEendPointBuffer().y + deltaEndY,
    };
    this._setEndPoint(endPoint)
  }


  private _rotatePoint(x: number, y: number, cx: number, cy: number, angle: number) {
    var radian = (angle * Math.PI) / 180;
    var xRotated = cx + (x - cx) * Math.cos(radian) - (y - cy) * Math.sin(radian);
    var yRotated = cy + (x - cx) * Math.sin(radian) + (y - cy) * Math.cos(radian);
    return {x: xRotated, y: yRotated};
  }

  clamp(val: number, min: number, max: number) {
    return val > max ? max : val < min ? min : val;
  }

  private _getStartPointBuffer(): IPointModel {
    return this._startPointBuffer;
  }

  private _setStartPointBuffer(value: IPointModel) {
    this._startPointBuffer = value;
  }

  private _geEendPointBuffer(): IPointModel {
    return this._endPointBuffer;
  }

  private _setEndPointBuffer(value: IPointModel) {
    this._endPointBuffer = value;
  }

  private _getStartPointDrag(): IPointModel {
    return this._startPointDrag;
  }

  private _setStartPointDrag(value: IPointModel) {
    this._startPointDrag = value;
  }

  getStartPointRotate(): IPointModel {
    return this._startPointRotate;
  }

  private _setStartPointRotate(value: IPointModel) {
    this._startPointRotate = value;
  }

  getIsHovered(): boolean {
    return this._isHovered;
  }

  setIsHovered(value: boolean) {
    this._isHovered = value;
  }

  private _setStartPoint(value: IPointModel) {
    this._startPoint = value;
  }

  getStartPoint(): IPointModel {
    return this._startPoint;
  }

  getMovePoint(): IPointModel {
    return this._movePoint;
  }

  private _setMovePoint(value: IPointModel) {
    this._movePoint = value;
  }

  getEndPoint(): IPointModel {
    return this._endPoint;
  }

  private _setEndPoint(value: IPointModel) {
    this._endPoint = value;
  }

  getIsPristine(): boolean {
    return this._isPristine;
  }

  private _setIsPristine(value: boolean) {
    this._isPristine = value;
  }

  private _setWidth(value: number): void {
    this._width = value
  }

  getWidth(): number {
    return this._width;
  }

  private _setHeight(value: number): void {
    this._height = value
  }

  getHeight(): number {
    return this._height;
  }

  getState(): StateEnum {
    return this._state;
  }

  private _setState(value: StateEnum) {
    this._state = value;
  }

  getVerticeA(): IPointModel {
    return this._verticeA;
  }

  private _setVerticeA(value: IPointModel) {
    this._verticeA = value;
  }

  getVerticeB(): IPointModel {
    return this._verticeB;
  }

  private _setVerticeB(value: IPointModel) {
    this._verticeB = value;
  }

  getVerticeC(): IPointModel {
    return this._verticeC;
  }

  private _setVerticeC(value: IPointModel) {
    this._verticeC = value;
  }

  getVerticeD(): IPointModel {
    return this._verticeD;
  }

  private _setVerticeD(value: IPointModel) {
    this._verticeD = value;
  }

  getVerticeE(): IPointModel {
    return this._verticeE;
  }

  private _setVerticeE(value: IPointModel) {
    this._verticeE = value;
  }

  getCenterPoint(): IPointModel {
    return this._centerPoint;
  }

  private _setCenterPoint(value: IPointModel) {
    this._centerPoint = value;
  }
}
