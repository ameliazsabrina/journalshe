"use client";

import { use } from "react";
import { AssignmentDetailClient } from "@/components/teacher/assignment-detail-client";
import { ErrorBoundary } from "@/components/error-boundary";

interface PageProps {
  params: Promise<{ id: string }>;
}

function AssignmentDetailPageContent({ params }: PageProps) {
  const { id } = use(params);
  const assignmentId = id;

  if (!assignmentId || assignmentId.trim() === "") {
    throw new Error("Invalid assignment ID");
  }

  return <AssignmentDetailClient assignmentId={assignmentId} />;
}

export default function AssignmentDetailPage(props: PageProps) {
  return (
    <ErrorBoundary>
      <AssignmentDetailPageContent {...props} />
    </ErrorBoundary>
  );
}
