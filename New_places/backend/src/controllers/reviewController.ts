import { Request, Response } from 'express';
import prisma from '../config/prisma';

export async function listReviews(req: Request, res: Response) {
  const { placeId } = req.query as { placeId?: number };
  const reviews = await prisma.review.findMany({
    where: placeId ? { placeId } : undefined,
    include: { place: true },
  });
  res.json(reviews);
}

export async function createReview(req: Request, res: Response) {
  const review = await prisma.review.create({ data: req.body });
  res.status(201).json(review);
}

export async function updateReview(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const review = await prisma.review.update({ where: { id: Number(id) }, data: req.body });
  res.json(review);
}

export async function deleteReview(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  await prisma.review.delete({ where: { id: Number(id) } });
  res.status(204).send();
}
