"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertTask = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const threads_1 = require("./threads");
const configs_1 = require("../../configs");
class ConvertTask {
    constructor(worker = 10) {
        this.tasks = [];
        this.worker = worker;
        this.label = "ConvertTask: ";
        this.counts = {
            worker,
            all: 0,
            done: 0,
            time: (0, configs_1.getNow)(),
            duration: 0,
        };
    }
    convert({ task }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { id, ext, source, cExt } = task;
            yield (0, threads_1.threadsFunc)({ id, ext, source, cExt });
            return task;
        });
    }
    handle() {
        if (this.worker > 0) {
            this.worker -= 1;
            const item = this.tasks.shift();
            if (!item) {
                this.worker += 1;
                return;
            }
            this.convert(item)
                .then(item.resolve)
                .catch(item.reject)
                .finally(() => {
                this.worker += 1;
                this.counts.done += 1;
                const now = (0, configs_1.getNow)();
                this.counts.duration += now - this.counts.time;
                this.counts.time = now;
                this.log();
                this.handle();
            });
        }
    }
    add(task) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.tasks.length) {
                    this.counts.time = (0, configs_1.getNow)();
                }
                this.tasks.push({
                    resolve,
                    reject,
                    task,
                });
                this.counts.all += 1;
                configs_1.logger.log(this.label, "添加", task.name);
                this.handle();
            });
        });
    }
    log() {
        const duration = this.counts.duration;
        const { rss } = process.memoryUsage();
        const msg = {
            剩余工人数: this.worker,
            总任务数: this.counts.all,
            已完成任务数: this.counts.done,
            剩余任务数: this.counts.all - this.counts.done,
            正在进行中的任务: this.counts.worker - this.worker,
            已完成总耗时: (0, configs_1.handleTime)(duration),
            已完成均耗时: (0, configs_1.handleTime)(duration / this.counts.done),
            内存: (rss / Math.pow(2, 30)).toFixed(3) + "GB",
        };
        configs_1.logger.log((0, n_1.getKeys)(msg)
            .map((x) => `${x}：${msg[x]}`)
            .join("; "));
    }
}
exports.convertTask = new ConvertTask(10);
