"use client";

import { useState, useMemo, ChangeEvent, useCallback } from "react";
import * as bsky from "@atproto/api";
import { getData } from "./atproto";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { CalendarHeatmap } from "./ui/calendar-heatmap";

type PostsData = Awaited<ReturnType<typeof getData>>;

export default function HomeClient() {
  const [data, setData] = useState<PostsData | undefined>();
  const [heatmapSubject, setHeatmapSubject] = useState<string>("");

  const posts = useMemo(() => data?.data ?? [], [data]);

  type PostData = {
    date: string;
    count: number;
  };

  const weightedDates = useMemo(() => {
    return (posts as PostData[]).map((post) => ({
      date: new Date(post.date),
      weight: post.count,
    }));
  }, [posts]);

  const agent = useMemo(
    () =>
      new bsky.BskyAgent({
        service: "https://api.bsky.app",
      }),
    []
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const loadPosts = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let actor: any;
      try {
        actor = (
          await agent.getProfile({
            actor: heatmapSubject.trim().replace("@", ""),
          })
        ).data.did;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error(e);
        alert("Invalid username!");
        return;
      }
      setIsLoading(true);
      const data = await getData(agent!, actor);
      setData(data);
    } finally {
      setIsLoading(false);
    }
  }, [agent, heatmapSubject]);

  const handleHeatmapSubjectChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setHeatmapSubject(e.target.value);
    },
    []
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Bluesky Posts Heatmap Generator 🦋&nbsp;
      </h1>
      <br />
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Bluesky username"
          onChange={handleHeatmapSubjectChange}
          value={heatmapSubject}
        />
        <Button type="button" onClick={loadPosts} disabled={isLoading}>
          Get heatmap
        </Button>
      </div>
      <div className="flex flex-col gap-2 items-center mt-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">
            Loading... (This might take a minute or two. No, really.)
          </div>
        ) : null}
        {posts.length === 0 || isLoading ? null : (
          <>
            <CalendarHeatmap
              variantClassnames={[
                "text-white hover:text-white bg-green-400 hover:bg-green-400",
                "text-white hover:text-white bg-green-500 hover:bg-green-500",
                "text-white hover:text-white bg-green-700 hover:bg-green-700",
              ]}
              weightedDates={weightedDates}
            />
          </>
        )}
      </div>
    </div>
  );
}
