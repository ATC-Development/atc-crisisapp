export type LeadershipChatPayload = {
  categoryLabel: string;
  reporterName: string;
  reporterEmail: string;
  locationText: string;
  note: string;
  dontAskAgain: boolean;
};

export type LeadershipChatResponse = {
  ok: boolean;
  status: number;
  bodyText: string;
};

export async function postToLeadershipChat(
  payload: LeadershipChatPayload
): Promise<LeadershipChatResponse> {
  const url = import.meta.env.VITE_POST_TO_LEADERSHIPCHAT as string | undefined;
  if (!url) {
    throw new Error("Missing env var: VITE_POST_TO_LEADERSHIPCHAT");
  }
  console.log("Posting to Leadership Chat:", url, payload);
  console.log(JSON.stringify(payload, null, 2));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    body: JSON.stringify(payload),
  });

  const bodyText = await res.text().catch(() => "");

  return { ok: res.ok, status: res.status, bodyText };
}
