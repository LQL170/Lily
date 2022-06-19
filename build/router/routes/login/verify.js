"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("./index");
const index = {
    method: "POST",
    url: "/login/verify",
    handler({ headers: { __token: { user_id, username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return {
                routes: yield (0, index_1.getRoutes)({ user_id }),
                user: {
                    user_id,
                    username,
                },
            };
        });
    },
};
exports.default = index;
