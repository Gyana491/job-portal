import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';

export async function GET() {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { message: 'Unauthorized - Only employers can view their listings' },
        { status: 401 }
      );
    }

    const jobs = await Job.find({ employer: session.user.id })
      .sort({ createdAt: -1 });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Employer jobs GET error:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching employer jobs' },
      { status: 500 }
    );
  }
} 