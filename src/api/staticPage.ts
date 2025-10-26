import { useQuery } from '../react-query';

type StaticPageContent = {
  title: string;
  body: string[];
};

const fetchStaticPage = async (slug: string): Promise<StaticPageContent> => {
  const response = await fetch(`/data/pages/${slug}.json`);
  if (!response.ok) {
    throw new Error('Page not found');
  }

  return response.json();
};

export const useStaticPageQuery = (slug: string) =>
  useQuery<StaticPageContent, Error>(['static-page', slug], () => fetchStaticPage(slug), {
    enabled: Boolean(slug),
  });
