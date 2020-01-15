import express from 'express';
// @ts-ignore
import youtubeStream from 'youtube-audio-stream';

const router = express.Router();

router.get('/', (req, res) => {
	if (!('videoID' in req.query)) return res.status(400).end('Unknown video, please add "videoID" to query params!');

	const url = `https://www.youtube.com/watch?v=${req.query.videoID}`;

	try {
		youtubeStream(url, { filter: 'audioonly', quality: 'highestaudio' }).pipe(res);
	} catch (e) {
		return res.status(400).end(e.message);
	}
});

export default router;
