import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import uniqBy from 'lodash/uniqBy';

const barColors = ['#a855f7', '#7c3aed', '#9333ea', '#6b21a8', '#8b5cf6', '#c084fc'];

type BarChartData = {
  name: string;
  votes: number;
  fill: string;
};

export default function VotePoll({
  poll,
  allVotes,
}: {
  poll: any;
  allVotes: any[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [votes, setVotes] = useState<any[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [loading, setLoading] = useState(true); // 👈 loading state added

  const settings = poll.settings || {
    allowMultiple: false,
    showResultsBeforeVoting: false,
  };

  useEffect(() => {
    checkVote();
    checkExpiry();
    fetchVotes();
    const channel = subscribeToVotes();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkVote = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await supabase
      .from('votes')
      .select('id')
      .eq('poll_id', poll.id)
      .eq('user_id', userData.user.id);

    setHasVoted(Array.isArray(data) && data.length > 0);
  };

  const checkExpiry = () => {
    if (poll.ends_at) {
      const now = new Date();
      const endsAt = new Date(poll.ends_at);
      setIsExpired(now > endsAt);
    }
  };

  const fetchVotes = async () => {
    setLoading(true); // 👈 start loading
    const { data } = await supabase
      .from('votes')
      .select('id, selected_options, user_id')
      .eq('poll_id', poll.id);
    setVotes(data || []);
    setLoading(false); // 👈 end loading
  };

  const subscribeToVotes = () => {
    const channel = supabase
      .channel(`poll-${poll.id}`, {
        config: {
          presence: { key: `${Math.random()}` },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `poll_id=eq.${poll.id}`,
        },
        (payload) => {
          setVotes((prev) =>
            uniqBy([...prev, payload.new], (v) => v.id)
          );
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const count = Object.keys(presenceState).length;
        setViewerCount(count);
      })
      .subscribe();

    return channel;
  };

  const castVote = async () => {
    if (isExpired) return alert('Voting has ended for this poll.');
    if (selected.length === 0) return alert('Please select at least one option.');

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return alert('You must be logged in to vote.');

    const { error } = await supabase.from('votes').insert({
      poll_id: poll.id,
      user_id: userData.user.id,
      selected_options: selected,
    });

    if (error) {
      alert(error.message);
    } else {
      setHasVoted(true);
      fetchVotes();
    }
  };

  const getVoteCount = (option: string) =>
    votes.filter((v) => v.selected_options?.includes(option)).length;

  const data = poll.options.map((opt: string, i: number) => ({
    name: opt,
    votes: getVoteCount(opt),
    fill: barColors[i % barColors.length],
  }));

  const handleOptionChange = (option: string, checked: boolean) => {
    if (settings.allowMultiple) {
      setSelected((prev) =>
        checked ? [...prev, option] : prev.filter((opt) => opt !== option)
      );
    } else {
      setSelected([option]);
    }
  };

  const canShowChart =
    settings.showResultsBeforeVoting || hasVoted || isExpired;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-gray-800">{poll.question}</h3>
        <span className="text-sm text-purple-600">👥 {viewerCount} online</span>
      </div>

      {poll.ends_at && (
        <p className="text-xs text-gray-500">
          ⏰ Ends at: {new Date(poll.ends_at).toLocaleString()}
        </p>
      )}

      {isExpired && (
        <p className="text-red-600 font-medium text-sm">❌ Voting has ended</p>
      )}

      {hasVoted && !isExpired && (
        <p className="text-green-600 font-medium text-sm">✅ Your vote has been recorded</p>
      )}

      {/* 🌀 Spinner while loading votes */}
      {loading && !hasVoted && (
        <div className="flex justify-center items-center py-6">
          <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && !isExpired && !hasVoted && (
        <div className="space-y-3">
          {poll.options.map((opt: string) => (
            <label
              key={opt}
              className="flex items-center gap-3 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 px-4 py-2 rounded-lg cursor-pointer transition"
            >
              <input
                type={settings.allowMultiple ? 'checkbox' : 'radio'}
                name={`poll-${poll.id}`}
                value={opt}
                checked={selected.includes(opt)}
                onChange={(e) =>
                  handleOptionChange(opt, e.target.checked)
                }
                className="accent-purple-600"
              />
              <span className="font-medium">{opt}</span>
            </label>
          ))}

          <button
            onClick={castVote}
            disabled={selected.length === 0}
            className="w-full py-2 mt-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-md hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 transition"
          >
            Submit Vote
          </button>
        </div>
      )}

      {!loading && canShowChart && (
        <div className="mt-6 h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#8884d8" />
              <YAxis allowDecimals={false} stroke="#8884d8" />
              <Tooltip />
              <Bar dataKey="votes">
                {data.map((entry: BarChartData) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
