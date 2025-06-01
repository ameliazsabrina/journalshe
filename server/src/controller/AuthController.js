"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.profile = exports.login = exports.registerAdmin = exports.registerTeacher = exports.registerStudent = void 0;
var supabase_1 = require("../utils/supabase");
var auth_1 = require("../utils/auth");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var JWT_SECRET = process.env.JWT_SECRET;
var validateRegistrationData = function (data) {
    var username = data.username, email = data.email, fullName = data.fullName, password = data.password, schoolId = data.schoolId, classIds = data.classIds;
    if (!username)
        return "Username is required";
    if (!email)
        return "Email is required";
    if (!fullName)
        return "Full name is required";
    if (!password)
        return "Password is required";
    if (!schoolId)
        return "School ID is required";
    if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
        return "At least one class must be selected";
    }
    return null;
};
var checkUserExists = function (username, email) { return __awaiter(void 0, void 0, void 0, function () {
    var existing;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, supabase_1.supabase
                    .from("User")
                    .select("id")
                    .or("username.eq.".concat(username, ",email.eq.").concat(email))];
            case 1:
                existing = (_a.sent()).data;
                return [2 /*return*/, !!(existing && existing.length > 0)];
        }
    });
}); };
var registerStudent = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, email, fullName, password, schoolId, classIds, validationError, _b, numericClassIds, classId, userExists, passwordHash, _c, newUser, userError, _d, newStudent, studentError, error_1;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, c.req.json()];
            case 1:
                _a = _e.sent(), username = _a.username, email = _a.email, fullName = _a.fullName, password = _a.password, schoolId = _a.schoolId, classIds = _a.classIds;
                console.log("Student registration attempt:", {
                    username: username,
                    email: email,
                    fullName: fullName,
                    schoolId: schoolId,
                    classIds: classIds,
                    hasPassword: !!password,
                });
                _b = validateRegistrationData;
                return [4 /*yield*/, c.req.json()];
            case 2:
                validationError = _b.apply(void 0, [_e.sent()]);
                if (validationError) {
                    return [2 /*return*/, c.json({ error: validationError }, 400)];
                }
                numericClassIds = classIds
                    .map(function (id) {
                    var numId = typeof id === "string" ? parseInt(id, 10) : id;
                    return isNaN(numId) ? null : numId;
                })
                    .filter(function (id) { return id !== null; });
                if (numericClassIds.length === 0) {
                    console.log("No valid class IDs found. Original classIds:", classIds);
                    return [2 /*return*/, c.json({ error: "Valid class IDs are required" }, 400)];
                }
                classId = numericClassIds[0];
                _e.label = 3;
            case 3:
                _e.trys.push([3, 8, , 9]);
                return [4 /*yield*/, checkUserExists(username, email)];
            case 4:
                userExists = _e.sent();
                if (userExists) {
                    return [2 /*return*/, c.json({ error: "Username or email already exists" }, 400)];
                }
                return [4 /*yield*/, bcrypt.hash(password, 10)];
            case 5:
                passwordHash = _e.sent();
                return [4 /*yield*/, supabase_1.supabase
                        .from("User")
                        .insert([
                        {
                            id: crypto.randomUUID(),
                            username: username,
                            email: email,
                            fullName: fullName,
                            passwordHash: passwordHash,
                            roleId: 1,
                            createdAt: new Date().toISOString(),
                        },
                    ])
                        .select()
                        .single()];
            case 6:
                _c = _e.sent(), newUser = _c.data, userError = _c.error;
                if (userError) {
                    console.log("User creation error:", userError);
                    return [2 /*return*/, c.json({ error: "Failed to create user", detail: userError.message }, 500)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .insert([
                        {
                            id: crypto.randomUUID(),
                            userId: newUser.id,
                            classId: classId,
                            schoolId: schoolId,
                            classLevel: "",
                            streakDays: 0,
                            totalPoints: 0,
                            lastLogin: new Date().toISOString(),
                        },
                    ])
                        .select()
                        .single()];
            case 7:
                _d = _e.sent(), newStudent = _d.data, studentError = _d.error;
                if (studentError) {
                    console.log("Student creation error:", studentError);
                    return [2 /*return*/, c.json({
                            error: "Failed to create student profile",
                            detail: studentError.message,
                        }, 500)];
                }
                console.log("Student registration successful:", {
                    userId: newUser.id,
                    studentId: newStudent.id,
                });
                return [2 /*return*/, c.json({ message: "User registered", user: newUser, student: newStudent }, 201)];
            case 8:
                error_1 = _e.sent();
                console.error("Unexpected error during student registration:", error_1);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.registerStudent = registerStudent;
var registerTeacher = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, email, fullName, password, schoolId, classIds, existing, passwordHash, userId, teacherId, _b, newUser, userError, _c, newTeacher, teacherError, teacherClassInserts, _d, teacherClasses, classError;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, c.req.json()];
            case 1:
                _a = _e.sent(), username = _a.username, email = _a.email, fullName = _a.fullName, password = _a.password, schoolId = _a.schoolId, classIds = _a.classIds;
                if (!password) {
                    return [2 /*return*/, c.json({ error: "Password is required" }, 400)];
                }
                if (!classIds || classIds.length === 0) {
                    return [2 /*return*/, c.json({ error: "At least one class must be selected" }, 400)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("User")
                        .select("id")
                        .or("username.eq.".concat(username, ",email.eq.").concat(email))];
            case 2:
                existing = (_e.sent()).data;
                if (existing && existing.length > 0) {
                    return [2 /*return*/, c.json({ error: "Username or email already exists" }, 400)];
                }
                return [4 /*yield*/, bcrypt.hash(password, 10)];
            case 3:
                passwordHash = _e.sent();
                userId = crypto.randomUUID();
                teacherId = crypto.randomUUID();
                return [4 /*yield*/, supabase_1.supabase
                        .from("User")
                        .insert([
                        {
                            id: userId,
                            username: username,
                            email: email,
                            fullName: fullName,
                            passwordHash: passwordHash,
                            roleId: 2,
                            createdAt: new Date().toISOString(),
                        },
                    ])
                        .select()
                        .single()];
            case 4:
                _b = _e.sent(), newUser = _b.data, userError = _b.error;
                if (userError) {
                    return [2 /*return*/, c.json({ error: "Failed to create user", detail: userError.message }, 500)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .insert([
                        {
                            id: teacherId,
                            userId: userId,
                            schoolId: schoolId,
                        },
                    ])
                        .select()
                        .single()];
            case 5:
                _c = _e.sent(), newTeacher = _c.data, teacherError = _c.error;
                if (teacherError) {
                    return [2 /*return*/, c.json({ error: "Failed to create teacher", detail: teacherError.message }, 500)];
                }
                teacherClassInserts = classIds.map(function (classId) { return ({
                    teacherId: teacherId,
                    classId: classId,
                }); });
                return [4 /*yield*/, supabase_1.supabase
                        .from("TeacherClass")
                        .insert(teacherClassInserts)
                        .select()];
            case 6:
                _d = _e.sent(), teacherClasses = _d.data, classError = _d.error;
                if (classError) {
                    return [2 /*return*/, c.json({ error: "Failed to assign teacher classes", detail: classError.message }, 500)];
                }
                return [2 /*return*/, c.json({
                        message: "Teacher registered successfully",
                        user: newUser,
                        teacher: newTeacher,
                        teacherClasses: teacherClasses,
                    }, 201)];
        }
    });
}); };
exports.registerTeacher = registerTeacher;
var registerAdmin = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, email, fullName, password, schoolId, existing, passwordHash, _b, newUser, error, newAdmin;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, c.req.json()];
            case 1:
                _a = _c.sent(), username = _a.username, email = _a.email, fullName = _a.fullName, password = _a.password, schoolId = _a.schoolId;
                if (!password) {
                    return [2 /*return*/, c.json({ error: "Password is required" }, 400)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("User")
                        .select("id")
                        .or("username.eq.".concat(username, ",email.eq.").concat(email))];
            case 2:
                existing = (_c.sent()).data;
                if (existing && existing.length > 0) {
                    return [2 /*return*/, c.json({ error: "Username or email already exists" }, 400)];
                }
                return [4 /*yield*/, bcrypt.hash(password, 10)];
            case 3:
                passwordHash = _c.sent();
                return [4 /*yield*/, supabase_1.supabase
                        .from("User")
                        .insert([
                        {
                            id: crypto.randomUUID(),
                            username: username,
                            email: email,
                            fullName: fullName,
                            passwordHash: passwordHash,
                            roleId: 3,
                            createdAt: new Date().toISOString(),
                        },
                    ])
                        .select()
                        .single()];
            case 4:
                _b = _c.sent(), newUser = _b.data, error = _b.error;
                return [4 /*yield*/, supabase_1.supabase
                        .from("Admin")
                        .insert([
                        {
                            id: crypto.randomUUID(),
                            userId: newUser.id,
                        },
                    ])
                        .select()
                        .single()];
            case 5:
                newAdmin = (_c.sent()).data;
                if (error) {
                    return [2 /*return*/, c.json({ error: "Failed to create user", detail: error.message }, 500)];
                }
                return [2 /*return*/, c.json({
                        message: "User registered",
                        user: newUser,
                        admin: newAdmin,
                    }, 201)];
        }
    });
}); };
exports.registerAdmin = registerAdmin;
var login = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, _b, user, error, isMatch, payload, token, extraData, data, data, data, err_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, c.req.json()];
            case 1:
                _a = _c.sent(), username = _a.username, password = _a.password;
                _c.label = 2;
            case 2:
                _c.trys.push([2, 11, , 12]);
                return [4 /*yield*/, supabase_1.supabase
                        .from("User")
                        .select("*")
                        .eq("username", username)
                        .single()];
            case 3:
                _b = _c.sent(), user = _b.data, error = _b.error;
                if (error || !user) {
                    return [2 /*return*/, c.json({ error: "Invalid username or password" }, 404)];
                }
                return [4 /*yield*/, bcrypt.compare(password, user.passwordHash)];
            case 4:
                isMatch = _c.sent();
                if (!isMatch) {
                    return [2 /*return*/, c.json({ error: "Invalid username or password" }, 401)];
                }
                payload = {
                    userId: user.id,
                    username: user.username,
                    roleId: user.roleId,
                };
                token = jwt.sign(payload, JWT_SECRET, {
                    expiresIn: "7d",
                });
                console.log("Login successful, setting cookie:", {
                    userId: user.id,
                    tokenLength: token.length,
                    cookieValue: "token=".concat(token, "; HttpOnly; SameSite=Lax; Max-Age=604800; Path=/"),
                });
                c.res.headers.set("Set-Cookie", "token=".concat(token, "; HttpOnly; SameSite=Lax; Max-Age=604800; Path=/"));
                extraData = {};
                if (!(user.roleId === 1)) return [3 /*break*/, 6];
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("*")
                        .eq("userId", user.id)
                        .single()];
            case 5:
                data = (_c.sent()).data;
                extraData = data || {};
                return [3 /*break*/, 10];
            case 6:
                if (!(user.roleId === 2)) return [3 /*break*/, 8];
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("*")
                        .eq("userId", user.id)
                        .single()];
            case 7:
                data = (_c.sent()).data;
                extraData = data || {};
                return [3 /*break*/, 10];
            case 8:
                if (!(user.roleId === 3)) return [3 /*break*/, 10];
                return [4 /*yield*/, supabase_1.supabase
                        .from("Admin")
                        .select("*")
                        .eq("userId", user.id)
                        .single()];
            case 9:
                data = (_c.sent()).data;
                extraData = data || {};
                _c.label = 10;
            case 10: return [2 /*return*/, c.json({
                    message: "Login successful",
                    user: __assign({ id: user.id, username: user.username, email: user.email, fullName: user.fullName, roleId: user.roleId }, extraData),
                })];
            case 11:
                err_1 = _c.sent();
                console.error(err_1);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 12: return [2 /*return*/];
        }
    });
}); };
exports.login = login;
var profile = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, user, error, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: No token provided" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("User")
                        .select("*")
                        .eq("id", userId)
                        .single()];
            case 1:
                _a = _b.sent(), user = _a.data, error = _a.error;
                if (error || !user) {
                    return [2 /*return*/, c.json({ error: "User not found" }, 404)];
                }
                return [2 /*return*/, c.json({ user: user })];
            case 2:
                err_2 = _b.sent();
                return [2 /*return*/, c.json({ error: "Unauthorized: Invalid or expired token" }, 401)];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.profile = profile;
var logout = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        c.res.headers.set("Set-Cookie", "token=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/");
        return [2 /*return*/, c.json({ message: "Logout successful" }, 200)];
    });
}); };
exports.logout = logout;
