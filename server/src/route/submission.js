"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hono_1 = require("hono");
var SubmissionController_1 = require("../controller/SubmissionController");
var router = new hono_1.Hono();
router.post("/", SubmissionController_1.createSubmission);
router.get("/:submissionId", SubmissionController_1.getSubmissionById);
router.post("/:submissionId/regenerate-feedback", SubmissionController_1.regenerateAIFeedback);
exports.default = router;
