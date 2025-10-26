import { Router } from 'express';
import { adminAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  suggestionCreateSchema,
  suggestionIdParamSchema,
  suggestionUpdateSchema,
} from '../validators/suggestion';
import {
  createSuggestion,
  deleteSuggestion,
  listSuggestions,
  updateSuggestion,
} from '../controllers/suggestionController';

const router = Router();

router.get('/', adminAuth, listSuggestions);
router.post('/', validate(suggestionCreateSchema), createSuggestion);
router.put('/:id', adminAuth, validate(suggestionIdParamSchema, 'params'), validate(suggestionUpdateSchema), updateSuggestion);
router.delete('/:id', adminAuth, validate(suggestionIdParamSchema, 'params'), deleteSuggestion);

export default router;
