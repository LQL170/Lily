"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logjs = exports.getKeys = exports.axios = exports.dayJsformat = exports.path = exports.fse = exports.VerifySign = exports.Jwt = exports.sha256 = exports.fastifyHooks = exports.creatFastify = exports.replyError = void 0;
const fastify_1 = require("@m170/fastify");
const replyError = (key, msg) => {
    return (0, fastify_1.replyError)(key, msg);
};
exports.replyError = replyError;
var fastify_2 = require("@m170/fastify");
Object.defineProperty(exports, "creatFastify", { enumerable: true, get: function () { return fastify_2.creatFastify; } });
Object.defineProperty(exports, "fastifyHooks", { enumerable: true, get: function () { return fastify_2.fastifyHooks; } });
var n_1 = require("@m170/utils/n");
Object.defineProperty(exports, "sha256", { enumerable: true, get: function () { return n_1.sha256; } });
Object.defineProperty(exports, "Jwt", { enumerable: true, get: function () { return n_1.Jwt; } });
Object.defineProperty(exports, "VerifySign", { enumerable: true, get: function () { return n_1.VerifySign; } });
Object.defineProperty(exports, "fse", { enumerable: true, get: function () { return n_1.fse; } });
Object.defineProperty(exports, "path", { enumerable: true, get: function () { return n_1.path; } });
Object.defineProperty(exports, "dayJsformat", { enumerable: true, get: function () { return n_1.dayJsformat; } });
Object.defineProperty(exports, "axios", { enumerable: true, get: function () { return n_1.axios; } });
Object.defineProperty(exports, "getKeys", { enumerable: true, get: function () { return n_1.getKeys; } });
Object.defineProperty(exports, "logjs", { enumerable: true, get: function () { return n_1.logjs; } });
