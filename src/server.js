import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import Firebase from './services/firebase';

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());

morgan.token('body', req => JSON.stringify(req.body));
app.use(morgan(':method :url :status - :response-time ms  :body'));

const firebase = new Firebase();

/**
 * Login admin user
 */
app.get('/', async (req, res) => {
  return res.json({
    time: new Date().toISOString(),
    env: process.env, // Just for testing, would never include this is a production app ;-)
  });
});

/**
 * Login admin user
 */
app.post('/api/admin_only', async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminUser = await firebase.login(email, password);
    res.json(adminUser);
  } catch (e) {
    res.status(e.status).json(e);
  }
});

/**
 * Verify Firebase JWT
 */
app.post('/api/token/verify', async (req, res) => {
  try {
    const { idToken } = req.body;
    await firebase.verifyToken(idToken);
    res.end();
  } catch (e) {
    res.status(401).json(e);
  }
});

/**
 * Set user roles
 * TODO Protect route with admin API key or validate existing JWT
 */
app.patch('/api/user/role', async (req, res) => {
  try {
    const { email, isAdmin } = req.body;
    await firebase.updateUserRole(email, isAdmin);
    res.end();
  } catch (e) {
    res.status(401).json(e);
  }
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log('Express server listening on port', port); // eslint-disable-line no-console
});
