// src/models/User.js

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name.'],
    maxlength: [100, 'Full name cannot be more than 100 characters'],
  },
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    maxlength: [60, 'Username cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
  },
  role: {
    type: String,
    default: "user" // Set a default value for new users
  },
  status: {
    type: String,
    default: "active" // Set a default value for new users
  },
  created_at: {
    type: Date,
    default: Date.now // Mongoose will automatically set this
  },
  updated_at: {
    type: Date,
    default: Date.now // Mongoose will automatically set this
  },
  last_login: {
    type: Date,
    default: Date.now // Mongoose will automatically set this
  },
  login_count: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: ""
  }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;