import React from 'react';
import CourseCard from './CourseCard';

export default function CourseList({ courses }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses?.map((c, i) => (
        <CourseCard key={i} title={c.title} description={c.description} difficulty={c.difficulty} duration={c.duration} />
      ))}
    </div>
  );
}