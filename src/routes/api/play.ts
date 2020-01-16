import express from 'express';
// @ts-ignore
import ytdl from 'ytdl-core';
import { ApiError } from '@/lib/error';

const router = express.Router();

router.get('/', async (req, res, next) => {
	if (!('videoID' in req.query)) return next(new ApiError('Unknown video, please add "videoID" to query params!', 400));
	const url = `https://www.youtube.com/watch?v=${req.query.videoID}`;

	try {
		await ytdl.getBasicInfo(url);
		ytdl(url, { filter: 'audioonly' }).pipe(res);
	} catch (e) {
		return next(new ApiError(e.message, 400));
	}
});

export default router;
