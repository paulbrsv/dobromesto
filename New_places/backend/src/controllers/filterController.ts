import { Request, Response } from 'express';
import prisma from '../config/prisma';

export async function listFilters(_req: Request, res: Response) {
  const filters = await prisma.filter.findMany({
    include: { places: { include: { place: true } } },
  });
  res.json(filters);
}

export async function createFilter(req: Request, res: Response) {
  const filter = await prisma.filter.create({ data: req.body });
  res.status(201).json(filter);
}

export async function updateFilter(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const filter = await prisma.filter.update({ where: { id: Number(id) }, data: req.body });
  res.json(filter);
}

export async function deleteFilter(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  await prisma.filter.delete({ where: { id: Number(id) } });
  res.status(204).send();
}
