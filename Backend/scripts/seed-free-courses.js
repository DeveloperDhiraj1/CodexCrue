const mongoose = require('mongoose');
const config = require('../src/config/env');
const Course = require('../src/models/Course');
const { FREE_PUBLIC_COURSES: courses } = require('../src/services/publicCourseCatalog.service');

async function run() {
  await mongoose.connect(config.mongoUri);
  for (const course of courses) await Course.updateOne({ sourceUrl: course.sourceUrl }, { $set: course }, { upsert: true, runValidators: true });
  console.log(`Seeded ${courses.length} free public courses.`);
  await mongoose.disconnect();
}

run().catch(async (error) => { console.error(error.message); await mongoose.disconnect(); process.exit(1); });
