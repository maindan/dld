import { getTasksOverview } from "@/lib/queries/tasks";
import { TasksBoard } from "@/components/tasks/tasks-board";

export default async function TasksPage() {
  const overview = await getTasksOverview();
  return <TasksBoard overview={overview} />;
}
