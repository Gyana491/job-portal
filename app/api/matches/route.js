import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
import Profile from '@/models/Profile';
import { calculateMatchScore } from '@/lib/matching';

// GET matches for a job or candidate
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const jobId = searchParams.get('jobId');
    const candidateId = searchParams.get('candidateId');
    
    let matches = [];

    if (jobId) {
      // Find candidates matching a job
      const job = await Job.findById(jobId);
      if (!job) {
        return NextResponse.json(
          { message: 'Job not found' },
          { status: 404 }
        );
      }

      const candidates = await Profile.find({}).populate('user', 'name email');
      matches = candidates.map(profile => ({
        profile,
        score: calculateMatchScore(job, profile)
      }));

    } else if (candidateId) {
      // Find jobs matching a candidate
      const profile = await Profile.findById(candidateId);
      if (!profile) {
        return NextResponse.json(
          { message: 'Profile not found' },
          { status: 404 }
        );
      }

      const jobs = await Job.find({ status: 'active' }).populate('employer', 'name');
      matches = jobs.map(job => ({
        job,
        score: calculateMatchScore(job, profile)
      }));
    }

    // Sort by score and return top matches
    matches.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      matches: matches.slice(0, 10), // Return top 10 matches
      total: matches.length
    });

  } catch (error) {
    console.error('Matching error:', error);
    return NextResponse.json(
      { message: error.message || 'Error finding matches' },
      { status: 500 }
    );
  }
}

