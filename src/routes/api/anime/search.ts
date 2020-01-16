import express from 'express';
import { r } from 'rethinkdb-ts';

import { CONFIG } from '@/lib/config';
import { ApiError } from '@/lib/error';

const router = express.Router();

router.get('/', async (req, res, next) => {
	const { q }: { q: string } = req.query;

	if (!q) return next(new ApiError('Please provide a valid "q" query parameter', 400));

	const conn = await r.connect(CONFIG.RETHINK);

	let searchResults = await r.db('animeTrivia').table('openings')
		.run(conn);

	searchResults = searchResults.filter(a => [...Object.values(a.titles)].map((t: any) => (t || '').toLowerCase().includes(q)).includes(true));

	res.setHeader('Content-Type', 'Application/json');
	res.end(JSON.stringify({ dataCount: searchResults.length, data: searchResults }));
});

export default router;
