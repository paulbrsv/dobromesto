import http from 'http';
import { getHealthcheckHandler } from '@/utils/healthcheck';

export const createServer = () => {
  const server = http.createServer((req, res) => {
    if (!req.url) {
      res.statusCode = 400;
      res.end('Bad request');
      return;
    }

    if (req.url === '/health') {
      return getHealthcheckHandler()(req, res);
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Not Found' }));
    return undefined;
  });

  return server;
};
