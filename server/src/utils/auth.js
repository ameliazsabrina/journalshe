"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenPayload = exports.getUserIdFromToken = void 0;
var cookie_1 = require("hono/cookie");
var jwt = require("jsonwebtoken");
var dotenv = require("dotenv");
dotenv.config();
var JWT_SECRET = process.env.JWT_SECRET;
var getUserIdFromToken = function (c) {
    var _a;
    try {
        var token = (_a = c.req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            token = (0, cookie_1.getCookie)(c, "token");
        }
        console.log("Token extraction debug:", {
            hasAuthHeader: !!c.req.header("Authorization"),
            hasCookie: !!(0, cookie_1.getCookie)(c, "token"),
            tokenFound: !!token,
            tokenLength: (token === null || token === void 0 ? void 0 : token.length) || 0,
        });
        if (!token)
            return null;
        var decoded = jwt.verify(token, JWT_SECRET);
        console.log("Token decoded successfully:", { userId: decoded === null || decoded === void 0 ? void 0 : decoded.userId });
        return (decoded === null || decoded === void 0 ? void 0 : decoded.userId) || null;
    }
    catch (error) {
        console.error("Token verification error:", error);
        return null;
    }
};
exports.getUserIdFromToken = getUserIdFromToken;
var getTokenPayload = function (c) {
    var _a;
    try {
        var token = (_a = c.req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            token = (0, cookie_1.getCookie)(c, "token");
        }
        if (!token)
            return null;
        var decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.getTokenPayload = getTokenPayload;
