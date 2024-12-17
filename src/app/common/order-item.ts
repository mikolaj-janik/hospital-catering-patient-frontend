import { Meal } from "./meal";

export class OrderItem {
    constructor(
                public meal: Meal,
                public date: Date
            ){}
}
