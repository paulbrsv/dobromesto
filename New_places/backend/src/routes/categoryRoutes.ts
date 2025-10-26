import { Router } from 'express';
import { adminAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  categoryCreateSchema,
  categoryIdParamSchema,
  categoryUpdateSchema,
} from '../validators/category';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../controllers/categoryController';

const router = Router();

router.get('/', listCategories);
router.post('/', adminAuth, validate(categoryCreateSchema), createCategory);
router.put('/:id', adminAuth, validate(categoryIdParamSchema, 'params'), validate(categoryUpdateSchema), updateCategory);
router.delete('/:id', adminAuth, validate(categoryIdParamSchema, 'params'), deleteCategory);

export default router;
