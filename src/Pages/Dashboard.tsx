import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import CreatePoll from '../Pages/CreatePoll';
import PollsPage from './PollsPage';

function Dashboard() {
  const [polls, setPolls] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userName, setUserName] = useState('User');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPolls();
    fetchUser();

    const channel = supabase
      .channel('polls-live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'polls',
        },
        (payload) => {
          setPolls((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPolls = async () => {
    const { data } = await supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false });
    setPolls(data || []);
  };

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserName(user.email || 'User');
    }
  };

  // Filter polls by question (case insensitive)
  const pollsToShow = polls.filter((poll) =>
    poll.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white py-4 px-8 shadow flex justify-between items-center">
        <h1 className="text-2xl font-extrabold tracking-wide">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, <strong>{userName}</strong></span>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-white text-purple-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            + Create Poll
          </button>
        </div>
      </div>

      {/* Create Poll Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[999]">
          <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6 relative">
            <button
              onClick={() => setShowCreateForm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <CreatePoll
              onPollCreated={() => {
                fetchPolls();
                setShowCreateForm(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Polls Section */}
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🔮 What Do You Think?</h2>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search polls by question..."
            className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <PollsPage polls={pollsToShow} />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
