import express, { Router, Request, Response } from 'express';
import multer from 'multer';

import { UserInterface, User } from '../models';
import { auth, upload } from '../middleware/intex';

// @ts-ignore
const router: Router = new Router();

router.post('/users', async (req: Request, res: Response) => {
	const user: UserInterface = new User(req.body);

	try {
		await user.save();
		const token: string = await user.generateAuthToken();

		res.status(201).send({ user, token });
	} catch (e) {
		res.status(400).send(e);
	}
});

router.post('/users/login', async (req: Request, res: Response) => {
	try {
		// @ts-ignore
		const user: UserInterface = await User.findByCredentials(req.body.email, req.body.password);
		const token: string = await user.generateAuthToken();
		res.send({ user, token });
	} catch (error) {
		res.status(400).send();
	}
});

router.post('/users/logout', auth, async (req: Request, res: Response) => {
	try {
		// @ts-ignore
		const { user, token } = req;
		const newTokens = user.tokens.filter(t => t.token !== token);
		await User.findByIdAndUpdate(user._id, { tokens: newTokens });

		res.send();
	} catch (error) {
		console.error('logout error', error);
		res.status(500).send();
	}
});

router.post('/users/logoutAll', auth, async (req: Request, res: Response) => {
	try {
		// @ts-ignore
		const { user } = req;
		await User.findByIdAndUpdate(user._id, { tokens: [] });

		res.send();
	} catch (error) {
		console.error('logoutAll error', error);
		res.status(500).send();
	}
});

router.get('/users/me', auth, async (req: Request, res: Response) => {
	// @ts-ignore
	res.send(req.user);
});

router.patch('/users/me', auth, async (req: Request, res: Response) => {
	const updates: string[] = Object.keys(req.body);
	const allowedUpdates: string[] = ['name', 'email', 'password', 'age'];
	const isValidOperation: boolean = updates.every(update => allowedUpdates.includes(update));

	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates!' });
	}

	try {
		// @ts-ignore
		const { user: reqUser } = req;

		if (!reqUser) {
			return res.status(404).send();
		}

		updates.forEach((update: string) => {
			reqUser[update] = req.body[update];
		});

		delete reqUser._id;

		await reqUser.save();

		res.send(reqUser);
	} catch (e) {
		console.error('update error', e);
		res.status(400).send(e);
	}
});

router.delete('/users/me', auth, async (req: Request, res: Response) => {
	try {
		// @ts-ignore
		const user = await User.findByIdAndDelete(req.user._id);

		res.send(user);
	} catch (e) {
		res.status(500).send();
	}
});

router.post('/users/me/avatar', upload.single('avatar'), async (req: Request, res: Response) => {});

export default router;
