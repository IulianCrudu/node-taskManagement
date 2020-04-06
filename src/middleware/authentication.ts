import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../models';
import { TokenPayload } from '../interfaces';

const auth = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const authHeader: string | undefined = req.header('Authorization');
		const token: string | null = authHeader ? authHeader.replace('Bearer ', '') : null;
		if (!token) {
			throw new Error();
		}
		const decoded: TokenPayload | any = jwt.verify(token, '12345');

		const user = await User.findOne({ _id: decoded._id, 'tokens.token': token }).exec();

		if (!user) {
			throw new Error();
		}

		Object.assign(req, { user, token });
		next();
	} catch (error) {
		res.status(401).send({ error: 'Please authenticate' });
	}
};

export default auth;
