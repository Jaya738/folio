import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';

const LoginPage = () => {
  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .catch((error) => {
        console.error("Authentication Error:", error);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome to Folio
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Your personal finance dashboard.</p>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;