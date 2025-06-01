import TaskSubmit from "@/components/student/task-submit";

export default async function SubmitTaskPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  const assignmentId = id.toString();

  return <TaskSubmit assignmentId={assignmentId.toString()} />;
}
