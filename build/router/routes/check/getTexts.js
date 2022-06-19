"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/check/getTexts",
    handler({ body: { rid } }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const data = yield database_1.pgsql.query(`select rid,  content as text from ?? where rid in (?)`, [(0, tables_1.getTable)("nlp_text"), rid]);
            return data;
        });
    },
};
exports.default = index;
