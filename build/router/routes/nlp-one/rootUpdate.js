"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const path_1 = require("path");
const script = (0, path_1.join)(__dirname, "../../utils/nlp-one", "root-update", "worker.js");
const worker = new n_1.Worker();
let status = false;
function update(id = "") {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (status) {
            return;
        }
        status = true;
        try {
            yield new Promise((resolve) => {
                worker.spawn({
                    name: "更新 add remark",
                    max_old_space_size: 1e6,
                    args: [script, id],
                    dataCallback(msg, type) {
                        console[type](msg);
                    },
                    closeCallback(e) {
                        resolve(e);
                    },
                });
            });
        }
        catch (error) {
            console.error(error);
        }
        finally {
            status = false;
        }
    });
}
const index = {
    method: "POST",
    url: "/nlp-one/rootUpdate",
    handler({ body: { id } }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            update(id);
            return "";
        });
    },
};
exports.default = index;
