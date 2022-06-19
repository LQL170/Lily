"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const packages_1 = require("../../../packages");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/feedback/submit",
    handler({ body, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const type = body.type.trim();
            const text = body.text.trim();
            if (type && text) {
                yield database_1.pgsql.insert({
                    table: (0, tables_1.getTable)("feedback_logs"),
                    data: [
                        {
                            type,
                            text,
                            username,
                        },
                    ],
                });
                return "";
            }
            return (0, packages_1.replyError)("1", "不合法的输入");
        });
    },
};
exports.default = index;
