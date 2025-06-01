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
exports.deleteAssignment = exports.updateAssignment = exports.getAssignmentWithSubmissions = exports.getAssignmentsByTeacher = exports.getAssignmentById = exports.getAssignmentsByClass = exports.createAssignment = void 0;
var supabase_1 = require("../utils/supabase");
var auth_1 = require("../utils/auth");
var dotenv = require("dotenv");
dotenv.config();
var createAssignment = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, description, dueDate, teacherId, classIds, _b, assignment_1, assignmentError, _c, assignmentClasses, assignmentClassError, error_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 5, , 6]);
                return [4 /*yield*/, c.req.json()];
            case 1:
                _a = _d.sent(), title = _a.title, description = _a.description, dueDate = _a.dueDate, teacherId = _a.teacherId, classIds = _a.classIds;
                if (!title || !dueDate || !teacherId) {
                    return [2 /*return*/, c.json({
                            error: "Missing required fields: title, dueDate, and teacherId are required",
                        }, 400)];
                }
                console.log("Creating assignment with data:", {
                    title: title,
                    description: description,
                    dueDate: dueDate,
                    teacherId: teacherId,
                    classIds: classIds,
                });
                return [4 /*yield*/, supabase_1.supabase
                        .from("Assignment")
                        .insert({ title: title, description: description, dueDate: dueDate, teacherId: teacherId })
                        .select()
                        .single()];
            case 2:
                _b = _d.sent(), assignment_1 = _b.data, assignmentError = _b.error;
                if (assignmentError || !assignment_1) {
                    console.error("Error creating assignment:", assignmentError);
                    return [2 /*return*/, c.json({ error: "Failed to create assignment" }, 500)];
                }
                console.log("Assignment created successfully:", assignment_1);
                if (!(classIds && classIds.length > 0)) return [3 /*break*/, 4];
                return [4 /*yield*/, supabase_1.supabase.from("AssignmentClass").insert(classIds.map(function (classId) { return ({
                        assignmentId: assignment_1.id,
                        classId: classId,
                    }); }))];
            case 3:
                _c = _d.sent(), assignmentClasses = _c.data, assignmentClassError = _c.error;
                if (assignmentClassError) {
                    console.error("Error creating assignment-class associations:", assignmentClassError);
                    console.warn("Assignment created but class associations failed");
                }
                else {
                    console.log("Assignment-class associations created:", assignmentClasses);
                }
                _d.label = 4;
            case 4: return [2 /*return*/, c.json(assignment_1, 201)];
            case 5:
                error_1 = _d.sent();
                console.error("Error creating assignment:", error_1);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.createAssignment = createAssignment;
var getAssignmentsByClass = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var classId, userId, student, teacher, _a, assignmentClasses, assignmentClassError, assignments, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                classId = c.req.param("classId");
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("id, classId")
                        .eq("userId", userId)
                        .eq("classId", classId)
                        .single()];
            case 1:
                student = (_b.sent()).data;
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .single()];
            case 2:
                teacher = (_b.sent()).data;
                if (!student && !teacher) {
                    return [2 /*return*/, c.json({ error: "Access denied: Not authorized for this class" }, 403)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("AssignmentClass")
                        .select("\n        assignmentId,\n        assignment:Assignment(\n          *,\n          teacher:Teacher(\n            id,\n            user:User(fullName, username)\n          )\n        )\n      ")
                        .eq("classId", classId)];
            case 3:
                _a = _b.sent(), assignmentClasses = _a.data, assignmentClassError = _a.error;
                if (assignmentClassError) {
                    console.error("Error fetching assignment classes:", assignmentClassError);
                    return [2 /*return*/, c.json({ error: "Failed to fetch assignments" }, 500)];
                }
                assignments = assignmentClasses.map(function (ac) {
                    var _a;
                    return (__assign(__assign({}, ac.assignment), { teacher: (_a = ac.assignment) === null || _a === void 0 ? void 0 : _a.teacher }));
                });
                return [2 /*return*/, c.json(assignments, 200)];
            case 4:
                error_2 = _b.sent();
                console.error("Error fetching assignments by class:", error_2);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getAssignmentsByClass = getAssignmentsByClass;
var getAssignmentById = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var assignmentId, userId, _a, assignment, assignmentError, assignmentClasses, classIds, studentAccess, teacherAccess, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                assignmentId = c.req.param("assignmentId");
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Assignment")
                        .select("\n        *,\n        teacher:Teacher(\n          id,\n          user:User(fullName, username)\n        )\n      ")
                        .eq("id", assignmentId)
                        .single()];
            case 1:
                _a = _b.sent(), assignment = _a.data, assignmentError = _a.error;
                if (assignmentError) {
                    console.error("Error fetching assignment:", assignmentError);
                    return [2 /*return*/, c.json({ error: "Assignment not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("AssignmentClass")
                        .select("classId")
                        .eq("assignmentId", assignmentId)];
            case 2:
                assignmentClasses = (_b.sent()).data;
                if (!(assignmentClasses && assignmentClasses.length > 0)) return [3 /*break*/, 5];
                classIds = assignmentClasses.map(function (ac) { return ac.classId; });
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("id")
                        .eq("userId", userId)
                        .in("classId", classIds)];
            case 3:
                studentAccess = (_b.sent()).data;
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .eq("id", assignment.teacherId)];
            case 4:
                teacherAccess = (_b.sent()).data;
                if (!(studentAccess === null || studentAccess === void 0 ? void 0 : studentAccess.length) && !(teacherAccess === null || teacherAccess === void 0 ? void 0 : teacherAccess.length)) {
                    return [2 /*return*/, c.json({ error: "Access denied: Not authorized for this assignment" }, 403)];
                }
                _b.label = 5;
            case 5: return [2 /*return*/, c.json(assignment, 200)];
            case 6:
                error_3 = _b.sent();
                console.error("Error fetching assignment by ID:", error_3);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.getAssignmentById = getAssignmentById;
var getAssignmentsByTeacher = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, teacher, teacherError, _b, assignments, assignmentsError, error_4;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .single()];
            case 1:
                _a = _c.sent(), teacher = _a.data, teacherError = _a.error;
                if (teacherError || !teacher) {
                    return [2 /*return*/, c.json({ error: "Access denied: Teacher account required" }, 403)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Assignment")
                        .select("\n        *,\n        assignmentClasses:AssignmentClass(\n          classId,\n          class:Class(name)\n        )\n      ")
                        .eq("teacherId", teacher.id)
                        .order("createdAt", { ascending: false })];
            case 2:
                _b = _c.sent(), assignments = _b.data, assignmentsError = _b.error;
                if (assignmentsError) {
                    console.error("Error fetching teacher assignments:", assignmentsError);
                    return [2 /*return*/, c.json({ error: "Failed to fetch assignments" }, 500)];
                }
                return [2 /*return*/, c.json(assignments, 200)];
            case 3:
                error_4 = _c.sent();
                console.error("Error fetching assignments by teacher:", error_4);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getAssignmentsByTeacher = getAssignmentsByTeacher;
var getAssignmentWithSubmissions = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var assignmentId, userId, _a, assignment, assignmentError, teacher, assignmentClasses, _b, submissions, submissionsError, totalStudents, classIds, _c, studentsCount, studentsCountError, response, error_5;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 7, , 8]);
                assignmentId = c.req.param("assignmentId");
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                console.log("Fetching assignment details for assignment:", assignmentId, "user:", userId);
                return [4 /*yield*/, supabase_1.supabase
                        .from("Assignment")
                        .select("\n        *,\n        teacher:Teacher(\n          id,\n          user:User(fullName, username)\n        )\n      ")
                        .eq("id", assignmentId)
                        .single()];
            case 1:
                _a = _d.sent(), assignment = _a.data, assignmentError = _a.error;
                if (assignmentError || !assignment) {
                    console.error("Error fetching assignment:", assignmentError);
                    return [2 /*return*/, c.json({ error: "Assignment not found" }, 404)];
                }
                console.log("Assignment found:", assignment);
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .eq("id", assignment.teacherId)
                        .single()];
            case 2:
                teacher = (_d.sent()).data;
                if (!teacher) {
                    return [2 /*return*/, c.json({ error: "Access denied: Not your assignment" }, 403)];
                }
                console.log("User authorized as teacher:", teacher.id);
                return [4 /*yield*/, supabase_1.supabase
                        .from("AssignmentClass")
                        .select("\n        classId,\n        class:Class(\n          id,\n          name\n        )\n      ")
                        .eq("assignmentId", assignmentId)];
            case 3:
                assignmentClasses = (_d.sent()).data;
                console.log("Assignment classes:", assignmentClasses);
                return [4 /*yield*/, supabase_1.supabase
                        .from("Submission")
                        .select("\n        id,\n        content,\n        submittedAt,\n        aiFeedback,\n        aiScore,\n        feedbackGeneratedAt,\n        studentId,\n        student:Student(\n          id,\n          user:User(username, fullName),\n          classId\n        )\n      ")
                        .eq("assignmentId", assignmentId)
                        .order("submittedAt", { ascending: false })];
            case 4:
                _b = _d.sent(), submissions = _b.data, submissionsError = _b.error;
                if (submissionsError) {
                    console.error("Error fetching submissions:", submissionsError);
                }
                console.log("Submissions found:", (submissions === null || submissions === void 0 ? void 0 : submissions.length) || 0);
                totalStudents = 0;
                if (!(assignmentClasses && assignmentClasses.length > 0)) return [3 /*break*/, 6];
                classIds = assignmentClasses.map(function (ac) { return ac.classId; });
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("*", { count: "exact", head: true })
                        .in("classId", classIds)];
            case 5:
                _c = _d.sent(), studentsCount = _c.count, studentsCountError = _c.error;
                if (!studentsCountError) {
                    totalStudents = studentsCount || 0;
                }
                _d.label = 6;
            case 6:
                response = {
                    assignment: __assign(__assign({}, assignment), { classes: assignmentClasses || [] }),
                    submissions: (submissions ||
                        []),
                    totalStudents: totalStudents,
                };
                return [2 /*return*/, c.json(response, 200)];
            case 7:
                error_5 = _d.sent();
                console.error("Error in getAssignmentWithSubmissions:", error_5);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.getAssignmentWithSubmissions = getAssignmentWithSubmissions;
var updateAssignment = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var assignmentId_1, _a, title, description, dueDate, classIds, userId, _b, assignment, assignmentError, teacher, _c, updatedAssignment, updateError, assignmentClassError, error_6;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 8, , 9]);
                assignmentId_1 = c.req.param("assignmentId");
                return [4 /*yield*/, c.req.json()];
            case 1:
                _a = _d.sent(), title = _a.title, description = _a.description, dueDate = _a.dueDate, classIds = _a.classIds;
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                console.log("Updating assignment:", assignmentId_1, "by user:", userId);
                if (!title || !dueDate) {
                    return [2 /*return*/, c.json({
                            error: "Missing required fields: title and dueDate are required",
                        }, 400)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Assignment")
                        .select("id, teacherId")
                        .eq("id", assignmentId_1)
                        .single()];
            case 2:
                _b = _d.sent(), assignment = _b.data, assignmentError = _b.error;
                if (assignmentError || !assignment) {
                    return [2 /*return*/, c.json({ error: "Assignment not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .eq("id", assignment.teacherId)
                        .single()];
            case 3:
                teacher = (_d.sent()).data;
                if (!teacher) {
                    return [2 /*return*/, c.json({ error: "Access denied: Not your assignment" }, 403)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Assignment")
                        .update({
                        title: title,
                        description: description || null,
                        dueDate: dueDate,
                        updatedAt: new Date().toISOString(),
                    })
                        .eq("id", assignmentId_1)
                        .select()
                        .single()];
            case 4:
                _c = _d.sent(), updatedAssignment = _c.data, updateError = _c.error;
                if (updateError) {
                    console.error("Error updating assignment:", updateError);
                    return [2 /*return*/, c.json({ error: "Failed to update assignment" }, 500)];
                }
                if (!(classIds && Array.isArray(classIds))) return [3 /*break*/, 7];
                return [4 /*yield*/, supabase_1.supabase
                        .from("AssignmentClass")
                        .delete()
                        .eq("assignmentId", assignmentId_1)];
            case 5:
                _d.sent();
                if (!(classIds.length > 0)) return [3 /*break*/, 7];
                return [4 /*yield*/, supabase_1.supabase
                        .from("AssignmentClass")
                        .insert(classIds.map(function (classId) { return ({
                        assignmentId: parseInt(assignmentId_1),
                        classId: classId,
                    }); }))];
            case 6:
                assignmentClassError = (_d.sent()).error;
                if (assignmentClassError) {
                    console.error("Error updating assignment classes:", assignmentClassError);
                }
                _d.label = 7;
            case 7:
                console.log("Assignment updated successfully:", updatedAssignment);
                return [2 /*return*/, c.json(updatedAssignment, 200)];
            case 8:
                error_6 = _d.sent();
                console.error("Error updating assignment:", error_6);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.updateAssignment = updateAssignment;
var deleteAssignment = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var assignmentId, userId, _a, assignment, assignmentError, teacher, deleteError, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                assignmentId = c.req.param("assignmentId");
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                console.log("Deleting assignment:", assignmentId, "by user:", userId);
                return [4 /*yield*/, supabase_1.supabase
                        .from("Assignment")
                        .select("id, teacherId")
                        .eq("id", assignmentId)
                        .single()];
            case 1:
                _a = _b.sent(), assignment = _a.data, assignmentError = _a.error;
                if (assignmentError || !assignment) {
                    return [2 /*return*/, c.json({ error: "Assignment not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .eq("id", assignment.teacherId)
                        .single()];
            case 2:
                teacher = (_b.sent()).data;
                if (!teacher) {
                    return [2 /*return*/, c.json({ error: "Access denied: Not your assignment" }, 403)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("AssignmentClass")
                        .delete()
                        .eq("assignmentId", assignmentId)];
            case 3:
                _b.sent();
                return [4 /*yield*/, supabase_1.supabase.from("Submission").delete().eq("assignmentId", assignmentId)];
            case 4:
                _b.sent();
                return [4 /*yield*/, supabase_1.supabase
                        .from("Assignment")
                        .delete()
                        .eq("id", assignmentId)];
            case 5:
                deleteError = (_b.sent()).error;
                if (deleteError) {
                    console.error("Error deleting assignment:", deleteError);
                    return [2 /*return*/, c.json({ error: "Failed to delete assignment" }, 500)];
                }
                console.log("Assignment deleted successfully");
                return [2 /*return*/, c.json({ message: "Assignment deleted successfully" }, 200)];
            case 6:
                error_7 = _b.sent();
                console.error("Error deleting assignment:", error_7);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.deleteAssignment = deleteAssignment;
