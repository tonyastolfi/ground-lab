let B_min = 2;
let B_max = 4;

function btree_new() {
    return { elems: [] };
}

function array_upper_bound(a, x) {
    let i = 0;
    for (; i < a.length; ++i) {
        if (a[i].val > x) {
            a[i].ats = ts_now;
            break;
        }
    }
    if (i > 0) {
        a[i-1].ats = ts_now;
    }
    return i;
}

function btree_insert(root, val) {
    let result = btree_node_insert(root, val);
    if (result.done) {
        return root;
    }
    if (result.split) {
        console.log(JSON.stringify(result));
        return {
            elems: [{ val: result.split.min_val, mts: ts_now, ats: ts_now }],
            children: [root, result.split],
            min_val: root.min_val
        };
    }
}

function btree_find_pivots(nodes, update_mts) {
    let elems = [];
    for (var i=1; i < nodes.length; ++i) {
        if (update_mts) {
            elems.push({ val: nodes[i].min_val, mts: ts_now, ats: ts_now });
        } else {
            elems.push({ val: nodes[i].min_val, mts: 0, ats: ts_now });
        }
    }
    return elems;
}

function btree_node_size(node) {
    return node.elems.length + 1;/*
                                   if (node.children) {
                                   return (node.children.length + node.elems.length + 1) / 2;
                                   }
                                   return (node.elems.length + 1) / 2;*/
}

function btree_node_split(node) {
    if (node.children) {
        let split_children = node.children.splice(node.children.length / 2);
        let split_elems = btree_find_pivots(split_children, true);

        node.elems = btree_find_pivots(node.children, true);
        return {
            elems: split_elems,
            children: split_children,
            min_val: split_children[0].min_val
        };
    } else {
        let split_pos = Math.floor(node.elems.length / 2);
        for (var i=0; i<node.elems.length; ++i) {
            node.elems[i].ats = ts_now;
            node.elems[i].mts = ts_now;
        }
        let split_min = node.elems[split_pos].val;
        return {
            elems: node.elems.splice(split_pos),
            min_val: split_min,
        };
    }
}

function btree_node_insert(node, val) {
    console.assert(!node.children || node.elems.length + 1 === node.children.length);

    function compare_child(a, b) {
        if (a.min_val < b.min_val) {
            return -1;
        }
        if (a.min_val > b.min_val) {
            return 1;
        }
        return 0;
    }

    function compare_elem(a, b) {
        if (a.val < b.val) {
            return -1;
        }
        if (a.val > b.val) {
            return 1;
        }
        return 0;
    }

    if (node.children) {
        let pivot = array_upper_bound(node.elems, val);
        let last = pivot === node.elems.length;
        let result = btree_node_insert(node.children[pivot], val);
        if (result.split) {
            console.log(JSON.stringify(result));
            node.children.push(result.split);
            node.children.sort(compare_child);
            node.elems = btree_find_pivots(node.children, false);
            for (var i=0; i<node.elems.length; ++i) {
                if (node.elems[i].val === result.split.min_val) {
                    node.elems[i].mts = ts_now;
                    break;
                }
            }
        }
        if (!node.min_val || node.min_val > node.children[0].min_val) {
            node.min_val = node.children[0].min_val;
        }
    } else {
        node.elems.push({ val: val, mts: ts_now, ats: ts_now });
        node.elems.sort(compare_elem);
        node.min_val = node.elems[0].val;
    }

    if (btree_node_size(node) > B_max) {
        return { split: btree_node_split(node) };
    }
    return { done: true };
}
