"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const getGroup_1 = require("./getGroup");
const index = {
    method: "POST",
    url: "/login/getGroupNames",
    handler({ headers: { __token: { user_id, username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const data = yield (0, getGroup_1.getGroupOrType)({ user_id, username }, true);
            return data;
        });
    },
};
exports.default = index;
