import app from './src/app.js';
import connectDB from './src/config/db.js';

const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(port, () => console.log(`RecycleRewards API listening on http://localhost:${port}`));
};

startServer();
