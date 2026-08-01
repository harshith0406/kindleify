"use client";

import Canvas from "@/components/reader/Canvas";

export default function ReaderPage({ params }: { params: { bookId: string } }) {
  return (
    <div className="w-full h-[100dvh] bg-black">
      <Canvas bookId={params.bookId} />
    </div>
  );
}
