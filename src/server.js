import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { login, updateUserRole } from './services/firebase';

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());

app.post('/api/admin_only', async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminUser = await login(email, password);
    res.json(adminUser);
  } catch (e) {
    res.status(e.status).json(e);
  }
});

app.patch('/api/user/role', async (req, res) => {
  try {
    const { email, isAdmin } = req.body;
    await updateUserRole(email, isAdmin);
    res.end();
  } catch (e) {
    res.status(401).json(e);
  }
});

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`)); // eslint-disable-line no-console
