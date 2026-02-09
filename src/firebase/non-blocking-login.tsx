
'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider,
  UserCredential,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  return signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google sign-in with a popup (asynchronous). */
export function initiateGoogleSignIn(authInstance: Auth): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(authInstance, provider);
}

/**
 * Handles the result from a sign-in with redirect operation.
 * This should be called when the component that initiated the redirect mounts.
 * @param authInstance The Firebase Auth instance.
 * @param onComplete A callback function to run when the operation is complete (successfully or not).
 * @param onError A callback function to handle any errors that occurred.
 */
export function handleRedirectResult(
  authInstance: Auth,
  onComplete: () => void,
  onError: (error: Error) => void
): void {
  getRedirectResult(authInstance)
    .then((result: UserCredential | null) => {
      // The onAuthStateChanged listener will handle the user state update.
      // This function can be used to know when the redirect has been processed.
      onComplete();
    })
    .catch((error) => {
      // Handle Errors here.
      onError(error);
    });
}
