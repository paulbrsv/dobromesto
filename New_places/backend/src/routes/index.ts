import { Router } from 'express';
import categoryRoutes from './categoryRoutes';
import filterRoutes from './filterRoutes';
import placeRoutes from './placeRoutes';
import reviewRoutes from './reviewRoutes';
import settingRoutes from './settingRoutes';
import suggestionRoutes from './suggestionRoutes';

const router = Router();

router.use('/categories', categoryRoutes);
router.use('/filters', filterRoutes);
router.use('/places', placeRoutes);
router.use('/reviews', reviewRoutes);
router.use('/settings', settingRoutes);
router.use('/suggestions', suggestionRoutes);

export default router;
