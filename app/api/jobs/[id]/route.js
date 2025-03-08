import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
import { isValidObjectId } from 'mongoose';

// GET single job
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // Await params before accessing properties
    const { id } = await params;
    
    // Get and validate the ID
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid job ID format' },
        { status: 400 }
      );
    }
    
    const job = await Job.findById(id).populate('employer', '_id name email');
    
    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(job);
  } catch (error) {
    console.error('Job GET error:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching job' },
      { status: 500 }
    );
  }
}

// PUT/update job
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const session = await auth();
    
    // Await params before accessing properties
    const { id } = await params;
    
    // Get and validate the ID
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid job ID format' },
        { status: 400 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    if (job.employer.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized to edit this job' },
        { status: 403 }
      );
    }
    
    const updates = await request.json();
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Job PUT error:', error);
    return NextResponse.json(
      { message: error.message || 'Error updating job' },
      { status: 500 }
    );
  }
}

// DELETE job
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const session = await auth();
    
    // Await params before accessing properties
    const { id } = await params;
    
    // Get and validate the ID
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid job ID format' },
        { status: 400 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    if (job.employer.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized to delete this job' },
        { status: 403 }
      );
    }
    
    await Job.findByIdAndDelete(id);
    
    return NextResponse.json(
      { message: 'Job deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Job DELETE error:', error);
    return NextResponse.json(
      { message: error.message || 'Error deleting job' },
      { status: 500 }
    );
  }
}
