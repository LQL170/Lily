"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemp = exports.getId = exports.extM = exports.dirOptions = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const cache_1 = require("../../../cache");
const static_1 = require("../../../configs/static");
const errors_1 = require("./errors");
var static_2 = require("../../../configs/static");
Object.defineProperty(exports, "dirOptions", { enumerable: true, get: function () { return static_2.dirOptions; } });
exports.extM = (() => {
    const obj = {
        ".pptx": [".ppt"],
        ".xlsx": [".xls"],
        ".docx": [".doc"],
        ".jpg": [".jpeg"],
        ".txt": [],
        ".pdf": [],
        ".png": [],
        ".video": [
            ".aac",
            ".ac3",
            ".mp3",
            ".aiff",
            ".flac",
            ".m4a",
            ".ogg",
            ".opus",
            ".wma",
            ".wav",
            ".wmv",
            ".avi",
            ".dat",
            ".mpeg",
            ".mpg",
            ".asf",
            ".mp4",
            ".ts",
            ".m2ts",
            ".flv",
            ".mov",
            ".mkv",
        ],
    };
    const temp = {};
    (0, n_1.getKeys)(obj).forEach((x) => {
        temp[x] = x;
        obj[x].forEach((key) => {
            temp[key] = x;
        });
    });
    return temp;
})();
function getId(file) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { base: fileName, ext, name } = n_1.path.parse(file);
        const cExt = exports.extM[ext];
        if (!cExt) {
            throw errors_1.errors["no-support"];
        }
        const id = (0, n_1.md5)(new Date().getTime() + Math.random() + fileName);
        if (yield n_1.fse.pathExists(n_1.path.join(static_1.dirOptions.source, id))) {
            return yield getId(file);
        }
        return {
            id,
            cExt,
            name,
            ext,
        };
    });
}
exports.getId = getId;
function getTemp(prefix = "") {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return yield cache_1.tempDirCache.get(prefix);
    });
}
exports.getTemp = getTemp;
