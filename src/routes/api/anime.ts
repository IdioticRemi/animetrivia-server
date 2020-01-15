import express from 'express';
import Kitsu from 'kitsu';
import fetch from 'node-fetch';
import { r } from 'rethinkdb-ts';
import { CONFIG } from '@/lib/config';

const KitsuAPI = new Kitsu();
const YTKEY = CONFIG.YOUTUBE;

const router = express.Router();

router.get('/', async (req, res) => {
	let data: any[] = [];
	const { count }: { count: number } = req.query;

	if (!count || isNaN(count)) return res.status(400).end('Please provide a valid "count" in query parameters!');

	const conn = await r.connect(CONFIG.RETHINK);

	for (let i = 1; i < count; i += 20) {
		const kitsuData = await KitsuAPI.get('anime', {
			page: {
				limit: 20,
				offset: i - 1
			},
			fields: {
				anime: 'titles'
			},
			sort: 'popularityRank'
		});

		kitsuData.data = kitsuData.data.splice(0, count < 20 ? count : 20);
		console.log(i);

		const promises = kitsuData.data.map(async (anime: any) => new Promise(async resolve => {
			try {
				const dbData = await Promise.resolve(r.db('animeTrivia').table('openings').get(anime.id)
					.run(conn));

				if (dbData) {
					return resolve(dbData);
				}

				const name = anime.titles.en || anime.titles.en_us || anime.titles.en_jp || anime.titles.ja_jp;
				const yt: any = await Promise.resolve(getURLfromName(YTKEY as string, `opening ${name}`, 1));

				if (!yt.items) {
					throw new Error('Rate limited :(');
				}

				const newData = {
					name,
					id: anime.id,
					videoId: yt.items[0].id.videoId,
					titles: { en: anime.titles.en || anime.titles.en_us, en_jp: anime.titles.en_jp, jp: anime.titles.ja_jp }
				};

				await Promise.resolve(r.db('animeTrivia').table('openings').insert(newData)
					.run(conn));

				resolve(newData);
			} catch (e) {
				resolve({ error: e.message });
			}
		}));

		const re = await Promise.all(promises);

		data = data.concat(re);
	}

	res.setHeader('Content-Type', 'Application/json');
	res.end(JSON.stringify({
		dataCount: {
			valid: data.filter(d => !('error' in d)).length,
			errored: data.filter(d => ('error' in d)).length,
			total: data.length
		},
		data
	}));
});

export default router;

function getURLfromName(key: string, name: string, limit: number) {
	return new Promise(async (resolve, reject) => {
		try {
			const res = await fetch(`https://www.googleapis.com/youtube/v3/search?q=${escape(name)}&key=${key}&maxResults=${limit}&part=id`)
				.then(res => res.json());

			resolve(res);
		} catch (e) {
			reject(e);
		}
	});
}
