import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  skills: [{
    type: String,
    required: true
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    from: Date,
    to: Date,
    current: Boolean,
    description: String
  }],
  education: [{
    school: String,
    degree: String,
    fieldOfStudy: String,
    from: Date,
    to: Date,
    current: Boolean
  }],
  bio: String,
  location: String,
  contactEmail: String,
  phone: String,
  linkedin: String,
  github: String,
  website: String,
  resumeUrl: String,
  availability: {
    type: String,
    enum: ['immediate', 'two_weeks', 'month', 'not_available'],
    default: 'immediate'
  },
  preferredJobTypes: [{
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'internship']
  }],
  preferredLocations: [String],
  expectedSalary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  }
}, {
  timestamps: true
});

// Add text index for search
profileSchema.index({
  title: 'text',
  skills: 'text',
  'experience.title': 'text',
  'experience.company': 'text',
  'education.fieldOfStudy': 'text'
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
export default Profile;


