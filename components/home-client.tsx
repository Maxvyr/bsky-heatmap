"use client";

import { useCallback, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { fetchBlueSkyPosts } from "@/lib/feature/user/actions";
import { CalendarHeatmap } from "./ui/calendar-heatmap";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomeClient(props: { csrfToken: string }) {
  const [weightedDates, setWeightedDates] = useState<
    Array<{ date: Date; weight: number }>
  >([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = useCallback(async (formData: FormData) => {
    startTransition(async () => {
      const result = await fetchBlueSkyPosts(formData);
      if (!result) {
        alert("Something went wrong");
        return;
      }

      if (result.success) {
        if (!result.data?.data || result.data?.data?.length === 0) {
          alert("No posts found");
          return;
        }

        setWeightedDates(
          result.data.data.map((post: any) => ({
            date: new Date(post.date),
            weight: post.count,
          }))
        );
      } else {
        alert(result.error);
      }
    });
  }, []);

  const handleDateClick = useCallback(
    (date: Date) => {
      const dateEntry = weightedDates.find(
        (entry) => entry.date.toDateString() === date.toDateString()
      );

      console.log(dateEntry);

      if (dateEntry) {
        router.push(`/post/${dateEntry.date.toISOString().split("T")[0]}`);
      }
    },
    [weightedDates, router]
  );

  return (
    <div>
      <form action={handleSubmit} className="flex gap-2">
        <input type="hidden" name="csrfToken" value={props.csrfToken} />
        <Input
          name="username"
          type="text"
          placeholder="Bluesky username"
          required
        />
        <Button type="submit" disabled={isPending}>
          Get heatmap
        </Button>
      </form>
      <div className="flex flex-col gap-2 items-center mt-4">
        {isPending ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="animate-spin size-4" />
            Loading...
          </div>
        ) : null}
        {weightedDates.length > 0 && !isPending && (
          <CalendarHeatmap
            variantClassnames={[
              "text-white hover:text-white bg-green-400 hover:bg-green-400",
              "text-white hover:text-white bg-green-500 hover:bg-green-500",
              "text-white hover:text-white bg-green-700 hover:bg-green-700",
            ]}
            numberOfMonths={3}
            weightedDates={weightedDates}
            onClick={handleDateClick}
          />
        )}
      </div>
    </div>
  );
}
