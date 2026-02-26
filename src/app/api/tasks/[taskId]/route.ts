import { ApiError, handleRouteError, ok } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth";
import { decryptText, encryptText } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { taskUpdateSchema } from "@/lib/schemas";

type Params = { params: Promise<{ taskId: string }> };

const getOwnedTask = async (taskId: string, ownerId: string) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    throw new ApiError(404, "Task not found", "TASK_NOT_FOUND");
  }

  if (task.ownerId !== ownerId) {
    throw new ApiError(403, "Forbidden", "FORBIDDEN");
  }

  return task;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    const { taskId } = await params;
    const task = await getOwnedTask(taskId, user.userId);

    return ok({
      task: {
        ...task,
        description: decryptText(task.description),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    const { taskId } = await params;
    await getOwnedTask(taskId, user.userId);

    const body = await request.json();
    const input = taskUpdateSchema.parse(body);

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: input.title,
        description: input.description ? encryptText(input.description) : undefined,
        status: input.status,
      },
    });

    return ok({
      task: {
        ...updated,
        description: decryptText(updated.description),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    const { taskId } = await params;
    await getOwnedTask(taskId, user.userId);

    await prisma.task.delete({ where: { id: taskId } });
    return ok({ message: "Task deleted" });
  } catch (error) {
    return handleRouteError(error);
  }
}
