"use client";

import dynamic from "next/dynamic";
const Canvas = dynamic(() => import("@/components/reader/Canvas"), { ssr: false });
export default function ReaderPage({ params }: { params: { bookId: string } }) {
  return (
    <div className="w-full h-[100dvh] bg-black">
      <Canvas bookId={params.bookId} />
    </div>
  );
}
