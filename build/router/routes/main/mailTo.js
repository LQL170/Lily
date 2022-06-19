"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const methods_1 = require("../../../plugins/convert/methods");
const mailClient = new n_1.Mail({
    host: "smtp.mxhichina.com",
    port: 465,
    auth: {
        user: "data@medomino.com",
        pass: "Md12345!",
    },
});
function get(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const dir = n_1.path.join(methods_1.dirOptions["source"], id);
        const files = yield n_1.fse.readdir(dir);
        const file = n_1.path.join(dir, files[0]);
        return {
            filename: files[0],
            content: n_1.fse.createReadStream(file),
        };
    });
}
const index = {
    method: "POST",
    url: "/main/mailTo",
    handler({ body: { id }, headers: { __token: { user_id }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const mail = yield database_1.pgsql.query(`SELECT mail FROM ?? where id = ? limit 1`, [(0, tables_1.getTable)("users"), user_id]);
            const item = mail[0].mail;
            if (item) {
                const attachments = yield Promise.all(id.map((x) => get(x)));
                try {
                    const res = yield mailClient.send({
                        from: "Medomino <data@medomino.com>",
                        to: item,
                        subject: "导出文档",
                        attachments,
                    });
                    return {
                        msg: `邮件发送成功 ${item}`,
                        mail: item,
                    };
                }
                catch (error) {
                    console.error(error);
                    return {
                        msg: error.message,
                    };
                }
            }
            return {
                msg: "邮箱不存在",
            };
        });
    },
};
exports.default = index;
