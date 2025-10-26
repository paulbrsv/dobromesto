import { createServer } from './server';

const port = Number(process.env.PORT ?? 3000);

const server = createServer();

server.listen(port, () => {
  console.log(`New Places backend is listening on port ${port}`);
});
