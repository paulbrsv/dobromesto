import { Router } from 'express';
import { adminAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  placeCreateSchema,
  placeIdParamSchema,
  placeUpdateSchema,
} from '../validators/place';
import {
  createPlace,
  deletePlace,
  getPlace,
  listPlaces,
  updatePlace,
} from '../controllers/placeController';

const router = Router();

router.get('/', listPlaces);
router.get('/:id', validate(placeIdParamSchema, 'params'), getPlace);
router.post('/', adminAuth, validate(placeCreateSchema), createPlace);
router.put('/:id', adminAuth, validate(placeIdParamSchema, 'params'), validate(placeUpdateSchema), updatePlace);
router.delete('/:id', adminAuth, validate(placeIdParamSchema, 'params'), deletePlace);

export default router;
