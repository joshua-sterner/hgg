function makeDiv(x, y, w, h, label) {
    let div = document.createElement("div");
    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.width = w + "px";
    div.style.height = h + "px";
    div.classList.add("widget");
    div.innerHTML = label;
    document.getElementById("widgets").appendChild(div);
    return div;
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

var widgets = [panel, a, b, c];

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
c.above.push(a);
c.below.push(panel);
c.parent = panel;

panel.children.push(c);
panel.children.push(b);
panel.children.push(a);
panel.x0 = 0;
panel.x1 = panel.x0 + panel.width;
panel.y0 = 0;
panel.y1 = panel.y0 + panel.height;

function findRootWidget() {
    let root = null;
    widgets.forEach((widget) => {
        if (!widget.parent) {
            if (!root) {
                root = widget;
            } else {
                alert("Multiple top-level widgets detected");
            }
        }
    });
    return root;
}

function drawWidgets() {

    let widgets_element = document.getElementById("widgets");

    widgets_element.innerHTML = "";

    let root = findRootWidget();
    if (!root) {
        return;
    }
    
    widgets.forEach((widget) => {
        if (widget.parent) {
            widget.x0 = null;
            widget.x1 = null;
            widget.y0 = null;
            widget.y1 = null;
        }
    });

    // set widget positions
    root.children.forEach((child) => {
        child.computeX();
        child.computeY();
    });
    let widgets_width = 0;
    let widgets_height = 0;
    widgets.forEach((widget) => {
        widgets_width = Math.max(widgets_width, widget.x0 + widget.width);
        widgets_height = Math.max(widgets_height, widget.y0 + widget.height);
        makeDiv(widget.x0, widget.y0, widget.width, widget.height, widget.label);
    });
    widgets_element.style.width = widgets_width + "px";
    widgets_element.style.height = widgets_height + "px";
    document.body.style.gridTemplateRows = widgets_height + "px auto";

}

function clearWidgetList(widget_list) {
    let to_remove = [];
    for (child of widget_list.children) {
        if (child.classList.contains("widget-list-item") || child.classList.contains("widget-list-space")) {
            to_remove.push(child);
        }
    }
    to_remove.forEach((child) => {
        widget_list.removeChild(child);
    });
}

function removeWidget(widget) {
    widgets = widgets.filter(i => i != widget);
    widgets.forEach((i) => {
        if (i.parent == widget) {
            i.parent = null;
        }
        i.children = i.children.filter(j => j != widget);

        if (i.left.length == 1 && i.left[0] == widget) {
            i.left[0] = i.parent;
        } else {
            i.left = i.left.filter(j => j != widget);
        }

        if (i.right.length == 1 && i.right[0] == widget) {
            i.right[0] = i.parent;
        } else {
            i.right = i.right.filter(j => j != widget);
        }
        
        if (i.above.length == 1 && i.above[0] == widget) {
            i.above[0] = i.parent;
        } else {
            i.above = i.above.filter(j => j != widget);
        }

        if (i.below.length == 1 && i.below[0] == widget) {
            i.below[0] = i.parent;
        } else {
            i.below = i.below.filter(j => j != widget);
        }
    });
    processWidgets();
}

function makeWidgetListItem(widget, edit_select, on_remove_click) {
    let item = document.createElement("div");
    item.draggable = true;
    if (edit_select) {
        item.onclick = () => {
            console.log("widget button clicked");
            editWidget(widget);
        };
    }
    item.classList.add("widget-list-item");
    item_text = document.createElement("div");
    item_text.classList.add("widget-list-item-text");
    item_text.innerHTML = widget.label;
    item_remove_button = document.createElement("div");
    item_remove_button.classList.add("widget-list-item-remove");
    item_remove_button.innerHTML = "X";
    item.appendChild(item_text);
    item.appendChild(item_remove_button);
    item_remove_button.onclick = (e) => on_remove_click(e, widget, item);
    return item;
}

function appendWidgetList(dom_element, widget_list, edit_select, on_remove_click) {
    if (widget_list.length == 0) {
        return;
    }
    dom_element.appendChild(makeWidgetListItem(widget_list[0], edit_select, on_remove_click));
    for (let i = 1; i < widget_list.length; i++) {
        let space = document.createElement("span");
        space.classList.add("widget-list-space");
        dom_element.appendChild(space);
        dom_element.appendChild(makeWidgetListItem(widget_list[i], edit_select, on_remove_click));
    }
}

function updateWidgetList(dom_element, widget_list, edit_select, on_remove_click) {
    clearWidgetList(dom_element);
    appendWidgetList(dom_element, widget_list, edit_select, on_remove_click);
}

function processWidgets() {
    drawWidgets();
    let widget_list = document.getElementById("main-widget-list");
    updateWidgetList(widget_list, widgets, true, (e, widget, item) => {
        e.stopPropagation();
        removeWidget(widget);
    });
    let widget_datalist = document.getElementById("widget-datalist");
    widget_datalist.innerHTML = "";
    widgets.forEach((widget) => {
        let i = document.createElement("option");
        i.value = widget.label;
        widget_datalist.appendChild(i);
    });
    if (editing_widget) {
        editWidget(editing_widget);
    }
}

var editing_widget = null;

function updateWidgetLists(widget) {
    updateWidgetList(document.getElementById("widget-editor-children"), widget.children, false, (e, removed_widget) => {
        widget.children = widget.children.filter(i => i != removed_widget);
        removed_widget.parent = null;
        updateWidgetLists(widget);
    });
    updateWidgetList(document.getElementById("widget-editor-left"), widget.left);
    updateWidgetList(document.getElementById("widget-editor-right"), widget.right);
    updateWidgetList(document.getElementById("widget-editor-above"), widget.above);
    updateWidgetList(document.getElementById("widget-editor-below"), widget.below);
}

function findWidget(widget_label) {
    for (i of widgets) {
        if (i.label == widget_label) {
            return i;
        }
    }
    return null;
}

function editWidget(widget) {
    editing_widget = widget;

    const widget_name_field = document.getElementById("widget-name-field");
    widget_name_field.value = widget.label;


    const widget_parent_field = document.getElementById("widget-parent");
    if (!widget.parent) {
        widget_parent_field.value = "";
    } else {
        widget_parent_field.value = widget.parent.label;
    }
    widget_parent_field.onchange = () => {
        widget.parent = findWidget(widget_parent_field.value);
        processWidgets();
    };

    updateWidgetLists(widget);
    const widget_width_field = document.getElementById("widget-width");
    widget_width_field.value = widget.width;
    const widget_height_field = document.getElementById("widget-height");
    widget_height_field.value = widget.height;

    let onchange_function = () => {
        if (widget_name_field.value == widget.label) {
            widget.width = parseInt(widget_width_field.value);
            widget.height = parseInt(widget_height_field.value);
            processWidgets();
        }
    };

    

    widget_width_field.onchange = onchange_function;
    widget_height_field.onchange = onchange_function;
}

window.onload = () => {
    processWidgets();
    if (widgets.length > 0) {
        editWidget(widgets[0]);
    }
}
