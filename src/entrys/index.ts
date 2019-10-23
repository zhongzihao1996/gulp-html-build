import shape = require("../lib/shape");
class Circle implements shape.shape {
    public draw(): void {
        console.log("Cirlce is drawn (external module)");
    }
}

let circle = new Circle();
circle.draw();
