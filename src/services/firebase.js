import * as admin from 'firebase-admin';
import * as firebase from 'firebase';
import firebaseConfig from '../../firebaseConfig.json';
import serviceAccount from '../../firebaseAdminCredentials.json';
import CustomError from '../util/customError';

const { FIREBASE_ADMIN_PRIVATE_KEY } = process.env;

if (!FIREBASE_ADMIN_PRIVATE_KEY) {
  throw new Error('Missing required runtime ENV variable FIREBASE_ADMIN_PRIVATE_KEY. Please add to .env');
}

firebase.initializeApp(firebaseConfig);

serviceAccount.private_key = FIREBASE_ADMIN_PRIVATE_KEY;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://eclipx-4fb0f.firebaseio.com',
});

/**
 * Return a user by email
 * https://firebase.google.com/docs/auth/admin/manage-users
 * @param {string} email
 * @returns {object|Error} https://firebase.google.com/docs/reference/js/firebase.User
 */
const getUserByEmail = async email => admin.auth().getUserByEmail(email);

/**
 * Return the user role (read only or admin user)
 * @param {int} uid
 * @returns {object|Error}
 */
const getUserRole = async uid => {
  const userRecord = await admin.auth().getUser(uid);
  const { customClaims } = userRecord;
  return customClaims || { admin: false };
};

/**
 * Update a user's role in Firebase's custom user claims
 * Useful for e.g upgrading a user's account after purchasing a premium product or setting account wide admin rights from a custom UI
 * https://firebase.google.com/docs/auth/admin/custom-claims
 * @param {string} email
 * @param {booelan=} isAdmin
 * @returns {void|Error}
 */
const updateUserRole = async (email, isAdmin = false) => {
  const userRecord = await getUserByEmail(email);
  const { uid } = userRecord;
  await admin.auth().setCustomUserClaims(uid, { admin: isAdmin });
};

/**
 * Login Firebase user with custom claims
 * https://firebase.google.com/docs/auth/web/password-auth
 * @param {string} email
 * @param {string} password
 * @returns {object|Error} https://firebase.google.com/docs/reference/js/firebase.User
 */
const login = async (email, password) => {
  try {
    const userRecord = await firebase.auth().signInWithEmailAndPassword(email, password);
    const idToken = await firebase.auth().currentUser.getIdToken(true); // Retrieve JWT
    const { uid } = userRecord.user;
    const userRole = await getUserRole(uid);
    const isAdmin = userRole.admin === true;

    if (!isAdmin) {
      throw new CustomError(401);
    }

    return {
      uid,
      idToken,
      email,
      userRole,
    };
  } catch (e) {
    throw new CustomError(401, e.message, e.code);
  }
};

export { getUserByEmail, login, updateUserRole };
