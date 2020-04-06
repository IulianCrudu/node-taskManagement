import express, { Router, Response, Request } from 'express';
import { TaskInterface, Task } from '../models';
import { auth } from '../middleware/intex';

// @ts-ignore
const router: Express.Router = new Router();

router.post('/tasks', auth, async (req: Request, res: Response) => {
	const task = new Task({
		...req.body,
		// @ts-ignore
		user: req.user._id,
	});

	try {
		await task.save();
		res.status(201).send(task);
	} catch (e) {
		res.status(400).send(e);
	}
});

router.get('/tasks', auth, async (req: Request, res: Response) => {
	try {
		// @ts-ignore
		const tasks = await Task.find({ user: req.user._id });
		res.send(tasks);
	} catch (e) {
		res.status(500).send();
	}
});

router.get('/tasks/:id', auth, async (req: Request, res: Response) => {
	const _id = req.params.id;

	try {
		// @ts-ignore
		const task = await Task.findOne({ _id, owner: req.user._id });

		if (!task) {
			return res.status(404).send();
		}

		res.send(task);
	} catch (e) {
		res.status(500).send();
	}
});

router.patch('/tasks/:id', auth, async (req: Request, res: Response) => {
	const updates: string[] = Object.keys(req.body);
	const allowedUpdates: string[] = ['description', 'completed'];
	const isValidOperation: boolean = updates.every(update => allowedUpdates.includes(update));

	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates!' });
	}

	try {
		// @ts-ignore
		const task: TaskInterface | null = await Task.findOne({ _id: req.params.id, user: req.user._id });

		if (!task) {
			return res.status(404).send();
		}

		updates.forEach((update: string) => (task[update] = req.body[update]));

		await task.save();

		res.send(task);
	} catch (e) {
		res.status(400).send(e);
	}
});

router.delete('/tasks/:id', auth, async (req: Request, res: Response) => {
	try {
		const task = await Task.findOneAndDelete({
			_id: req.params.id,
			// @ts-ignore
			user: req.user._id,
		});

		if (!task) {
			res.status(404).send();
		}

		res.send(task);
	} catch (e) {
		res.status(500).send();
	}
});

export default router;
