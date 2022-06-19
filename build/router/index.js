"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callback = exports.routes = void 0;
const utils_1 = require("./utils");
const packages_1 = require("../packages");
const path_1 = require("path");
exports.routes = {
    prefix: "/api",
    dir: (0, path_1.join)(__dirname, "routes"),
    log: false,
};
const callback = (fastify) => {
    fastify.addHook("preHandler", (req, reply, done) => {
        const data = (0, utils_1.authentication)(req);
        if (data) {
            reply.send(data);
        }
        else {
            done();
        }
    });
    packages_1.fastifyHooks.preSerialization(fastify);
    packages_1.fastifyHooks.setErrorHandler(fastify);
};
exports.callback = callback;
