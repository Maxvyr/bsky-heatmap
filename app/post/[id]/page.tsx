import { PageParams } from "@/lib/types/next";

export default async function Page({ params }: PageParams<{ id: string }>) {
  //call the api to get all posts for that date
  return <div>PostPage {params.id}</div>;
}
