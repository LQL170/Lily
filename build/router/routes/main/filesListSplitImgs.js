"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const url_1 = require("../../../plugins/convert/methods/url");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/main/filesListSplitImgs",
    handler({ body: { id } }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const data = yield database_1.pgsql.query(`select img_id as img, "order", rids from ?? where res_id = ?`, [(0, tables_1.getTable)("nlp_upload_split"), id]);
            return data.map((_a) => {
                var { order, img } = _a, items = tslib_1.__rest(_a, ["order", "img"]);
                return Object.assign(Object.assign({}, items), { order: +order, img: (0, url_1.getStaticSplitUrl)(img) });
            });
        });
    },
};
exports.default = index;
