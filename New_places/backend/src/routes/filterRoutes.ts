import { Router } from 'express';
import { adminAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  filterCreateSchema,
  filterIdParamSchema,
  filterUpdateSchema,
} from '../validators/filter';
import {
  createFilter,
  deleteFilter,
  listFilters,
  updateFilter,
} from '../controllers/filterController';

const router = Router();

router.get('/', listFilters);
router.post('/', adminAuth, validate(filterCreateSchema), createFilter);
router.put('/:id', adminAuth, validate(filterIdParamSchema, 'params'), validate(filterUpdateSchema), updateFilter);
router.delete('/:id', adminAuth, validate(filterIdParamSchema, 'params'), deleteFilter);

export default router;
