import * as admin from 'firebase-admin';
import * as firebase from 'firebase';
import firebaseConfig from '../../firebaseConfig.json';
import serviceAccount from '../../firebaseAdminCredentials.json';
import CustomError from '../util/customError';

// Insure the real Firebase instance is not initialised during test runs
if (process.env.NODE_ENV !== 'test') {
  firebase.initializeApp(firebaseConfig);
  const { FIREBASE_ADMIN_PRIVATE_KEY } = process.env;

  if (!FIREBASE_ADMIN_PRIVATE_KEY) {
    console.warn('Missing required runtime ENV variable FIREBASE_ADMIN_PRIVATE_KEY'); // eslint-disable-line no-console
  }

  console.log('FIREBASE_ADMIN_PRIVATE_KEY');
  console.log(FIREBASE_ADMIN_PRIVATE_KEY);

  console.log('FIREBASE_ADMIN_PRIVATE_KEY replaced');
  console.log(FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'));

  serviceAccount.private_key = FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://eclipx-4fb0f.firebaseio.com',
  });
}

export default class Firebase {
  constructor(firebaseInstance = firebase, adminInstance = admin) {
    this.firebase = firebaseInstance;
    this.admin = adminInstance;
  }

  /**
   * Return a user by email
   * https://firebase.google.com/docs/auth/admin/manage-users
   * @param {string} email
   * @returns {object|Error} https://firebase.google.com/docs/reference/js/firebase.User
   */
  async getUserByEmail(email) {
    return this.admin.auth().getUserByEmail(email);
  }

  /**
   * Return a user by email
   * https://firebase.google.com/docs/auth/admin/manage-users
   * @param {string} email
   * @returns {object|Error} https://firebase.google.com/docs/reference/js/firebase.User
   */
  async getUserRole(uid) {
    const userRecord = await this.admin.auth().getUser(uid);
    const { customClaims } = userRecord;
    return customClaims || { admin: false };
  }

  /**
   * Verify Firebase issued JWT
   * https://firebase.google.com/docs/auth/admin/verify-id-tokens#web
   * @param {string} idToken
   * @returns {void|Error}
   */
  async verifyToken(idToken) {
    return this.admin.auth().verifyIdToken(idToken);
  }

  /**
   * Update a user's role in Firebase's custom user claims
   * Useful for e.g upgrading a user's account after purchasing a premium product or setting account wide admin rights from a custom UI
   * https://firebase.google.com/docs/auth/admin/custom-claims
   * @param {string} email
   * @param {booelan=} isAdmin
   * @returns {void|Error}
   */
  async updateUserRole(email, isAdmin = false) {
    const userRecord = await this.getUserByEmail(email);
    const { uid } = userRecord;
    await this.admin.auth().setCustomUserClaims(uid, { admin: isAdmin });
  }

  /**
   * Login Firebase user with custom claims
   * https://firebase.google.com/docs/auth/web/password-auth
   * @param {string} email
   * @param {string} password
   * @returns {object|Error} https://firebase.google.com/docs/reference/js/firebase.User
   */
  async login(email, password) {
    try {
      const userRecord = await this.firebase.auth().signInWithEmailAndPassword(email, password);
      const idToken = await this.firebase.auth().currentUser.getIdToken(true); // Retrieve JWT
      const { uid } = userRecord.user;
      const userRole = await this.getUserRole(uid);
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
  }
}
