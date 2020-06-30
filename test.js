function makeDiv(x, y, w, h, label) {
    let div = document.createElement("div");
    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.width = w + "px";
    div.style.height = h + "px";
    div.classList.add("widget");
    div.innerHTML = label;
    document.body.appendChild(div);
}

class Widget {

    constructor(label, width, height, parent) {
        this.label = label;
        this.width = width;
        this.height = height;
        this.parent = parent;
        this.children = [];
        this.left = [];
        this.right = [];
        this.above = [];
        this.below = [];
    }

    computeX() {
        if (!this.left[0].x1) {
            this.left[0].computeX();
        }
        this.x0 = this.left[0].x1;
        if (this.left[0] == this.parent) {
            this.x0 = this.left[0].x0;
        }
        for (let i = 0; i < this.left.length; i++) {
            if (!this.left[i].x1) {
                this.left[i].computeX();
            }
            if (this.left[i] != this.parent) {
                this.x0 = Math.max(this.x0, this.left[i].x1);
            }
        }
        this.x1 = this.x0 + this.width;
    }

    computeY() {
        if (!this.above[0].y1) {
            this.above[0].computeY();
        }
        this.y0 = this.above[0].y1;
        if (this.above[0] == this.parent) {
            this.y0 = this.above[0].y0;
        }
        for (let i = 0; i < this.above.length; i++) {
            if (!this.above[i].y1) {
                this.above[i].computeY();
            }
            if (this.above[i] != this.parent) {
                this.y0 = Math.max(this.y0, this.above[i].y1);
            }
        }
        this.y1 = this.y0 + this.height;
    }
}

// create widgets
let panel = new Widget("panel", 960, 540);
let a = new Widget("a", 64, 16);
let b = new Widget("b", 32, 48);
let c = new Widget("c", 128, 96);

widgets = [panel, a, b, c];

// set widget relationships
a.left.push(panel);
a.above.push(panel);
a.below.push(panel);
a.right.push(b);
a.parent = panel;

b.left.push(a);
b.right.push(panel);
b.above.push(panel);
b.below.push(panel);
b.parent = panel;

c.left.push(panel);
c.right.push(panel);
c.above.push(panel);
c.above.push(b);
c.above.push(panel);
c.below.push(panel);
c.parent = panel;

panel.children.push(c);
panel.children.push(b);
panel.children.push(a);
panel.x0 = 0;
panel.x1 = panel.x0 + panel.width;
panel.y0 = 0;
panel.y1 = panel.y0 + panel.height;

// set widget positions
panel.children.forEach((child) => {
    child.computeX();
    child.computeY();
});

window.onload = () => {
    widgets.forEach((widget) => {
        makeDiv(widget.x0, widget.y0, widget.width, widget.height, widget.label);
    });
}
