import express from 'express';
import ytdl from 'ytdl-core';

const router = express.Router();

router.get('/', (req, res) => {
	if (!('videoID' in req.query)) return res.status(400).end('Unknown video, please add "videoID" to query params!');

	const url = `https://www.youtube.com/watch?v=${req.query.videoID}`;

	try {
		console.log(ytdl.getBasicInfo(url));
		ytdl(url, { filter: 'audioonly', quality: 'highestaudio' }).pipe(res);
	} catch (e) {
		console.error(e);
	}
});

export default router;
