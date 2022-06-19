"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const getRoleNames_1 = require("./getRoleNames");
const index = {
    method: "POST",
    url: "/login/getRole",
    handler({ headers: { __token: { user_id, username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const data = yield (0, getRoleNames_1.getRoleOrType)({ user_id, username });
            return data;
        });
    },
};
exports.default = index;
