import mongoose, { Schema, Document } from 'mongoose';
import { UserInterface } from './user';

export interface TaskInterface extends Document {
	description: string;
	completed: boolean;
	user: Schema.Types.ObjectId | UserInterface;
}

const TaskSchema: Schema = new Schema(
	{
		description: {
			type: String,
			required: true,
			trim: true,
		},
		completed: {
			type: Boolean,
			default: false,
		},
		user: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
	},
	{
		timestamps: true,
	}
);

const Task: mongoose.Model<TaskInterface> = mongoose.model('Task', TaskSchema);

export default Task;
