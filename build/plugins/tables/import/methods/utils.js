"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMain = exports.getGraphId = exports.getId = exports.handleStr = void 0;
const n_1 = require("@m170/utils/n");
function handleStr(s) {
    return (s || "").trim();
}
exports.handleStr = handleStr;
function getId(type, value) {
    return (0, n_1.md5)(type + "_###_" + value);
}
exports.getId = getId;
function getGraphId(source, target, graph) {
    return (0, n_1.md5)(source + target + graph);
}
exports.getGraphId = getGraphId;
function getMain({ data, fields, id, valueCallback, mark, _type, }) {
    const repeat = {};
    const main = {};
    data.forEach((item) => {
        if (!main[item[id]]) {
            main[item[id]] = {
                alias: [],
                value: "",
            };
        }
        const temp = main[item[id]];
        const isMain = valueCallback(item);
        fields.forEach((key) => {
            const val = handleStr(item[key]);
            if (val && !repeat[val]) {
                temp.alias.push(val);
                if (isMain && !temp["value"]) {
                    temp["value"] = val;
                }
                repeat[val] = true;
            }
        });
    });
    const res = [];
    Object.keys(main).forEach((x) => {
        const { value, alias } = main[x];
        const val = value || alias[0];
        if (val) {
            res.push({
                id: x,
                value: val,
                alias,
            });
        }
    });
    const map = (0, n_1.arrObject)(res, "value", "alias");
    if (_type === "药品") {
        const mapNot = (() => {
            const obj = {};
            const valM = (0, n_1.arrObject)(res, "id", "value");
            res.forEach((x) => {
                if (x.id.includes("_")) {
                    const id = valM[x.id.split("_")[0]];
                    if (!obj[id]) {
                        obj[id] = {};
                    }
                    x.alias.forEach((e) => {
                        obj[id][e.toLowerCase()] = true;
                    });
                }
            });
            return obj;
        })();
        mark.forEach((x) => {
            var _a;
            const obj = map[x.std_value];
            if (obj) {
                if (!repeat[x.value] && !((_a = mapNot[x.std_value]) === null || _a === void 0 ? void 0 : _a[x.value.toLowerCase()])) {
                    obj.push(x.value);
                    repeat[x.value] = true;
                }
            }
        });
    }
    else {
        mark.forEach((x) => {
            const obj = map[x.std_value];
            if (obj) {
                if (!repeat[x.value]) {
                    obj.push(x.value);
                    repeat[x.value] = true;
                }
            }
        });
    }
    return res;
}
exports.getMain = getMain;
