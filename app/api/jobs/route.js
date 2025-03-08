import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';

// GET jobs (can be filtered)
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    // Build query
    const query = { status: 'active' };
    
    // Search term
    const search = searchParams.get('search');
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filters
    const jobType = searchParams.get('jobType');
    if (jobType) query.jobType = jobType;
    
    const workType = searchParams.get('workType');
    if (workType) query.workType = workType;
    
    const location = searchParams.get('location');
    if (location) query.location = { $regex: location, $options: 'i' };
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Handle candidate ID for job matching
    const candidateId = searchParams.get('candidateId');
    if (candidateId) {
      // Endpoint will need to be enhanced to match against candidate profile
      // This would involve retrieving the candidate profile first
      // and then using its data for matching jobs
      // This is placeholder logic
    }
    
    // Get jobs
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('employer', 'name');
    
    const totalJobs = await Job.countDocuments(query);
    
    return NextResponse.json({ 
      jobs, 
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: page,
      totalJobs 
    });
  } catch (error) {
    console.error('Jobs GET error:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching jobs' },
      { status: 500 }
    );
  }
}

// POST new job
export async function POST(request) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { message: 'Unauthorized - Only employers can post jobs' },
        { status: 401 }
      );
    }

    const data = await request.json();
    data.employer = session.user.id;

    const job = await Job.create(data);

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Job POST error:', error);
    return NextResponse.json(
      { message: error.message || 'Error creating job' },
      { status: 500 }
    );
  }
}
