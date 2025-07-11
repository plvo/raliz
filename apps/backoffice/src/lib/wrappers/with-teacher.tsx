import { getTeacher } from '@/actions/teacher/get';
import { auth } from '@/lib/auth';
import type { Teacher } from '@repo/db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export function withTeacher<P extends object>(Page: React.ComponentType<P & { teacher: Teacher }>) {
  return async function WithTeacherWrapper(props: Omit<P, 'teacher'>) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const headersList = await headers();
    const pathname = headersList.get('x-current-path') || '/';

    if (!session?.user?.id) {
      redirect('/connexion');
    }

    const res = await getTeacher(session.user.id);

    if (!res.ok || !res.data) {
      redirect('/connexion');
    }

    const teacher = res.data;
    const teacherHasSchool = teacher.School && teacher.School.length > 0;

    if (!teacherHasSchool && pathname !== '/init') {
      redirect('/init');
    }

    if (teacherHasSchool && pathname === '/init') {
      redirect('/');
    }

    return <Page {...(props as P)} teacher={teacher} />;
  };
}
