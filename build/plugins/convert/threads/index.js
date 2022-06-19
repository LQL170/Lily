"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.threadsFunc = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const func_1 = require("./func");
const configs_1 = require("../../../configs");
function initThreads() {
    const threads = new n_1.Threads({
        script: n_1.path.join(__dirname, "worker.js"),
        func: func_1.worker_threads_func,
        count: 6,
    });
    return threads;
}
function InitThreadsFunc() {
    if (configs_1.isDev) {
        return (...item) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (0, func_1.worker_threads_func)(...item);
        });
    }
    else {
        const worker = initThreads();
        return (...item) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return worker.task(...item);
        });
    }
}
exports.threadsFunc = InitThreadsFunc();
