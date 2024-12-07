import { Meal } from "./meal";

export class CartItem {
    constructor(
        public date: Date,
        public meal: Meal
    ) {}
}
