import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Profile from '@/models/Profile';
import Job from '@/models/Job';

// GET profiles (admin or for matching)
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    const session = await auth();
    
    // Restrict access based on role
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Build query
    const query = {};
    
    // For job matching - find candidates matching a job ID
    const jobId = searchParams.get('jobId');
    
    if (jobId) {
      // Enhanced functionality would retrieve the job and use its details
      // to find matching candidate profiles based on skills, experience, etc.
      // This is simplified matching logic
      const job = await Job.findById(jobId);
      
      if (!job) {
        return NextResponse.json(
          { message: 'Job not found' },
          { status: 404 }
        );
      }
      
      // Match based on skills
      if (job.skills && job.skills.length > 0) {
        query.skills = { $in: job.skills };
      }
    }
    
    // Handle pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const profiles = await Profile.find(query)
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email');
    
    const totalProfiles = await Profile.countDocuments(query);
    
    return NextResponse.json({
      profiles,
      totalPages: Math.ceil(totalProfiles / limit),
      currentPage: page,
      totalProfiles
    });
  } catch (error) {
    console.error('Profiles GET error:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching profiles' },
      { status: 500 }
    );
  }
}

// POST new profile
export async function POST(request) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ user: session.user.id });
    if (existingProfile) {
      return NextResponse.json(
        { message: 'Profile already exists. Use PUT to update.' },
        { status: 400 }
      );
    }

    const data = await request.json();
    data.user = session.user.id;

    const profile = await Profile.create(data);
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error('Profile POST error:', error);
    return NextResponse.json(
      { message: error.message || 'Error creating profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const profile = await Profile.findOneAndUpdate(
      { user: session.user.id },
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json(
      { message: error.message || 'Error updating profile' },
      { status: 500 }
    );
  }
}
