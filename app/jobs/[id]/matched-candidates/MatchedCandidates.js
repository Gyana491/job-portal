'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function MatchedCandidates({ id }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMatchedCandidates = useCallback(async () => {
    try {
      // Fetch job details first
      const jobRes = await fetch(`/api/jobs/${id}`);
      if (!jobRes.ok) throw new Error('Failed to fetch job details');
      const jobData = await jobRes.json();
      setJob(jobData);

      // Fetch matched candidates
      const res = await fetch(`/api/matches?jobId=${id}`);
      if (!res.ok) throw new Error('Failed to fetch matched candidates');
      const data = await res.json();
      setCandidates(data.matches);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    if (session?.user.role !== 'employer') {
      router.push('/dashboard');
      return;
    }
    fetchMatchedCandidates();
  }, [session, router, fetchMatchedCandidates]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/jobs/my-listings" 
            className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-2"
          >
            <span>←</span> Back to My Listings
          </Link>
          <h1 className="text-3xl font-bold mt-4">Matched Candidates</h1>
          {job && (
            <p className="text-muted-foreground mt-2">
              For: {job.title} at {job.company}
            </p>
          )}
        </div>

        {candidates.length > 0 ? (
          <div className="grid gap-6">
            {candidates.map((match) => (
              <div key={match.profile._id} className="bg-card p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-4 w-full">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {match.profile.user.name}
                      </h2>
                      <p className="text-muted-foreground">{match.profile.title}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Match Score</h3>
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-secondary rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${Math.round(match.score * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(match.score * 100)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {match.profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Experience</h3>
                      <p className="text-muted-foreground">
                        {match.profile.experience?.length || 0} years
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Location</h3>
                      <p className="text-muted-foreground">{match.profile.location}</p>
                    </div>

                    {match.profile.linkedin && (
                      <Link
                        href={match.profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors gap-2"
                      >
                        View LinkedIn Profile
                        <span>→</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">No matching candidates found.</p>
          </div>
        )}
      </div>
    </div>
  );
} 