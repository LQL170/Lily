"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newTaskUpdate = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const database_1 = require("../../configs/database");
const tables_1 = require("../tables");
function newTaskUpdate(id, status) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const updateStr = [];
        const updateP = [];
        (0, n_1.getKeys)(status).forEach((x) => {
            var _a;
            updateStr.push("?? = ?");
            updateP.push('status_' + x, +((_a = status[x]) !== null && _a !== void 0 ? _a : false));
        });
        yield database_1.pgsql.query(`update ?? set ${updateStr.join()} where id = ?`, [
            (0, tables_1.getTable)("nlp_upload"),
            ...updateP,
            id,
        ]);
    });
}
exports.newTaskUpdate = newTaskUpdate;
