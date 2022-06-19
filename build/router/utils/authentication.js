"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = exports.jwt = void 0;
const packages_1 = require("../../packages");
const configs_1 = require("../../configs");
exports.jwt = new packages_1.Jwt({
    secret: configs_1.jwtSecret,
    expiresIn: "2h",
});
const verifySign = new packages_1.VerifySign(configs_1.jwtSecret);
const exceptToken = ["/api/login/"];
const exceptSign = ["/api/login/"];
function authentication({ body: data, url, headers }) {
    try {
        data = data || {};
        if (!exceptToken.includes(url)) {
            const { token, signature } = headers;
            if (token) {
                headers.__token = exports.jwt.verify(headers.token);
            }
            else {
                return (0, packages_1.replyError)("403");
            }
            if (signature && !exceptSign.includes(url)) {
                const status = verifySign.verify({ data, token, signature });
                if (!status) {
                    return (0, packages_1.replyError)("401");
                }
            }
        }
        return;
    }
    catch (error) {
        return (0, packages_1.replyError)("403");
    }
}
exports.authentication = authentication;
