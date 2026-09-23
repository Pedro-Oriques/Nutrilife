import { Food } from "./food";

export interface Meal {
  id: number;
  type: string;
  foods: Food[];
}
