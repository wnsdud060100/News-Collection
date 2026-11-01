import { auth } from "@clerk/nextjs/server";
import { MissingApiKeyError } from "@/lib/summary/gemini";
import { summarizePending } from "@/lib/summary/summarize-pending";

export const maxDuration = 60;

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return Response.json(await summarizePending());
  } catch (e) {
    console.error("[news/summarize]", e);
    const message =
      e instanceof MissingApiKeyError
        ? e.message
        : "요약을 만들지 못했어요. 잠시 후 다시 시도해 주세요.";
    return Response.json({ error: message }, { status: 500 });
  }
}
