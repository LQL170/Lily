"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAtc = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const database_1 = require("../../../../configs/database");
const utils_1 = require("./utils");
function arr(key) {
    const list = key.match(/\d+|[A-Z]/g) || [];
    const arr = [];
    for (let i = 1; i <= list.length; i++) {
        arr.push(list.slice(0, i).join(""));
    }
    return arr;
}
function getAtcTwo() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsqlMaster.query(`SELECT "ATC_code" as id, value, mainitem FROM "atc"`);
        const obj = {};
        data.forEach(({ id, value, mainitem }) => {
            const isRoot = +mainitem === 1;
            if (!obj[id]) {
                obj[id] = {
                    main: "",
                    alias: [],
                };
            }
            const val = (0, utils_1.handleStr)(value);
            obj[id].alias.push(val);
            if (isRoot) {
                obj[id].main = val;
            }
        });
        return obj;
    });
}
function getAtcOne() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fields = [
            "ATCV Code",
            "ATCV CN",
            "ATCV EN",
            "ATCIV Code",
            "ATCIV CN",
            "ATCIV EN",
            "ATCIII Code",
            "ATCIII CN",
            "ATCIII EN",
            "ATCII Code",
            "ATCII CN",
            "ATCII EN",
            "ATCI Code",
            "ATCI CN",
            "ATCI EN",
        ];
        const res = yield database_1.pgsqlMaster.query(`select ?? from drug_atc`, [fields]);
        const obj = {};
        function min(x, _key) {
            const key = `${_key} Code`;
            const cn = `${_key} CN`;
            const en = `${_key} EN`;
            const CN = (0, utils_1.handleStr)(x[cn]);
            const EN = (0, utils_1.handleStr)(x[en]);
            obj[x[key]] = {
                main: CN || EN,
                alias: [CN, EN].filter((x) => x),
            };
        }
        res.forEach((x) => {
            min(x, "ATCI");
            min(x, "ATCII");
            min(x, "ATCIII");
            min(x, "ATCIV");
            min(x, "ATCV");
        });
        return obj;
    });
}
function getAtc() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const items = yield Promise.all([getAtcOne(), getAtcTwo()]);
        const obj = {};
        items.forEach((x) => {
            Object.keys(x).forEach((e) => {
                e = (e || "").trim();
                if (!e) {
                    return;
                }
                if (!obj[e]) {
                    obj[e] = x[e];
                }
                else {
                    const { main, alias } = x[e];
                    obj[e].main = obj[e].main || main;
                    obj[e].alias.push(...alias);
                }
            });
        });
        Object.keys(obj).forEach((x) => {
            obj[x].alias = (0, n_1.arrUnique)(obj[x].alias, true);
            obj[x].main = obj[x].main || obj[x].alias[0];
        });
        const data = obj;
        const main = (0, n_1.arrConcatSet)(Object.keys(data).map((x) => {
            const { alias, main } = data[x];
            return alias.map((value) => {
                return {
                    id: x,
                    value: (0, utils_1.handleStr)(value),
                    mainitem: value === main ? "1" : "0",
                };
            });
        }));
        return main;
    });
}
exports.getAtc = getAtc;
