import { Request, Response } from 'express';
import prisma from '../config/prisma';

export async function listCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({ include: { places: true } });
  res.json(categories);
}

export async function createCategory(req: Request, res: Response) {
  const category = await prisma.category.create({ data: req.body });
  res.status(201).json(category);
}

export async function updateCategory(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const category = await prisma.category.update({ where: { id: Number(id) }, data: req.body });
  res.json(category);
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  await prisma.category.delete({ where: { id: Number(id) } });
  res.status(204).send();
}
