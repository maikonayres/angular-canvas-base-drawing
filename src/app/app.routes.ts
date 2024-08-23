import { Routes } from '@angular/router';
import { MainComponent } from "./components/main/main.component";
import { LinesComponent } from "./components/lines/lines.component";
import { SquareComponent } from "./components/square/square.component";
import { RectComponent } from "./components/rect/rect.component";
import { BaseToolComponent } from "./components/base-tool/base-tool.component";

export const routes: Routes = [
  {
    path: '',
    component: BaseToolComponent
  },
  {
    path: '',
    component: RectComponent
  },
  {
    path: 'main',
    component: MainComponent
  },
  {
    path: 'lines',
    component: LinesComponent
  },
  {
    path: 'square',
    component: SquareComponent
  },

];

