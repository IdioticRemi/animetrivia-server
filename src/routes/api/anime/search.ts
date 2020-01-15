import express from 'express';
import { r } from 'rethinkdb-ts';

import { CONFIG } from '@/lib/config';

const router = express.Router();

router.get('/', async (req, res) => {
	const { q }: { q: string } = req.query;

	if (!q) return res.status(400).end('Please provide a valid "q" query parameter');

	const conn = await r.connect(CONFIG.RETHINK);

	let searchResults = await r.db('animeTrivia').table('openings')
		.run(conn);

	searchResults = searchResults.filter(a => [...Object.values(a.titles)].map((t: any) => t.toLowerCase().includes(q)).includes(true));

	res.setHeader('Content-Type', 'Application/json');
	res.end(JSON.stringify({ dataCount: searchResults.length, data: searchResults }));
});

export default router;
