import express from 'express';
import { r } from 'rethinkdb-ts';

import { CONFIG } from '@/lib/config';


const router = express.Router();

router.get('/', async (req, res) => {
	const conn = await r.connect(CONFIG.RETHINK);

	const all = await r.db('animeTrivia').table('openings')
		.run(conn);

	console.log(all);
	const anime = all[Math.floor(Math.random() * (all.length - 1))];
	console.log(`\n${anime}`);

	res.setHeader('Content-Type', 'Application/json');
	res.end(JSON.stringify(anime));
});

export default router;
