"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const changeLogController_1 = require("../controllers/changeLogController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Only admin role can access change logs
router.use(auth_1.authenticateToken);
router.use((0, auth_1.authorizeRole)('admin'));
router.get('/', changeLogController_1.changeLogController.getAllChangeLogs);
router.post('/', changeLogController_1.changeLogController.createChangeLog);
router.put('/:id', changeLogController_1.changeLogController.updateChangeLog);
router.delete('/:id', changeLogController_1.changeLogController.deleteChangeLog);
exports.default = router;
