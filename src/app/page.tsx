import styles from './HomePage.module.css';
import CourseCard from './components/CourseCard';

const courses = [
  {
    id: 1,
    title: 'Йога',
    duration: '23 дней',
    timePerDay: '30-50 мин/день',
    category: 'Йога',
    difficulty: 'Сложность: Начальный',
    image: '/images/yoga.jpg',
  },
  {
    id: 2,
    title: 'Стретчинг',
    duration: '25 дней',
    timePerDay: '30-50 мин/день',
    category: 'Стретчинг',
    difficulty: 'Сложность: Начальный',
    image: '/images/stretching.jpg',
  },
  {
    id: 3,
    title: 'Фитнес',
    duration: '25 дней',
    timePerDay: '30-50 мин/день',
    category: 'Фитнес',
    difficulty: 'Сложность: Средний',
    image: '/images/fitness.jpg',
  },
  {
    id: 4,
    title: 'Степ-аэробика',
    duration: '22 дней',
    timePerDay: '30-50 мин/день',
    category: 'Кардио',
    difficulty: 'Сложность: Средний',
    image: '/images/step-aerobics.jpg',
  },
  {
    id: 5,
    title: 'Бодифлекс',
    duration: '25 дней',
    timePerDay: '30-50 мин/день',
    category: 'Дыхание',
    difficulty: 'Сложность: Начальный',
    image: '/images/bodyflex.jpg',
  },
];

export default function Home() {
  return (
    <div className={styles.mainContainer}>
      <h1 className={styles.heading}>
        Начните заниматься спортом
        <br />и улучшите качество жизни
      </h1>
      <div className={styles.coursesGrid}>
        {courses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>
    </div>
  );
}
