"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const getCheckValList_1 = require("./getCheckValList");
const index = {
    method: "POST",
    url: "/check/getCheckValListCount",
    handler({ body: { status } }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield (0, getCheckValList_1.getCheckValListCount)({ status });
        });
    },
};
exports.default = index;
