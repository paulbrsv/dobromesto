import { Request, Response } from 'express';
import prisma from '../config/prisma';

export async function listSuggestions(_req: Request, res: Response) {
  const suggestions = await prisma.suggestion.findMany();
  res.json(suggestions);
}

export async function createSuggestion(req: Request, res: Response) {
  const suggestion = await prisma.suggestion.create({ data: req.body });
  res.status(201).json(suggestion);
}

export async function updateSuggestion(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const suggestion = await prisma.suggestion.update({ where: { id: Number(id) }, data: req.body });
  res.json(suggestion);
}

export async function deleteSuggestion(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  await prisma.suggestion.delete({ where: { id: Number(id) } });
  res.status(204).send();
}
