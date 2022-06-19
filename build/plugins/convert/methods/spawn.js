"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawnAsync = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const errors_1 = require("./errors");
const split = "*".repeat(20);
function spawnAsync(cmd, args) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve, reject) => {
            const infoMsg = [];
            const errorMsg = [];
            const child = (0, child_process_1.spawn)(cmd, args);
            child.stderr.on("data", (e) => {
                errorMsg.push(e.toString());
            });
            child.stdout.on("data", (e) => {
                infoMsg.push(e.toString());
            });
            child.on("close", (e) => {
                if (e !== 0) {
                    console.log(split, "error", split);
                    console.log(infoMsg.join("\n"));
                    console.log(errorMsg.join("\n"));
                    console.log(split);
                    reject(errors_1.errors["convert-failed"]);
                }
                else {
                    resolve(e);
                }
                infoMsg.length = 0;
                errorMsg.length = 0;
            });
            child.on("error", (e) => {
                console.error(e);
                reject(e);
            });
        });
    });
}
exports.spawnAsync = spawnAsync;
