"use client";

import { useState, useMemo, ChangeEvent, useCallback } from "react";
import * as bsky from "@atproto/api";
import { getData } from "./atproto";
import CalendarHeatmap from "react-calendar-heatmap";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

type PostsData = Awaited<ReturnType<typeof getData>>;

export default function HomeClient() {
  const [data, setData] = useState<PostsData | undefined>();
  const [heatmapSubject, setHeatmapSubject] = useState<string>("");

  const posts = data?.data ?? [];
  const max = data?.max ?? 0;
  const createdAt = new Date(data?.createdAt);

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
      let actor: string | undefined;
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
              startDate={createdAt}
              endDate={new Date()}
              values={posts}
              classForValue={(value) => {
                if (!value) {
                  return "color-empty";
                }
                // return `color-github-${value.count > 0 ? Math.ceil((value.count / max) * 4) : 0}`;
                return `color-custom-${
                  value.count > 0 ? Math.ceil((value.count / max) * 17) : 0
                }`;
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tooltipDataAttrs={(value: any) => {
                return {
                  "data-tooltip-id": "my-tooltip",
                  "data-tooltip-content":
                    value.date !== null
                      ? `${value.date} has ${value.count} posts`
                      : "no posts",
                  "data-tooltip-place": "top",
                };
              }}
              showWeekdayLabels={true}
              gutterSize={1}
              showOutOfRangeDays={true}
            />
          </>
        )}
      </div>
    </div>
  );
}
