import mongoose, { Schema, Document } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../interfaces';
import { TaskInterface } from './task';
import { Task } from './index';

interface UserToken {
	token: string;
}

interface UserPublicProfile {
	name: string;
	email: string;
	age: number;
	tasks?: TaskInterface[];
}

export interface UserInterface extends Document {
	//properties
	name: string;
	email: string;
	password: string;
	age: number;
	tokens: UserToken[];
	//methods
	generateAuthToken(): Promise<string>;
	getPublicProfile(): UserPublicProfile;
}

const UserSchema: Schema<UserInterface> = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			validate(value) {
				return validator.isEmail(value);
			},
		},
		password: {
			type: String,
			required: true,
			minlength: 7,
			trim: true,
			validate(value) {
				return !value.toLowerCase().includes('password');
			},
		},
		age: {
			type: Number,
			default: 0,
			validate(value) {
				return value >= 0;
			},
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

UserSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id ',
	foreignField: 'user',
});

// eslint-disable-next-line prettier/prettier
UserSchema.method('generateAuthToken', async  function(this: UserInterface) {
	const user: UserInterface = this;

	const tokenPayload: TokenPayload = {
		_id: user._id.toString(),
	};
	const token: string = jwt.sign(tokenPayload, '12345');

	user.tokens = user.tokens.concat({ token });

	await user.save();

	return token;
});

UserSchema.method('toJSON', function(this: UserInterface) {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;

	return userObject;
});

UserSchema.static('findByCredentials', async function(email, password) {
	// eslint-disable-next-line @typescript-eslint/no-use-before-define
	const user = await User.findOne({ email });

	if (!user) {
		throw new Error('Unable to login');
	}

	const passwordsMatch: boolean = await bcrypt.compare(password, user.password);

	if (!passwordsMatch) {
		throw new Error('Unable to login');
	}

	return user;
});

//Hashes the password before saving
UserSchema.pre('save', async function(next) {
	const user = this;

	const isPasswordModified: boolean = user.isModified('password');

	if (isPasswordModified) {
		// @ts-ignore
		user.password = await bcrypt.hash(user.password, 8);
	}

	next();
});

//Delete user tasks before user is removed
UserSchema.pre('remove', async function(next) {
	const user = this;

	await Task.deleteMany({ user: user._id });

	next();
});

const User: mongoose.Model<UserInterface> = mongoose.model('User', UserSchema);

export default User;
