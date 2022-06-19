"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/msg/optionSet",
    handler({ headers: { __token: { username }, }, body: { form: { mail, msgs, expire, file_control }, insert, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (insert) {
                yield database_1.pgsql.insert({
                    table: (0, tables_1.getTable)("msg_control"),
                    data: [
                        {
                            mail,
                            msgs,
                            expire,
                            file_control,
                            username,
                        },
                    ],
                });
            }
            else {
                yield database_1.pgsql.query(`update ?? set mail = ?, msgs = ?, expire = ?, file_control = ? where username = ?`, [(0, tables_1.getTable)("msg_control"), mail, msgs, expire, file_control, username]);
            }
            return [];
        });
    },
};
exports.default = index;
