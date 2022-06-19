"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index = {
    method: "POST",
    url: "/check/getTypes",
    handler({ body }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return ["疾病", "药品", "检查"];
        });
    },
};
exports.default = index;
