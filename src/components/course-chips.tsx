import type { Course } from "@/lib/courses";

export default function CourseChips({ courses }: { courses: Course[] }) {
  if (courses.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {courses.map((course) => (
        <span
          key={course.code}
          title={course.name}
          className="rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"
        >
          {course.code}
        </span>
      ))}
    </div>
  );
}
