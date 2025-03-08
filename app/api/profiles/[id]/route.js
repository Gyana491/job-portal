import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Profile from '@/models/Profile';

// GET single profile
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const profile = await Profile.findById(params.id).populate('user', 'name email');
    
    if (!profile) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching profile' },
      { status: 500 }
    );
  }
}

// PUT/update profile
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const profile = await Profile.findById(params.id);
    
    if (!profile) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }
    
    // Only allow users to update their own profile
    if (profile.user.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized - Not the profile owner' },
        { status: 403 }
      );
    }
    
    const updates = await request.json();
    
    // Prevent changing user association
    delete updates.user;
    
    const updatedProfile = await Profile.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json(
      { message: error.message || 'Error updating profile' },
      { status: 500 }
    );
  }
}

// DELETE profile
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const profile = await Profile.findById(params.id);
    
    if (!profile) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }
    
    if (profile.user.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized - Not the profile owner' },
        { status: 403 }
      );
    }
    
    await Profile.findByIdAndDelete(params.id);
    
    return NextResponse.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Profile DELETE error:', error);
    return NextResponse.json(
      { message: error.message || 'Error deleting profile' },
      { status: 500 }
    );
  }
}
