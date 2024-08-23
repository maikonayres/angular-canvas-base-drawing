import { v4 as uuidv4 } from "uuid";
import { IPointModel } from "../../../model/i-point.model";
import { ParamsModel } from "../../../model/params.model";
import { StateEnum } from "../../../enums/state.enum";
import { VericeEnum } from "../../../enums/verice.enum";

export class BaseToolState {

  private readonly _initialPosition: IPointModel = {
    x: -1000,
    y: -1000,
  }
  private readonly DISPLACEMENT = 60;

  private _id: string = '';
  private _mouseIsDown = false;
  private _isPristine = true;
  private _state = StateEnum.IDLE;
  private _degrees = 0;

  private _maxWidth = 0;
  private _maxHeight = 0;

  private _startPoint = this._initialPosition;
  private _startPointBuffer = this._initialPosition;

  private _endPoint = this._initialPosition;
  private _endPointBuffer = this._initialPosition;

  private _startPointDrag = this._initialPosition;

  private _verticeA = this._initialPosition;
  private _verticeB = this._initialPosition;
  private _verticeC = this._initialPosition;
  private _verticeD = this._initialPosition;
  private _verticeE = this._initialPosition;
  private _selectedvertice: VericeEnum | undefined = undefined;

  constructor(ctx: CanvasRenderingContext2D) {
    this._id = this._generateId();
    this._setMaxWidth(ctx.canvas.width);
    this._setMaxHeight(ctx.canvas.height);
  }

  triggerMouseDown(point: IPointModel, params: ParamsModel) {
    if (params.selectedShapeId === this.getId()) {
      this._setMouseIsDown(true);
      if (this.getIsPristine()) {
        this._setIsPristine(false);
        this._setState(StateEnum.DRAW);

        this._setStartPoint({...point});
        this._setStartPointBuffer({...point});

        this._setEndPoint({...point});
        this._setEndPointBuffer({...point});

        this._setVerticeA({...point});
        this._setVerticeB({...point});
        this._setVerticeC({...point});
        this._setVerticeD({...point});
        this._setVerticeE({...point});

      } else {
        this._setSelectedvertice(params.hoveredVertice);

        if (params.hoveredVertice === undefined) {
          this._setStartPointDrag({...point});
          this._setState(StateEnum.DRAG);
          return;
        }

        if (params.hoveredVertice === VericeEnum.VERTICE_A) {
          console.log('edit ', this._geSelectedvertice(), this.getVerticeA());
          this._setState(StateEnum.EDIT);
          return;
        }

        if (params.hoveredVertice === VericeEnum.VERTICE_B) {
          console.log('edit ', this._geSelectedvertice(), this.getVerticeB());
          this._setState(StateEnum.EDIT);
          return;
        }

        if (params.hoveredVertice === VericeEnum.VERTICE_C) {
          console.log('edit ', this._geSelectedvertice(), this.getVerticeC());
          this._setState(StateEnum.EDIT);
          return;
        }

        if (params.hoveredVertice === VericeEnum.VERTICE_D) {
          console.log('edit ', this._geSelectedvertice(), this.getVerticeD());
          this._setState(StateEnum.EDIT);
          return;
        }

        if (params.hoveredVertice === VericeEnum.VERTICE_E) {
          console.log('edit ', this._geSelectedvertice(), this.getVerticeE());
          this._setState(StateEnum.ROTATE);
          return;
        }
      }
    }
  }

  setToIdle() {
    this._setState(StateEnum.IDLE);
  }

  private _setVertices(): void {

    const middleX = (this._getStartPoint().x + this._getEndPoint().x) / 2;
    const middleY = (this._getStartPoint().y + this._getEndPoint().y) / 2;

    const verticeA = this._rotatePoint(
      this._getStartPoint().x,
      this._getStartPoint().y,
      middleX,
      middleY,
      -this._getDegrees()
    );
    this._setVerticeA({...verticeA});

    const verticeB = this._rotatePoint(
      this._getEndPoint().x,
      this._getEndPoint().y,
      middleX,
      middleY,
      -this._getDegrees()
    );
    this._setVerticeB({...verticeB});

    const verticeC = this._rotatePoint(
      this._getStartPoint().x,
      this._getEndPoint().y,
      middleX,
      middleY,
      -this._getDegrees()
    );
    this._setVerticeC({...verticeC});

    const verticeD = this._rotatePoint(
      this._getEndPoint().x,
      this._getStartPoint().y,
      middleX,
      middleY,
      -this._getDegrees()
    );

    this._setVerticeD({...verticeD});

    const direction = this._direction(this._getEndPoint().y, this._getStartPoint().y);

    const verticeE = this._rotatePoint(
      middleX,
      (direction >= 0 ? this._getStartPoint().y : this._getEndPoint().y) - this.DISPLACEMENT,
      middleX,
      middleY,
      -this._getDegrees()
    );

    this._setVerticeE({...verticeE});
  }

  private _direction(startPoint: number, endPoint: number): number {
    const direction = Math.pow(startPoint, 1) - Math.pow(endPoint, 1);
    return (direction >= 0) ? 1 : -1;
  }


  triggerMouseMove(point: IPointModel) {
    if (this.getMouseIsDown()) {

      if ((this.getState() === StateEnum.DRAW)) {
        this._setEndPointBuffer({...point});
        this._setEndPoint({...point});
        this._setVertices();
        return;
      }

      if (this.getState() === StateEnum.DRAG) {
        this._calculateNewStartPointDrag({...point});
        this._calculateNewEndPointDrag({...point});
        this._setVertices();
        return;
      }

      if (this.getState() === StateEnum.ROTATE) {
        const middlePoint = {
          x: (this._getStartPoint().x + this._getEndPoint().x) / 2,
          y: (this._getStartPoint().y + this._getEndPoint().y) / 2
        }
        const angle = this._getAngleBetweenLines({...middlePoint}, {...point});
        this._setDegrees(this.clamp(-angle, -90, 90));
        this._setVertices();
      }

      if (this.getState() === StateEnum.EDIT) {
        console.log('edit ', this._geSelectedvertice());
      }
    }
  }

  private _getAngleBetweenLines(a: IPointModel, b: IPointModel, infinite = false): number {
    const deltaY = b.y - a.y;
    const deltaX = b.x - a.x;
    const angleInRadians = Math.atan2(deltaY, deltaX);
    const angle = (angleInRadians * (180 / Math.PI) + 90);
    if (infinite) {
      return angle;
    }
    const direction = this._direction(a.x, b.x);
    if (direction > 0) {
      if (angle > 90) {
        return -90
      }
    }
    return angle;
  }

  triggerMouseUp(point: IPointModel) {
    this._setMouseIsDown(false);

    if ((this.getState() === StateEnum.DRAW)) {
      this._setEndPointBuffer({...point});
      this._setEndPoint({...point});

      this._setVertices();
      this._setState(StateEnum.IDLE);
      return;
    }

    if ((this.getState() === StateEnum.DRAG)) {
      this._calculateNewStartPointDrag({...point});
      this._calculateNewEndPointDrag({...point});
      this._setStartPointBuffer({...this._getStartPoint()});
      this._setEndPointBuffer({...this._getEndPoint()});
      this._setVertices();
      this._setState(StateEnum.IDLE);
      return;
    }

    if ((this.getState() === StateEnum.ROTATE)) {
      this._setVertices();
      this._setState(StateEnum.IDLE);
      return;
    }

    if ((this.getState() === StateEnum.EDIT)) {
      this._setVertices();
      this._setState(StateEnum.IDLE);
      return;
    }

    this._setVertices();
    this._setState(StateEnum.IDLE);
  }

  private _calculateNewStartPointDrag(point: IPointModel): void {
    const deltaStartX = point.x - this._getStartPointDrag().x;
    const deltaStartY = point.y - this._getStartPointDrag().y;
    const startPoint = {
      x: this._getStartPointBuffer().x + deltaStartX,
      y: this._getStartPointBuffer().y + deltaStartY,
    };
    this._setStartPoint({...startPoint});
  }

  private _calculateNewEndPointDrag(point: IPointModel): void {
    const deltaEndX = point.x - this._getStartPointDrag().x;
    const deltaEndY = point.y - this._getStartPointDrag().y;
    const endPoint = {
      x: this._getEndPointBuffer().x + deltaEndX,
      y: this._getEndPointBuffer().y + deltaEndY,
    };
    this._setEndPoint({...endPoint})
  }

  clamp(val: number, min: number, max: number) {
    if (val > max) {
      console.log('max')
      return max;
    }
    if (val < min) {
      console.log('min')
      return min;
    }
    return val
    // return val > max ? max : val < min ? min : val;
  }

  private _rotatePoint(x: number, y: number, cx: number, cy: number, angle: number) {
    var radian = (angle * Math.PI) / 180;
    var xRotated = cx + (x - cx) * Math.cos(radian) - (y - cy) * Math.sin(radian);
    var yRotated = cy + (x - cx) * Math.sin(radian) + (y - cy) * Math.cos(radian);
    return {x: xRotated, y: yRotated};
  }

  getId(): string {
    return this._id;
  }

  private _setStartPoint(value: IPointModel) {
    this._startPoint = value;
  }

  private _getStartPoint(): IPointModel {
    return this._startPoint;
  }

  private _getEndPoint(): IPointModel {
    return this._endPoint;
  }

  private _setEndPoint(value: IPointModel) {
    this._endPoint = value;
  }

  private _getStartPointDrag(): IPointModel {
    return this._startPointDrag;
  }

  private _setStartPointDrag(value: IPointModel) {
    this._startPointDrag = value;
  }

  private _getEndPointBuffer(): IPointModel {
    return this._endPointBuffer;
  }

  private _setEndPointBuffer(value: IPointModel) {
    this._endPointBuffer = value;
  }

  private _getStartPointBuffer(): IPointModel {
    return this._startPointBuffer;
  }

  private _setStartPointBuffer(value: IPointModel) {
    this._startPointBuffer = value;
  }

  getState(): StateEnum {
    return this._state;
  }

  private _setState(value: StateEnum) {
    this._state = value;
  }

  getIsPristine(): boolean {
    return this._isPristine;
  }

  private _setIsPristine(value: boolean) {
    this._isPristine = value;
  }

  getMouseIsDown(): boolean {
    return this._mouseIsDown;
  }

  private _setMouseIsDown(value: boolean) {
    this._mouseIsDown = value;
  }

  private _generateId(): string {
    return uuidv4();
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

  private _geSelectedvertice(): VericeEnum | undefined {
    return this._selectedvertice;
  }

  private _setSelectedvertice(value: VericeEnum | undefined) {
    this._selectedvertice = value;
  }

  private _getDegrees(): number {
    return this._degrees;
  }

  private _setDegrees(value: number) {
    this._degrees = value;
  }

  private _getMaxWidth(): number {
    return this._maxWidth;
  }

  private _setMaxWidth(value: number) {
    this._maxWidth = value;
  }

  private _getMaxHeight(): number {
    return this._maxHeight;
  }

  private _setMaxHeight(value: number) {
    this._maxHeight = value;
  }
}
