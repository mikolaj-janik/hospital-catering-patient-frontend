import { Patient } from "./patient";

export class Order {
    constructor(
            public id: number,
            public patient: Patient,
            public totalPrice: number,
            public orderDate: Date
        ){}
}
