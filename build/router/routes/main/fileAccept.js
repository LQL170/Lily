"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("../../../plugins/convert/methods/utils");
const index = {
    method: "POST",
    url: "/main/fileAccept",
    handler() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return Object.keys(utils_1.extM);
        });
    },
};
exports.default = index;
