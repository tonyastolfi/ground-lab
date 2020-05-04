function black_new(left, right) {
    let cached_black_height = 1;
    let cached_size = 1;
    if (left) {
        cached_size += left.cached_size;
        cached_black_height = 1 + left.cached_black_height;
        if (right) {
            console.assert(left.cached_black_height === right.cached_black_height, JSON.stringify({left: left, right: right}));
        }
    }
    if (right) {
        cached_size += right.cached_size;
        cached_black_height = 1 + right.cached_black_height;
    }
    return {
        black: true,
        left: left,
        right: right,
        cached_size: cached_size,
        cached_black_height: cached_black_height,
    };
}

function red_new(left, right) {
    let cached_black_height = 0;
    let cached_size = 1;
    if (left) {
        cached_size += left.cached_size;
        cached_black_height = left.cached_black_height;
        if (right) {
            console.assert(left.cached_black_height === right.cached_black_height, JSON.stringify({left: left, right: right}));
        }
    }
    if (right) {
        cached_size += right.cached_size;
        cached_black_height = right.cached_black_height;
    }
    return {
        black: false,
        left: left,
        right: right,
        cached_size: cached_size,
        cached_black_height: cached_black_height,
    };
}

function btree_to_red_black(root) {
    if (root.children) {
        if (root.children.length == 2) {
            return black_new(
                btree_to_red_black(root.children[0]),
                btree_to_red_black(root.children[1])
            );
        } else if (root.children.length == 3) {
            return black_new(
                red_new(
                    btree_to_red_black(root.children[0]),
                    btree_to_red_black(root.children[1])
                ),
                btree_to_red_black(root.children[2])
            );                
        } else if (root.children.length == 4) {
            return black_new(
                red_new(
                    btree_to_red_black(root.children[0]),
                    btree_to_red_black(root.children[1])
                ),
                red_new(
                    btree_to_red_black(root.children[2]),
                    btree_to_red_black(root.children[3])
                )
            );
        }
    } else {
        if (root.elems.length == 0) {
            return null;
        } else if (root.elems.length == 1) {
            return black_new(null, null);
        } else if (root.elems.length == 2) {
            return black_new(
                red_new(null, null),
                null
            );
        } else if (root.elems.length == 3) {
            return black_new(
                red_new(null, null),
                red_new(null, null)
            );
        }
        throw new Error();
    }
}
