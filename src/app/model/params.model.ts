import { VericeEnum } from "../enums/verice.enum";

export interface ParamsModel {
  selectedShapeId: string | undefined;
  hoveredShapeId: string | undefined;
  hoveredVertice: VericeEnum | undefined;
}

