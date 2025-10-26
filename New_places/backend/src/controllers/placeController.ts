import { Request, Response } from 'express';
import prisma from '../config/prisma';

type PlacePayload = {
  name?: string;
  description?: string | null;
  address?: string | null;
  categoryId?: number;
  filterIds?: number[];
};

function mapPlaceData(body: PlacePayload) {
  const { filterIds, ...rest } = body;

  if (!filterIds) {
    return rest;
  }

  return {
    ...rest,
    filters: {
      deleteMany: {},
      create: filterIds.map((filterId) => ({
        filter: {
          connect: { id: filterId },
        },
      })),
    },
  };
}

export async function listPlaces(_req: Request, res: Response) {
  const places = await prisma.place.findMany({
    include: {
      category: true,
      filters: { include: { filter: true } },
      reviews: true,
    },
  });

  res.json(places);
}

export async function getPlace(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const place = await prisma.place.findUnique({
    where: { id: Number(id) },
    include: {
      category: true,
      filters: { include: { filter: true } },
      reviews: true,
    },
  });

  if (!place) {
    return res.status(404).json({ message: 'Place not found' });
  }

  return res.json(place);
}

export async function createPlace(req: Request, res: Response) {
  const data = mapPlaceData(req.body);
  const place = await prisma.place.create({
    data,
    include: {
      category: true,
      filters: { include: { filter: true } },
      reviews: true,
    },
  });

  res.status(201).json(place);
}

export async function updatePlace(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const data = mapPlaceData(req.body);
  const place = await prisma.place.update({
    where: { id: Number(id) },
    data,
    include: {
      category: true,
      filters: { include: { filter: true } },
      reviews: true,
    },
  });

  res.json(place);
}

export async function deletePlace(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  await prisma.place.delete({ where: { id: Number(id) } });
  res.status(204).send();
}
