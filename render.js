let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let level_margin_px = 64;
let node_height_px = 32;
let node_font = "26px sans-serif";
let node_padding_px = 8;
let node_margin_px = 4;

function measureNodeAsBtree(node) {
    ctx.font = node_font;
    
    let w = node_padding_px * 2;
    let h = node_height_px;
    if (node.children) {
        for (var i=0; i<node.children.length; ++i) {
            if (i < node.elems.length) {
                let m = ctx.measureText(node.elems[i].toString());
                w += m.width;
            }
            w += node_padding_px * 2;
        }
    } else {
        for (var i=0; i<node.elems.length; ++i) {
            let m = ctx.measureText(node.elems[i].toString());
            w += m.width + node_padding_px * 2;
        }
    }
    
    if (node.children) {
        let bound_w = 0;
        let bound_h = 0;
        
        for (var i=0; i<node.children.length; ++i) {
            let child_m = measureNodeAsBtree(node.children[i]);
            bound_w += node_margin_px + child_m.bound_w;
            bound_h = Math.max(h + node_height_px + child_m.bound_h, bound_h);
        }
        
        return { w: w, h: h, bound_w: Math.max(bound_w, w), bound_h: bound_h };
    } else {
        return { w: w, h: h, bound_w: w, bound_h: h };
    }
}

function drawNodeAsBtree(x, y, node, leaf_x) {
    ctx.font = node_font;
    
    let node_m = measureNodeAsBtree(node);
    let elems = node.elems;
        
    if (node.children) {
        let elem_x = x - node_m.w / 2;
        let child_x = x - node_m.bound_w / 2;
        let child_y = y + node_height_px + level_margin_px;
        for (var i=0; i<node.children.length; ++i) {
            let child_m = measureNodeAsBtree(node.children[i]);
            ctx.beginPath();
            ctx.moveTo(elem_x + node_padding_px, y + node_height_px);
            ctx.lineTo(child_x + child_m.bound_w / 2 - node_margin_px * 2, child_y);
            ctx.stroke();
            
            drawNode(child_x + child_m.bound_w / 2, child_y, node.children[i], leaf_x);

            ctx.fillStyle = "#656565";
            ctx.strokeStyle = "black";
            ctx.fillRect(elem_x, y, node_padding_px * 2, node_height_px);
            elem_x += node_padding_px * 2;

            if (i < node.elems.length) {
                let m = ctx.measureText(elems[i].toString());
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.fillRect(elem_x, y, m.width + node_padding_px * 2, node_m.h);
                ctx.strokeRect(elem_x, y, m.width + node_padding_px * 2, node_m.h);
                ctx.fillStyle = "black";
                ctx.fillText(elems[i].toString(), elem_x + node_padding_px, y + node_height_px - node_padding_px);
                leaf_x.push(elem_x + node_padding_px + m.width / 2);
                elem_x += m.width + node_padding_px * 2;
            }
            
            child_x += node_margin_px * 2 + child_m.bound_w;
        }
    } else {
        let elem_x = x - node_m.w / 2;
        for (var i=0; i<elems.length; ++i) {
            let m = ctx.measureText(elems[i].toString());
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.fillRect(elem_x, y, m.width + node_padding_px * 2, node_m.h);
            ctx.strokeRect(elem_x, y, m.width + node_padding_px * 2, node_m.h);
            ctx.fillStyle = "black";
            ctx.fillText(elems[i].toString(), elem_x + node_padding_px, y + node_height_px - node_padding_px);
            leaf_x.push(elem_x + node_padding_px + m.width / 2);
            elem_x += m.width + node_padding_px * 2;
        }
    }
}

function measureNodeAsRedBlack(x, y, node) {
}

function drawRedBlackNode(leaf_x, y, node, parent) {
    if (!node) {
        return 0;
    }

    let left_x = 0;
    if (node.left) {
        left_x = drawRedBlackNode(leaf_x, y + level_margin_px / 2, node.left, node);
    }
    
    let x = leaf_x.shift();

    ctx.strokeStyle = "black";

    if (node.left) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(left_x, y + level_margin_px / 2);
        ctx.stroke();

        if (node.left.black) {
            ctx.fillStyle = "black";
        } else {
            ctx.fillStyle = "red";        
        }
        ctx.beginPath();
        ctx.ellipse(left_x, y + level_margin_px / 2, 12, 12, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    if (node.right) {
        let right_x = drawRedBlackNode(leaf_x, y + level_margin_px / 2, node.right, node);
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(right_x, y + level_margin_px / 2);
        ctx.stroke();

        if (node.right.black) {
            ctx.fillStyle = "black";
        } else {
            ctx.fillStyle = "red";        
        }
        ctx.beginPath();
        ctx.ellipse(right_x, y + level_margin_px / 2, 12, 12, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    if (!parent) {
        if (node.black) {
            ctx.fillStyle = "black";
        } else {
            ctx.fillStyle = "red";        
        }
        ctx.beginPath();
        ctx.ellipse(x, y, 12, 12, 0, 0, 2 * Math.PI);
        ctx.fill();        
    }

    return x;
}

let drawNode = drawNodeAsBtree;

function drawScene(root, rb_root) {
    let grd = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 100, 
        canvas.width / 2, canvas.height / 2, 1000
    );
    grd.addColorStop(0, '#b0bbb0');
    grd.addColorStop(1, '#808888');
    
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let leaf_x = [];
    drawNode(canvas.width / 2, 150, root, leaf_x);

    drawRedBlackNode(leaf_x, 600, rb_root, null);
}
