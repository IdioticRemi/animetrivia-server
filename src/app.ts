import 'module-alias/register';

import express from 'express';
import cors from 'cors';
import { scan, Stats } from 'fs-nextra';

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

	// Start
	const port = process.env.PORT || 7070;

	app.listen(port, () => console.log(`Server started on port ${port}`));
});