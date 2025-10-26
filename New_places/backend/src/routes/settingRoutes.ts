import { Router } from 'express';
import { adminAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  settingCreateSchema,
  settingIdParamSchema,
  settingUpdateSchema,
} from '../validators/setting';
import {
  createSetting,
  deleteSetting,
  listSettings,
  updateSetting,
} from '../controllers/settingController';

const router = Router();

router.get('/', adminAuth, listSettings);
router.post('/', adminAuth, validate(settingCreateSchema), createSetting);
router.put('/:id', adminAuth, validate(settingIdParamSchema, 'params'), validate(settingUpdateSchema), updateSetting);
router.delete('/:id', adminAuth, validate(settingIdParamSchema, 'params'), deleteSetting);

export default router;
