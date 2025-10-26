import path from 'path';
import { readFile } from 'fs/promises';
import { ensureDataDirectory } from '../src/config';
import { executeStatements } from '../src/sqlite';

type PlaceJson = {
  name: string;
  lat: number;
  lng: number;
  shirt_description?: string;
  description?: string;
  link?: string;
  instagram?: string;
  maps_url?: string;
  image?: string;
  attributes?: string[];
  verified?: boolean;
};

type FilterJson = {
  key: string;
  label: string;
  tooltip?: string;
  icon?: string;
};

type ConfigJson = {
  filters: {
    leftFilters: FilterJson[];
    rightFilters: FilterJson[];
  };
  templates: Record<string, string>;
  mapSettings: unknown;
  markerSettings: unknown;
  styleSettings: unknown;
  content: {
    cities: { name: string; disabled?: boolean }[];
    navLinks: { label: string; href: string }[];
    buttonLabels: Record<string, string>;
    footerText: string;
  };
};

type FeedbackJson =
  | {
      type: 'feedback';
      timestamp: string;
      checked?: boolean;
      message?: string;
      contact?: string | null;
    }
  | {
      type: 'add';
      timestamp: string;
      checked?: boolean;
      name?: string;
      description?: string;
      maps_url?: string;
      is_owner?: boolean;
    }
  | {
      type: 'edit';
      timestamp: string;
      checked?: boolean;
      place?: string;
      suggestion?: string;
      is_owner?: boolean;
    }
  | (Record<string, unknown> & { type: string; timestamp: string; checked?: boolean });

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

function nullableString(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sqlValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toString() : 'NULL';
  }

  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }

  return `'${escapeSqlString(String(value))}'`;
}

async function loadJson<T>(relativePath: string): Promise<T> {
  const root = path.resolve(__dirname, '..', '..', '..');
  const filePath = path.join(root, 'public', relativePath);
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

async function seed() {
  ensureDataDirectory();

  const [places, config, feedbacks] = await Promise.all([
    loadJson<PlaceJson[]>('data/places.json'),
    loadJson<ConfigJson>('data/config.json'),
    loadJson<FeedbackJson[]>('feedback/feedback.json'),
  ]);

  const statements: string[] = [
    'DELETE FROM place_attributes',
    'DELETE FROM suggested_places',
    'DELETE FROM feedbacks',
    'DELETE FROM nav_links',
    'DELETE FROM settings',
    'DELETE FROM places',
    'DELETE FROM attributes',
    'DELETE FROM cities',
  ];

  const missingAttributes = new Set<string>();

  let defaultCityId: number | null = null;
  let cityCount = 0;
  config.content?.cities?.forEach((city, index) => {
    const id = index + 1;
    const slug = slugify(city.name);
    cityCount += 1;
    if (defaultCityId === null && !city.disabled) {
      defaultCityId = id;
    }
    statements.push(
      `INSERT INTO cities (id, name, slug, disabled, sort_order) VALUES (${id}, ${sqlValue(city.name)}, ${sqlValue(slug)}, ${sqlValue(Boolean(city.disabled))}, ${index})`,
    );
  });

  if (defaultCityId === null && cityCount > 0) {
    defaultCityId = 1;
  }

  const filters = [
    ...(config.filters?.leftFilters || []).map((filter, index) => ({ ...filter, category: 'left', sort_order: index })),
    ...(config.filters?.rightFilters || []).map((filter, index) => ({ ...filter, category: 'right', sort_order: index })),
  ];

  const attributeIdMap = new Map<string, number>();
  filters.forEach((filter, index) => {
    const id = index + 1;
    attributeIdMap.set(filter.key, id);
    statements.push(
      `INSERT INTO attributes (id, key, label, tooltip, icon, category, sort_order) VALUES (${id}, ${sqlValue(filter.key)}, ${sqlValue(filter.label)}, ${sqlValue(filter.tooltip ?? null)}, ${sqlValue(filter.icon ?? null)}, ${sqlValue(filter.category)}, ${filter.sort_order})`,
    );
  });

  places.forEach((place, index) => {
    const placeId = index + 1;
    const cityIdSql = defaultCityId !== null ? defaultCityId.toString() : 'NULL';
    const shortDescription = nullableString(place.shirt_description);
    const description = nullableString(place.description);
    const link = nullableString(place.link);
    const instagram = nullableString(place.instagram);
    const mapsUrl = nullableString(place.maps_url);
    const image = nullableString(place.image);

    statements.push(
      `INSERT INTO places (id, city_id, name, latitude, longitude, short_description, description, link, instagram, maps_url, image, verified) VALUES (${placeId}, ${cityIdSql}, ${sqlValue(place.name)}, ${sqlValue(place.lat)}, ${sqlValue(place.lng)}, ${sqlValue(shortDescription)}, ${sqlValue(description)}, ${sqlValue(link)}, ${sqlValue(instagram)}, ${sqlValue(mapsUrl)}, ${sqlValue(image)}, ${sqlValue(Boolean(place.verified))})`,
    );

    (place.attributes || []).forEach((key, attrIndex) => {
      const attributeId = attributeIdMap.get(key);
      if (!attributeId) {
        missingAttributes.add(key);
        return;
      }

      statements.push(
        `INSERT INTO place_attributes (place_id, attribute_id, sort_order) VALUES (${placeId}, ${attributeId}, ${attrIndex})`,
      );
    });
  });

  config.content?.navLinks?.forEach((link, index) => {
    statements.push(
      `INSERT INTO nav_links (label, href, sort_order) VALUES (${sqlValue(link.label)}, ${sqlValue(link.href)}, ${index})`,
    );
  });

  const settingsEntries = [
    {
      key: 'mapSettings',
      group: 'map',
      type: 'json',
      value: JSON.stringify(config.mapSettings ?? {}),
    },
    {
      key: 'markerSettings',
      group: 'map',
      type: 'json',
      value: JSON.stringify(config.markerSettings ?? {}),
    },
    {
      key: 'styleSettings',
      group: 'style',
      type: 'json',
      value: JSON.stringify(config.styleSettings ?? {}),
    },
    {
      key: 'templates.placeCardList',
      group: 'templates',
      type: 'string',
      value: config.templates?.placeCardList ?? '',
    },
    {
      key: 'templates.placeCardPopup',
      group: 'templates',
      type: 'string',
      value: config.templates?.placeCardPopup ?? '',
    },
    {
      key: 'content.buttonLabels',
      group: 'content',
      type: 'json',
      value: JSON.stringify(config.content?.buttonLabels ?? {}),
    },
    {
      key: 'content.footerText',
      group: 'content',
      type: 'string',
      value: config.content?.footerText ?? '',
    },
  ];

  settingsEntries.forEach((setting) => {
    statements.push(
      `INSERT INTO settings (key, group_name, type, value) VALUES (${sqlValue(setting.key)}, ${sqlValue(setting.group)}, ${sqlValue(setting.type)}, ${sqlValue(setting.value)})`,
    );
  });

  feedbacks.forEach((entry) => {
    if (entry.type === 'feedback') {
      statements.push(
        `INSERT INTO feedbacks (type, submitted_at, checked, message, contact) VALUES (${sqlValue(entry.type)}, ${sqlValue(entry.timestamp)}, ${sqlValue(Boolean(entry.checked))}, ${sqlValue(entry.message ?? null)}, ${sqlValue(entry.contact ?? null)})`,
      );
      return;
    }

    if (entry.type === 'add' || entry.type === 'edit') {
      const name = 'name' in entry ? entry.name ?? null : null;
      const description = 'description' in entry ? entry.description ?? null : null;
      const mapsUrl = 'maps_url' in entry ? entry.maps_url ?? null : null;
      const placeName = 'place' in entry ? entry.place ?? null : null;
      const suggestion = 'suggestion' in entry ? entry.suggestion ?? null : null;
      const isOwner = 'is_owner' in entry ? Boolean(entry.is_owner) : false;

      statements.push(
        `INSERT INTO suggested_places (type, submitted_at, checked, name, description, maps_url, is_owner, place_name, suggestion) VALUES (${sqlValue(entry.type)}, ${sqlValue(entry.timestamp)}, ${sqlValue(Boolean(entry.checked))}, ${sqlValue(name)}, ${sqlValue(description)}, ${sqlValue(mapsUrl)}, ${sqlValue(isOwner)}, ${sqlValue(placeName)}, ${sqlValue(suggestion)})`,
      );
      return;
    }

    statements.push(
      `INSERT INTO feedbacks (type, submitted_at, checked, message, contact) VALUES (${sqlValue(entry.type)}, ${sqlValue(entry.timestamp)}, ${sqlValue(Boolean(entry.checked))}, ${sqlValue(JSON.stringify(entry))}, NULL)`,
    );
  });

  await executeStatements(statements);

  if (missingAttributes.size > 0) {
    console.warn('The following attributes were referenced by places but missing from filters:', [
      ...missingAttributes,
    ]);
  }

  console.log('Database seeded successfully.');
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exitCode = 1;
});
