export class Roulette {
    items: Array<number> = [
        0, -1, 50, 100, 300, 200, 400, 500, 1000,
        0, -1, 50, 100, 200, 300, 400, 500, 1000,
    ];

    spin(): number {
        let valor: number = Math.floor(Math.random() * this.items.length);
        console.log(valor)
        return this.items[valor];
    }
}


// let r1 = new Roulette()

// console.log(r1.spin());
// console.log(r1.spin());
// console.log(r1.spin());
// console.log(r1.spin());
// console.log(r1.spin());