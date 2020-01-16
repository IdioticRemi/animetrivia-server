import 'module-alias/register';

import express, { Response, Request } from 'express';
import cors from 'cors';
import { scan, Stats } from 'fs-nextra';
import { ApiError } from './lib/error';

// Application
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Register Routes
// eslint-disable-next-line @typescript-eslint/no-floating-promises
scan('./dist/routes', { filter: (stats: Stats, path: string) => !stats.isDirectory() && (path.endsWith('.ts') || path.endsWith('.js')) }).then(routes => {
	[...routes.keys()].forEach(async path => {
		const route = path.split('\\routes')[1].split('.js')[0].replace(/\\+/g, '/');

		const routeFile = await import(path);

		app.use(route, routeFile.default);
	});

	process.nextTick(() => {
		// 404 Handler
		app.use(() => {
			throw new ApiError('Not found!', 404);
		});

		// Global error handler
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		app.use((err: ApiError, _: Request, res: Response, _next: any) => {
			res.setHeader('Content-Type', 'Application/json');
			res.status(err.status || 500).end(JSON.stringify({ error: { status: err.status || 500, message: err.message || 'Internal Server Error' } }));
		});

		// Start
		const port = process.env.PORT || 7070;

		app.listen(port, () => console.log(`Server started on port ${port}`));
	});
});
