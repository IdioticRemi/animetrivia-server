import express from 'express';
import { r } from 'rethinkdb-ts';

import { CONFIG } from '@/lib/config';
import { ApiError } from '@/lib/error';

const router = express.Router();

router.get('/', async (req, res, next) => {
	const { id } = req.query;

	if (!id) return next(new ApiError('Please provide a valid "videoId" in query parameters', 400));

	const conn = await r.connect(CONFIG.RETHINK);

	const anime = await r.db('animeTrivia').table('openings').filter(r.row('videoId').eq(id))
		.run(conn);

	if (!anime || !anime[0]) return next(new ApiError('Could not find an opening with this ID', 400));

	res.setHeader('Content-Type', 'Application/json');
	res.end(JSON.stringify(anime[0]));
});

export default router;
