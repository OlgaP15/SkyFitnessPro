import { getCourseById } from '@/app/services/course/courseApi';
import CoursePageContent from './CoursePageContent';
import styles from './CoursePage.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CoursePage({ params }: PageProps) {
  const { id: courseId } = await params;

  let course;
  try {
    course = await getCourseById(courseId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Курс не найден';
    return (
      <div className={styles.coursePage}>
        <div className={styles.notFound}>{message}</div>
      </div>
    );
  }
  return <CoursePageContent course={course} />;
}
