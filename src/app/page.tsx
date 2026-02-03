import { getCourses } from '@/app/services/course/courseApi';
import HomeContent from './components/HomeContent/HomeContent';

export default async function Home() {
  let courses;
  try {
    courses = await getCourses();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка загрузки курсов';
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Ошибка загрузки курсов: {message}
      </div>
    );
  }
  return <HomeContent courses={courses} />;
}
