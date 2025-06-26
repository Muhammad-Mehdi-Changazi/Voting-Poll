import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PollIcon from '../Svgs/PollSvg'
const AuthPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    let result;
    if (isLogin) {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }

    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success(isLogin ? 'Logged in!' : 'Signed up!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Column */}
      <div className="md:w-1/2 w-full bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 text-white flex flex-col justify-center items-center p-10">
        <div className="flex items-center space-x-3 mb-4">
          <PollIcon />
          <h1 className="text-5xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-white to-pink-100 drop-shadow-xl">
            PulseVote
          </h1>
        </div>
        <p className="text-center max-w-md text-white/90 text-lg">
          Join the community! Create exciting polls or vote on trending topics. Your voice matters.
        </p>
      </div>

      {/* Right Column */}
      <div className="md:w-1/2 w-full bg-gray-50 flex justify-center items-center p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            {isLogin
              ? 'Login to join and vote in exciting polls'
              : 'Sign up to start voting & creating polls'}
          </p>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition duration-200"
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 hover:underline cursor-pointer font-semibold"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
