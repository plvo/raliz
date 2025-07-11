'use server';

import { auth } from '@/lib/auth';
import { withAction } from '@/lib/wrappers/with-action';
import { type Login, loginSchema } from '@/schemas/auth';

export async function login(data: Login) {
  return withAction(async (prisma) => {
    console.log(data);
    const validatedData = loginSchema.parse(data);

  

    const response = await auth.api.signInEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
      },
    });

    console.log({response});

    if (!response.user) {
      throw new Error('Erreur lors de la connexion.');
    }

    const teacher = await prisma.teacher.findUnique({
      where: {
        id: response.user.id,
      },
    });

    if (!teacher) {
      throw new Error('Enseignant introuvable.');
    }

    return {
      id: teacher.id,
      email: teacher.email,
      name: `${teacher.firstname} ${teacher.lastname}`,
      pseudo: `${teacher.username}`,
    };
  }, false);
}
