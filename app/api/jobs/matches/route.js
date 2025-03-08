import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
import Profile from '@/models/Profile';
import { calculateMatchScore } from '@/lib/matching';

export async function GET(request) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || session.user.role !== 'candidate') {
      return NextResponse.json(
        { message: 'Unauthorized - Only candidates can view job matches' },
        { status: 401 }
      );
    }

    // Get candidate's profile
    const profile = await Profile.findOne({ user: session.user.id });
    if (!profile) {
      return NextResponse.json(
        { message: 'Profile not found - Please create a profile first' },
        { status: 404 }
      );
    }

    // Get all active jobs
    const jobs = await Job.find({ status: 'active' });

    // Calculate match scores and sort jobs
    const matchedJobs = jobs.map(job => ({
      ...job.toObject(),
      matchScore: calculateMatchScore(job, profile)
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json(matchedJobs);
  } catch (error) {
    console.error('Job matches GET error:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching job matches' },
      { status: 500 }
    );
  }
} 