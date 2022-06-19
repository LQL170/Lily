"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const database_1 = require("../../../configs/database");
const sys_log_1 = require("../../../configs/sys-log");
const message_1 = require("../../../message");
const convert_1 = require("../../../plugins/convert");
const methods_1 = require("../../../plugins/convert/methods");
const tables_1 = require("../../../plugins/tables");
function rehandle(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!id.length) {
            return;
        }
        const data = yield database_1.pgsql.query(`update ?? set ?? = ?, ?? = ?, ?? = ? where id in (?) RETURNING id, name, ext, c_ext as "cExt"`, [
            (0, tables_1.getTable)("nlp_upload"),
            "status_handle",
            null,
            "status_entity",
            null,
            "status_filetag",
            null,
            id,
        ]);
        data.forEach((x) => {
            const source = path_1.default.join(methods_1.dirOptions.source, x.id, `${x.name}${x.ext}`);
            convert_1.convertTask.add(Object.assign(x, { source }));
        });
    });
}
const index = {
    method: "POST",
    url: "/main/fileAction",
    handler({ body: { id, type }, headers: { __token: { username, user_id }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const table = (0, tables_1.getTable)("nlp_upload");
            const now = new Date();
            if (type === "approval") {
                const data = yield database_1.pgsql.query(`update ?? set ?? = ?, ?? = ?, ?? = ? where id in (?) RETURNING name || ext as name`, [
                    table,
                    "user_approval",
                    username,
                    "approval_timestamp",
                    now,
                    "file_status",
                    type,
                    id,
                ]);
                (0, message_1.addMsg)({
                    type: "release",
                    filesId: id,
                    val: {
                        fileCount: "",
                        fileName: "",
                        username,
                    },
                });
                (0, sys_log_1.logFunc)({
                    key: "file_approval",
                    user_id,
                    username,
                    body: {
                        id,
                        type,
                    },
                    vals: {
                        fileCount: data.length + "",
                        fileName: data
                            .slice(0, 3)
                            .map((x) => x.name)
                            .join(";"),
                    },
                });
            }
            else if (type === "down") {
                const data = yield database_1.pgsql.query(`update ?? set  ?? = ? where id in (?) RETURNING name || ext as name`, [table, "file_status", type, id]);
                (0, message_1.addMsg)({
                    type: "down",
                    filesId: id,
                    val: {
                        fileCount: "",
                        fileName: "",
                        username,
                    },
                });
                (0, sys_log_1.logFunc)({
                    key: "file_down",
                    user_id,
                    username,
                    body: {
                        id,
                        type,
                    },
                    vals: {
                        fileCount: data.length + "",
                        fileName: data
                            .slice(0, 3)
                            .map((x) => x.name)
                            .join(";"),
                    },
                });
            }
            else if (type === "rehandle") {
                yield rehandle(id);
            }
            else if (type === "approval-pre") {
                const data = yield database_1.pgsql.query(`update ?? set  ?? = ? where id in (?) RETURNING name || ext as name`, [table, "file_status", type, id]);
            }
            return "";
        });
    },
};
exports.default = index;
