import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import Firebase from './firebase';

describe('Firebase', () => {
  let firebase;

  before(() => {
    const userRecord = {
      user: {
        uid: 'x96ynDC0QHUscRUx19LB0ZeQt853',
        idToken:
          'eyJhbGciOiJSUzI1NiIsImtpZCI6IjJmOGI1NTdjMWNkMWUxZWM2ODBjZTkyYWFmY2U0NTIxMWUxZTRiNDEiLCJ0eXAiOiJKV1QifQ.eyJhZG1pbiI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2VjbGlweC00ZmIwZiIsImF1ZCI6ImVjbGlweC00ZmIwZiIsImF1dGhfdGltZSI6MTYwNTQ0Mjg1MCwidXNlcl9pZCI6Ing5NnluREMwUUhVc2NSVXgxOUxCMFplUXQ4NTMiLCJzdWIiOiJ4OTZ5bkRDMFFIVXNjUlV4MTlMQjBaZVF0ODUzIiwiaWF0IjoxNjA1NDQyODUxLCJleHAiOjE2MDU0NDY0NTEsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsiYWRtaW5AdGVzdC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.gAbKD3Ppdv6Y5C9WOycHOYT7iZAXs1XNDmfMIRh_fchklO2pH8p1dNNzL9EiO1PDCiEK2d6DKHQ033_eri012vOor9irjqxqO09K7DgAoOnYKc1hOSoTLUtgmlncRkC38Ghl-S0-XptWAh5vElVdG8tr12sOk7Pr4kBJv18oJCzbZa4yPmfcfbCv91jNhX-73i49D5vjj_BnuSxK6Plk2TBgkv5IsuWn8PQcrAL7o5EKBtP5xou6_R4xTLWLOjgBhq1u_0IfqlJlSO3NIHxnXbzPM1s6ZLkvrpTL2FReYeOCcyCR8uhUeVeu7XFeCcOnCbjd7RAnc97uR87ynteSfw',
        email: 'admin@test.com',
        userRole: {
          admin: true,
        },
      },
    };

    const adminUserRecord = {
      customClaims: {
        admin: true,
      },
    };

    const firebaseMock = {
      initializeApp: sinon.stub(),
      auth: () => ({
        signInWithEmailAndPassword: sinon.stub().resolves(userRecord),
        currentUser: {
          getIdToken: sinon.stub().resolves('1345'),
        },
      }),
    };

    const firebaseAdminMock = {
      initializeApp: sinon.stub(),
      auth: () => ({
        getUser: sinon.stub().resolves(adminUserRecord),
      }),
    };

    firebase = new Firebase(firebaseMock, firebaseAdminMock);
  });

  it('should return an admin user', async () => {
    const actual = await firebase.login('admin@user.com', '123456');
    expect(actual).to.eql({
      uid: 'x96ynDC0QHUscRUx19LB0ZeQt853',
      idToken: '1345',
      email: 'admin@user.com',
      userRole: {
        admin: true,
      },
    });
  });
});
