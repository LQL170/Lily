"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const getCheckValList_1 = require("./getCheckValList");
const index = {
    method: "POST",
    url: "/check/getCheckValListDetail",
    handler({ body: { status, limit, value, type } }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield (0, getCheckValList_1.getCheckValListDetail)({ status, limit, value, type });
        });
    },
};
exports.default = index;
