import { useEffect, useState } from 'react';
import VotePoll from './VotePoll';
import { supabase } from '../supabase';

interface Poll {
  id: string;
  question: string;
  options: string[];
  created_at: string;
  ends_at?: string | null;
  settings?: any;
}

export default function PollsPage({ polls }: { polls: Poll[] }) {
  const [page, setPage] = useState(1);
  const [votes, setVotes] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);

  const pollsPerPage = 9;
  const totalPages = Math.ceil(polls.length / pollsPerPage);
  const start = (page - 1) * pollsPerPage;
  const currentPolls = polls.slice(start, start + pollsPerPage);

  useEffect(() => {
    fetchVotesForCurrentPage();
  }, [page]);

  const fetchVotesForCurrentPage = async () => {
    setLoading(true);
    const pollIds = currentPolls.map((p) => p.id);
    const { data } = await supabase
      .from('votes')
      .select('*')
      .in('poll_id', pollIds);

    // Group by poll_id
    const grouped: Record<string, any[]> = {};
    pollIds.forEach((id) => {
      grouped[id] = data?.filter((v) => v.poll_id === id) || [];
    });

    setVotes(grouped);
    setLoading(false);
  };

  return (
    <>
      {currentPolls.length === 0 ? (
        <p className="text-gray-600 col-span-full">No polls to show.</p>
      ) : loading ? (
        <div className="col-span-full text-center text-purple-600 font-medium">
          Loading polls...
        </div>
      ) : (
        <>
          {currentPolls.map((poll) => (
            <div
              key={poll.id}
              className="bg-white border border-gray-200 rounded-lg shadow-md p-5 hover:shadow-lg transition duration-300"
            >
              <VotePoll poll={poll} allVotes={votes[poll.id] || []} />
            </div>
          ))}

          {/* Pagination */}
          <div className="col-span-full flex justify-center items-center gap-4 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 disabled:opacity-50"
            >
              ← Previous
            </button>
            <span className="text-gray-700 font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </>
  );
}
