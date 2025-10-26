import { Request, Response } from 'express';
import prisma from '../config/prisma';

export async function listSettings(_req: Request, res: Response) {
  const settings = await prisma.setting.findMany();
  res.json(settings);
}

export async function createSetting(req: Request, res: Response) {
  const setting = await prisma.setting.create({ data: req.body });
  res.status(201).json(setting);
}

export async function updateSetting(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const setting = await prisma.setting.update({ where: { id: Number(id) }, data: req.body });
  res.json(setting);
}

export async function deleteSetting(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  await prisma.setting.delete({ where: { id: Number(id) } });
  res.status(204).send();
}
