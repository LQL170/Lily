"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrefix = exports.getPrefixByNum = exports.split = exports.prefixSplit = void 0;
exports.prefixSplit = "_";
exports.split = ".";
function getPrefixByNum(num) {
    const base = 65;
    const index = num - base;
    const e = "A".repeat(Math.floor(index / 26));
    const i = index % 26;
    return e + String.fromCharCode(base + i) + exports.prefixSplit;
}
exports.getPrefixByNum = getPrefixByNum;
exports.getPrefix = (() => {
    const obj = {};
    const base = 65;
    let index = 0;
    return (type) => {
        if (!obj[type]) {
            const num = index + base;
            obj[type] = {
                num,
                prefix: getPrefixByNum(num),
            };
            index += 1;
        }
        return obj[type];
    };
})();
