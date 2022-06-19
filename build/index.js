"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
console.log(`process.env.NODE_ENV: `, process.env.NODE_ENV);
const packages_1 = require("./packages");
const configs_1 = require("./configs");
const router_1 = require("./router");
const cache_1 = require("./cache");
function createServer() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const label = "startup";
        console.time(label);
        yield Promise.all([
            cache_1.valueStd.update(),
            cache_1.cacheChartData.update(),
            cache_1.tempDirCache.clearAll(),
        ]);
        yield (0, packages_1.creatFastify)({
            fastify: {
                options: {
                    logger: {
                        level: "error",
                    },
                    trustProxy: true,
                },
                cors: {
                    origin: true,
                },
                routes: router_1.routes,
                callback: router_1.callback,
            },
            configs: {
                listen: configs_1.PORT,
            },
        });
        console.timeEnd(label);
    });
}
createServer();
process.on("uncaughtException", configs_1.logger.error);
process.on("unhandledRejection", configs_1.logger.error);
