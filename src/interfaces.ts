import { Request } from 'express';
import { UserInterface } from './models';

export interface TokenPayload {
	_id: string;
}

export interface CustomRequest {
	user: UserInterface;
	token: string;
}
