import { Router } from 'express';
import { adminAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  reviewCreateSchema,
  reviewIdParamSchema,
  reviewQuerySchema,
  reviewUpdateSchema,
} from '../validators/review';
import {
  createReview,
  deleteReview,
  listReviews,
  updateReview,
} from '../controllers/reviewController';

const router = Router();

router.get('/', validate(reviewQuerySchema, 'query'), listReviews);
router.post('/', validate(reviewCreateSchema), createReview);
router.put('/:id', adminAuth, validate(reviewIdParamSchema, 'params'), validate(reviewUpdateSchema), updateReview);
router.delete('/:id', adminAuth, validate(reviewIdParamSchema, 'params'), deleteReview);

export default router;
