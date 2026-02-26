import { TaskStatus } from "@prisma/client";
import { handleRouteError, ok } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth";
import { decryptText, encryptText } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { taskCreateSchema, taskListQuerySchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const body = await request.json();
    const input = taskCreateSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: encryptText(input.description),
        status: input.status,
        ownerId: user.userId,
      },
    });

    return ok(
      {
        task: {
          ...task,
          description: decryptText(task.description),
        },
      },
      201,
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const query = taskListQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    const where: {
      ownerId: string;
      status?: TaskStatus;
      title?: { contains: string; mode: "insensitive" };
    } = {
      ownerId: user.userId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.title = {
        contains: query.search,
        mode: "insensitive",
      };
    }

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        orderBy: {
          createdDate: "desc",
        },
        skip,
        take: query.limit,
      }),
      prisma.task.count({ where }),
    ]);

    return ok({
      tasks: items.map((task) => ({
        ...task,
        description: decryptText(task.description),
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

