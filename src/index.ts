import express from 'express';

import './db/mongoose';
import userRouter from './routers/user';
import taskRouter from './routers/task';

const app: express.Express = express();
const port: string | number = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
	console.log('Server is up on port ' + port);
});
