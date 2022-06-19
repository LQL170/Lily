"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.valueStd = void 0;
const tslib_1 = require("tslib");
const database_1 = require("../configs/database");
const utils_1 = require("../configs/utils");
function handle(str) {
    str = (str || "").trim();
    const data = str.match(/[^A-Z]/);
    if (data) {
        return str.toLowerCase();
    }
    else {
        return str;
    }
}
function getStd() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const std = yield database_1.pgsqlMaster.query(`SELECT std_value, value, type FROM "nlp_mark_result_check"`);
        const repeat = {};
        const repeatR = {};
        std.forEach(({ std_value, value }) => {
            std_value = std_value.trim();
            const a = handle(value);
            const b = handle(std_value);
            repeat[a] = std_value;
            repeat[b] = std_value;
            repeat[std_value] = std_value;
            if (!repeatR[std_value]) {
                repeatR[std_value] = {};
            }
            repeatR[std_value][a] = true;
            repeatR[std_value][b] = true;
            repeatR[std_value][std_value] = true;
        });
        const _repeatR = {};
        Object.keys(repeatR).forEach((x) => {
            _repeatR[x] = Object.keys(repeatR[x]);
        });
        return {
            repeat,
            repeatR: _repeatR,
        };
    });
}
exports.valueStd = (0, utils_1.initCacheData)(getStd, {
    initial: {
        repeat: {},
        repeatR: {},
    },
    callback: {
        std(value) {
            return this.data.repeat[handle(value)] || value;
        },
        stdR(value) {
            return this.data.repeatR[value] || [value];
        },
    },
    label: "std_value",
});
