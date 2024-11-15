"use server";

import * as bsky from "@atproto/api";
import { getData } from "@/components/atproto";

export async function fetchBlueSkyPosts(formData: FormData) {
  const csrfToken = formData.get("csrfToken")?.toString() || "";
  const username = formData.get("username")?.toString() || "";

  if (csrfToken !== process.env.ACCESS_TOKEN) {
    return { success: false, error: "Invalid Request!" };
  }

  const agent = new bsky.BskyAgent({
    service: "https://api.bsky.app",
  });

  try {
    const {
      data: { did: actor },
    } = await agent.getProfile({
      actor: username.trim().replace("@", ""),
    });

    const data = await getData(agent, actor);
    return { success: true, data };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Invalid username!" };
  }
}
