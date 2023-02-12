/*
import { prisma } from "./lib/prisma";
import express from "express";
import { z } from "zod";
import dayjs from "dayjs";

const routes = express.Router();

routes.post("/habits", async (request, response) => {
  const createHabitBody = z.object({
    title: z.string(),
    weekDays: z.array(z.number().min(0).max(6)),
  });

  const { title, weekDays } = createHabitBody.parse(request.body);

  const today = dayjs().startOf("day").toDate();

  await prisma.habit.create({
    data: {
      title,
      created_at: today,
      weekDays: {
        create: weekDays.map((weedDay) => {
          return {
            week_day: weedDay,
          };
        }),
      },
    },
  });

  return response.end();
});

routes.get("/day", async (request, response) => {
  const getDayParams = z.object({
    date: z.coerce.date(),
  });

  const { date } = getDayParams.parse(request.query);

  const parsedDate = dayjs(date).startOf("day");
  const weekDay = parsedDate.get("day");

  // todos hábitos possíveis
  // hábitos que já foram completados
  const possibleHabits = await prisma.habit.findMany({
    where: {
      created_at: {
        lte: date,
      },
      weekDays: {
        some: {
          week_day: weekDay,
        },
      },
    },
  });

  const day = await prisma.day.findUnique({
    where: {
      date: parsedDate.toDate(),
    },
    include: {
      dayHabits: true,
    },
  });

  const completedHabits =
    day?.dayHabits.map((dayHabit) => {
      return dayHabit.habit_id;
    }) ?? [];

  return response.json({
    possibleHabits,
    completedHabits,
  });
});

// Completar / Não Completar
routes.patch("/habits/:id/toggle", async (request, response) => {
  const toggleHabitParams = z.object({
    id: z.string().uuid(),
  });

  const { id } = toggleHabitParams.parse(request.params);

  const today = dayjs().startOf("day").toDate();

  let day = await prisma.day.findUnique({
    where: {
      date: today,
    },
  });

  if (!day) {
    day = await prisma.day.create({
      data: {
        date: today,
      },
    });
  }

  const dayHabit = await prisma.dayHabit.findUnique({
    where: {
      day_id_habit_id: {
        day_id: day.id,
        habit_id: id,
      },
    },
  });

  if (dayHabit) {
    // remover a marcação de completo
    await prisma.dayHabit.delete({
      where: {
        id: dayHabit.id,
      },
    });
  } else {
    // Completar o hábito
    await prisma.dayHabit.create({
      data: {
        day_id: day.id,
        habit_id: id,
      },
    });
  }

  return response.end();
});

routes.get("/summary", async (request, response) => {
  const summary = await prisma.$queryRaw`
    SELECT 
      D.id,
      D.date,
      (
        SELECT 
          cast(count(*)as float)
        FROM day_habits DH
        where DH.day_id = D.id 
      ) as completed,
      (
        SELECT
        cast(count(*) as float)
        from habit_week_days HWD
        JOIN habits H
        ON H.id = HWD.habit_id
        WHERE
          HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
          AND H.created_at <= D.date
      ) as amount
    FROM days D
    `;
  return response.json(summary);
});

export default routes;
*/
import { prisma } from "./lib/prisma";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import dayjs from "dayjs";

export async function appRoutes(app: FastifyInstance) {
  app.post("/habits", async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
    });

    const { title, weekDays } = createHabitBody.parse(request.body);

    const today = dayjs().startOf("day").toDate();

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map((weedDay) => {
            return {
              week_day: weedDay,
            };
          }),
        },
      },
    });
  });

  app.get("/day", async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date(),
    });

    const { date } = getDayParams.parse(request.query);

    const parsedDate = dayjs(date).startOf("day");
    const weekDay = parsedDate.get("day");

    // todos hábitos possíveis
    // hábitos que já foram completados
    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date,
        },
        weekDays: {
          some: {
            week_day: weekDay,
          },
        },
      },
    });

    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate(),
      },
      include: {
        dayHabits: true,
      },
    });

    const completedHabits = day?.dayHabits.map((dayHabit) => {
      return dayHabit.habit_id;
    });

    return {
      possibleHabits,
      completedHabits,
    };
  });

  // Completar / Não Completar
  app.patch("/habits/:id/toggle", async (request) => {
    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    });

    const { id } = toggleHabitParams.parse(request.params);

    const today = dayjs().startOf("day").toDate();

    let day = await prisma.day.findUnique({
      where: {
        date: today,
      },
    });

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        },
      });
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        },
      },
    });

    if (dayHabit) {
      // remover a marcação de completo
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        },
      });
    } else {
      // Completar o hábito
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
        },
      });
    }
  });

  app.get("/summary", async (request) => {
    const summary = await prisma.$queryRaw`
    SELECT 
      D.id,
      D.date,
      (
        SELECT 
          cast(count(*)as float)
        FROM day_habits DH
        where DH.day_id = D.id 
      ) as completed,
      (
        SELECT
        cast(count(*) as float)
        from habit_week_days HWD
        JOIN habits H
        ON H.id = HWD.habit_id
        WHERE
          HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
          AND H.created_at <= D.date
      ) as amount
    FROM days D
    `;
    return summary;
  });
}
