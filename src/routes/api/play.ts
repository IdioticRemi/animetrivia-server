import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
	res.end('Wesh gros');
});

export default router;
