"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCombinedLeaderboard =
  exports.updateStudentPoints =
  exports.getMyRanking =
  exports.getClassLeaderboard =
    void 0;
var supabase_1 = require("../utils/supabase");
var auth_1 = require("../utils/auth");
var dotenv = require("dotenv");
dotenv.config();
var getClassLeaderboard = function (c) {
  return __awaiter(void 0, void 0, void 0, function () {
    var classId,
      _a,
      period,
      userId,
      student,
      teacher,
      dateFilter,
      now,
      currentMonth,
      query,
      _b,
      basicData,
      basicError,
      studentPoints_1,
      aggregatedData,
      error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, , 5]);
          classId = c.req.param("classId");
          (_a = c.req.query().period), (period = _a === void 0 ? "all" : _a);
          userId = (0, auth_1.getUserIdFromToken)(c);
          if (!userId) {
            return [
              2 /*return*/,
              c.json({ error: "Unauthorized: Invalid token" }, 401),
            ];
          }
          return [
            4 /*yield*/,
            supabase_1.supabase
              .from("Student")
              .select("classId")
              .eq("userId", userId)
              .single(),
          ];
        case 1:
          student = _c.sent().data;
          return [
            4 /*yield*/,
            supabase_1.supabase
              .from("Teacher")
              .select("id")
              .eq("userId", userId)
              .single(),
          ];
        case 2:
          teacher = _c.sent().data;
          if (!student && !teacher) {
            return [
              2 /*return*/,
              c.json({ error: "Access denied: Not a student or teacher" }, 403),
            ];
          }
          if (student && student.classId.toString() !== classId) {
            return [
              2 /*return*/,
              c.json({ error: "Access denied: Not in this class" }, 403),
            ];
          }
          dateFilter = new Date(0);
          now = new Date();
          switch (period) {
            case "week":
              dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case "month":
              dateFilter = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                now.getDate()
              );
              break;
            case "semester":
              currentMonth = now.getMonth();
              dateFilter =
                currentMonth >= 8
                  ? new Date(now.getFullYear(), 8, 1)
                  : new Date(now.getFullYear(), 0, 1);
              break;
            case "all":
            default:
              dateFilter = new Date(0);
              break;
          }
          query = supabase_1.supabase
            .from("ClassLeaderboard")
            .select(
              "\n        studentId,\n        classId,\n        points,\n        updated,\n        student:Student(\n          id,\n          user:User(username, fullName)\n        )\n      "
            )
            .eq("classId", parseInt(classId))
            .order("updated", { ascending: false });
          if (period !== "all") {
            query = query.gte("updated", dateFilter.toISOString());
          }
          return [4 /*yield*/, query];
        case 3:
          (_b = _c.sent()), (basicData = _b.data), (basicError = _b.error);
          if (basicError) {
            console.error("Error with leaderboard query:", basicError);
            return [
              2 /*return*/,
              c.json({ error: "Failed to fetch leaderboard data" }, 500),
            ];
          }
          studentPoints_1 = new Map();
          basicData === null || basicData === void 0
            ? void 0
            : basicData.forEach(function (entry) {
                var studentId = entry.studentId;
                if (!studentPoints_1.has(studentId)) {
                  studentPoints_1.set(studentId, {
                    studentId: studentId,
                    classId: entry.classId,
                    points: 0,
                    lastUpdated: entry.updated,
                    student: entry.student,
                  });
                }
                var current = studentPoints_1.get(studentId);
                current.points += entry.points;
                if (new Date(entry.updated) > new Date(current.lastUpdated)) {
                  current.lastUpdated = entry.updated;
                }
              });
          aggregatedData = Array.from(studentPoints_1.values())
            .sort(function (a, b) {
              return b.points - a.points;
            })
            .map(function (student, index) {
              var _a;
              return {
                id: student.studentId,
                user: ((_a = student.student) === null || _a === void 0
                  ? void 0
                  : _a.user) || {
                  username: "Unknown",
                  fullName: "Unknown",
                },
                points: student.points,
                rank: index + 1,
                updated: student.lastUpdated,
              };
            });
          return [2 /*return*/, c.json(aggregatedData, 200)];
        case 4:
          error_1 = _c.sent();
          console.error("Error in getClassLeaderboard:", error_1);
          return [
            2 /*return*/,
            c.json({ error: "Internal server error" }, 500),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
};
exports.getClassLeaderboard = getClassLeaderboard;
var getMyRanking = function (c) {
  return __awaiter(void 0, void 0, void 0, function () {
    var _a,
      period,
      userId,
      _b,
      student_1,
      studentError,
      classId,
      dateFilter,
      now,
      currentMonth,
      query,
      _c,
      basicData,
      basicError,
      studentPoints_2,
      aggregatedData,
      myRankingIndex,
      myData,
      error_2;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 3, , 4]);
          (_a = c.req.query().period), (period = _a === void 0 ? "all" : _a);
          userId = (0, auth_1.getUserIdFromToken)(c);
          if (!userId) {
            return [
              2 /*return*/,
              c.json({ error: "Unauthorized: Invalid token" }, 401),
            ];
          }
          return [
            4 /*yield*/,
            supabase_1.supabase
              .from("Student")
              .select("id, classId")
              .eq("userId", userId)
              .single(),
          ];
        case 1:
          (_b = _d.sent()), (student_1 = _b.data), (studentError = _b.error);
          if (studentError || !student_1) {
            return [2 /*return*/, c.json({ error: "Student not found" }, 404)];
          }
          classId = student_1.classId;
          dateFilter = new Date(0);
          now = new Date();
          switch (period) {
            case "week":
              dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case "month":
              dateFilter = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                now.getDate()
              );
              break;
            case "semester":
              currentMonth = now.getMonth();
              dateFilter =
                currentMonth >= 8
                  ? new Date(now.getFullYear(), 8, 1)
                  : new Date(now.getFullYear(), 0, 1);
              break;
            case "all":
            default:
              dateFilter = new Date(0);
              break;
          }
          query = supabase_1.supabase
            .from("ClassLeaderboard")
            .select(
              "\n        studentId,\n        classId,\n        points,\n        updated,\n        student:Student(\n          id,\n          user:User(username, fullName)\n        )\n      "
            )
            .eq("classId", classId)
            .order("updated", { ascending: false });
          if (period !== "all") {
            query = query.gte("updated", dateFilter.toISOString());
          }
          return [4 /*yield*/, query];
        case 2:
          (_c = _d.sent()), (basicData = _c.data), (basicError = _c.error);
          if (basicError) {
            console.error(
              "Error fetching leaderboard for ranking:",
              basicError
            );
            return [
              2 /*return*/,
              c.json({ error: "Failed to fetch ranking data" }, 500),
            ];
          }
          studentPoints_2 = new Map();
          basicData === null || basicData === void 0
            ? void 0
            : basicData.forEach(function (entry) {
                var studentId = entry.studentId;
                if (!studentPoints_2.has(studentId)) {
                  studentPoints_2.set(studentId, {
                    studentId: studentId,
                    classId: entry.classId,
                    points: 0,
                    lastUpdated: entry.updated,
                    student: entry.student,
                  });
                }
                var current = studentPoints_2.get(studentId);
                current.points += entry.points;
                if (new Date(entry.updated) > new Date(current.lastUpdated)) {
                  current.lastUpdated = entry.updated;
                }
              });
          aggregatedData = Array.from(studentPoints_2.values()).sort(function (
            a,
            b
          ) {
            return b.points - a.points;
          });
          myRankingIndex = aggregatedData.findIndex(function (entry) {
            return entry.studentId === student_1.id;
          });
          if (myRankingIndex === -1) {
            return [
              2 /*return*/,
              c.json({
                rank: "N/A",
                points: 0,
                classId: student_1.classId,
                totalStudents: aggregatedData.length,
              }),
            ];
          }
          myData = aggregatedData[myRankingIndex];
          return [
            2 /*return*/,
            c.json({
              rank: myRankingIndex + 1,
              points: myData.points,
              classId: student_1.classId,
              totalStudents: aggregatedData.length,
              updated: myData.lastUpdated,
            }),
          ];
        case 3:
          error_2 = _d.sent();
          console.error("Error in getMyRanking:", error_2);
          return [
            2 /*return*/,
            c.json({ error: "Internal server error" }, 500),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
};
exports.getMyRanking = getMyRanking;
var updateStudentPoints = function (c) {
  return __awaiter(void 0, void 0, void 0, function () {
    var _a,
      studentId,
      points,
      userId,
      _b,
      teacher,
      teacherError,
      _c,
      student,
      studentError,
      pointsError,
      error_3;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, , 6]);
          return [4 /*yield*/, c.req.json()];
        case 1:
          (_a = _d.sent()), (studentId = _a.studentId), (points = _a.points);
          userId = (0, auth_1.getUserIdFromToken)(c);
          if (!userId) {
            return [
              2 /*return*/,
              c.json({ error: "Unauthorized: Invalid token" }, 401),
            ];
          }
          return [
            4 /*yield*/,
            supabase_1.supabase
              .from("Teacher")
              .select("id")
              .eq("userId", userId)
              .single(),
          ];
        case 2:
          (_b = _d.sent()), (teacher = _b.data), (teacherError = _b.error);
          if (teacherError || !teacher) {
            return [
              2 /*return*/,
              c.json({ error: "Access denied: Teacher only" }, 403),
            ];
          }
          return [
            4 /*yield*/,
            supabase_1.supabase
              .from("Student")
              .select("classId")
              .eq("id", studentId)
              .single(),
          ];
        case 3:
          (_c = _d.sent()), (student = _c.data), (studentError = _c.error);
          if (studentError || !student) {
            return [2 /*return*/, c.json({ error: "Student not found" }, 404)];
          }
          return [
            4 /*yield*/,
            supabase_1.supabase.from("ClassLeaderboard").insert([
              {
                studentId: studentId,
                classId: student.classId,
                points: points,
                updated: new Date().toISOString(),
              },
            ]),
          ];
        case 4:
          pointsError = _d.sent().error;
          if (pointsError) {
            console.error("Error adding points:", pointsError);
            return [
              2 /*return*/,
              c.json({ error: "Failed to add points" }, 500),
            ];
          }
          return [
            2 /*return*/,
            c.json({ message: "Points added successfully" }, 201),
          ];
        case 5:
          error_3 = _d.sent();
          console.error("Error in updateStudentPoints:", error_3);
          return [
            2 /*return*/,
            c.json({ error: "Internal server error" }, 500),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
};
exports.updateStudentPoints = updateStudentPoints;
var getCombinedLeaderboard = function (c) {
  return __awaiter(void 0, void 0, void 0, function () {
    var classId,
      _a,
      period,
      userId,
      student,
      teacher,
      dateFilter,
      now,
      currentMonth,
      pointsQuery,
      _b,
      pointsData,
      pointsError,
      studentPoints_3,
      _c,
      studentsData,
      studentsError,
      combinedData,
      leaderboard,
      error_4;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, , 6]);
          classId = c.req.param("classId");
          (_a = c.req.query().period), (period = _a === void 0 ? "all" : _a);
          userId = (0, auth_1.getUserIdFromToken)(c);
          if (!userId) {
            return [
              2 /*return*/,
              c.json({ error: "Unauthorized: Invalid token" }, 401),
            ];
          }
          return [
            4 /*yield*/,
            supabase_1.supabase
              .from("Student")
              .select("classId")
              .eq("userId", userId)
              .single(),
          ];
        case 1:
          student = _d.sent().data;
          return [
            4 /*yield*/,
            supabase_1.supabase
              .from("Teacher")
              .select("id")
              .eq("userId", userId)
              .single(),
          ];
        case 2:
          teacher = _d.sent().data;
          if (!student && !teacher) {
            return [
              2 /*return*/,
              c.json({ error: "Access denied: Not a student or teacher" }, 403),
            ];
          }
          if (student && student.classId.toString() !== classId) {
            return [
              2 /*return*/,
              c.json({ error: "Access denied: Not in this class" }, 403),
            ];
          }
          dateFilter = new Date(0);
          now = new Date();
          switch (period) {
            case "week":
              dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case "month":
              dateFilter = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                now.getDate()
              );
              break;
            case "semester":
              currentMonth = now.getMonth();
              dateFilter =
                currentMonth >= 8
                  ? new Date(now.getFullYear(), 8, 1)
                  : new Date(now.getFullYear(), 0, 1);
              break;
            case "all":
            default:
              dateFilter = new Date(0);
              break;
          }
          pointsQuery = supabase_1.supabase
            .from("ClassLeaderboard")
            .select(
              "\n        studentId,\n        points,\n        updated\n      "
            )
            .eq("classId", parseInt(classId))
            .order("updated", { ascending: false });
          if (period !== "all") {
            pointsQuery = pointsQuery.gte("updated", dateFilter.toISOString());
          }
          return [4 /*yield*/, pointsQuery];
        case 3:
          (_b = _d.sent()), (pointsData = _b.data), (pointsError = _b.error);
          if (pointsError) {
            console.error("Error fetching points data:", pointsError);
            return [
              2 /*return*/,
              c.json({ error: "Failed to fetch points data" }, 500),
            ];
          }
          studentPoints_3 = new Map();
          pointsData === null || pointsData === void 0
            ? void 0
            : pointsData.forEach(function (entry) {
                var studentId = entry.studentId;
                if (!studentPoints_3.has(studentId)) {
                  studentPoints_3.set(studentId, 0);
                }
                studentPoints_3.set(
                  studentId,
                  studentPoints_3.get(studentId) + entry.points
                );
              });
          return [
            4 /*yield*/,
            supabase_1.supabase
              .from("Student")
              .select(
                "\n        id,\n        streakDays,\n        lastLogin,\n        user:User(username, fullName)\n      "
              )
              .eq("classId", parseInt(classId)),
          ];
        case 4:
          (_c = _d.sent()),
            (studentsData = _c.data),
            (studentsError = _c.error);
          if (studentsError) {
            console.error("Error fetching students data:", studentsError);
            return [
              2 /*return*/,
              c.json({ error: "Failed to fetch students data" }, 500),
            ];
          }
          combinedData =
            (studentsData === null || studentsData === void 0
              ? void 0
              : studentsData.map(function (student) {
                  return {
                    id: student.id,
                    user: student.user,
                    points: studentPoints_3.get(student.id) || 0,
                    streakDays: student.streakDays,
                    lastLogin: student.lastLogin,
                    totalScore:
                      (studentPoints_3.get(student.id) || 0) +
                      student.streakDays * 5,
                  };
                })) || [];
          combinedData.sort(function (a, b) {
            return b.totalScore - a.totalScore;
          });
          leaderboard = combinedData.map(function (student, index) {
            return __assign(__assign({}, student), { rank: index + 1 });
          });
          return [2 /*return*/, c.json(leaderboard, 200)];
        case 5:
          error_4 = _d.sent();
          console.error("Error in getCombinedLeaderboard:", error_4);
          return [
            2 /*return*/,
            c.json({ error: "Internal server error" }, 500),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
};
exports.getCombinedLeaderboard = getCombinedLeaderboard;
