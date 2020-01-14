import express from 'express';
import ytdl from 'ytdl-core';

const router = express.Router();

router.get('/', (req, res) => {
	if (!('videoID' in req.query)) return res.status(400).end('Unknown video, please add "videoID" to query params!');

	const url = `https://www.youtube.com/watch?v=${req.query.videoID}`;

	try {
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		ytdl.getBasicInfo(url, (err: Error) => {
			try {
				if (err) throw err;
			} catch (e) {
				return res.status(400).end(e.message);
			}
			ytdl(url, { filter: 'audioonly', quality: 'highestaudio' }).pipe(res);
		});
	} catch (e) {
		return res.status(400).end(e.message);
	}
});

export default router;
