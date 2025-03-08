'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function JobMatches() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/jobs/matches');
      if (!res.ok) {
        throw new Error('Failed to fetch matches');
      }
      const data = await res.json();
      setMatches(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Job Matches</h1>

        <div className="grid gap-6">
          {matches.map(job => (
            <div key={job._id} className="bg-card p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
                  <p className="text-muted-foreground mb-2">{job.company}</p>
                  <div className="flex gap-2 mb-4">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      Match Score: {Math.round(job.matchScore * 100)}%
                    </span>
                    <span className="bg-secondary/10 text-secondary-foreground px-2 py-1 rounded text-sm">
                      {job.jobType.replace('_', ' ')}
                    </span>
                    <span className="bg-accent/10 text-accent-foreground px-2 py-1 rounded text-sm">
                      {job.location}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/jobs/${job._id}`}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {matches.length === 0 && (
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">No matching jobs found. Try updating your profile with more skills and preferences.</p>
            <Link href="/profile" className="text-primary hover:underline mt-4 inline-block">
              Update Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 