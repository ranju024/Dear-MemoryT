import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/album-editor")({
  head: () => ({ meta: [{ title: "Album Editor — DearMemory" }] }),
  component: AlbumEditor,
});

function AlbumEditor() {
  return <div className="min-h-screen bg-cream flex items-center justify-center p-6">
    <div className="bg-white rounded-3xl ring-1 ring-border p-10 max-w-lg text-center">
      <h1 className="text-2xl font-bold">Album editor</h1>
      <p className="text-warm-gray mt-3">Event website editing is now handled by the real Website Builder, which saves the event design configuration to the backend.</p>
      <Link to="/dashboard/builder" className="inline-block mt-6 bg-emerald text-white px-6 py-3 rounded-full font-semibold">Open Website Builder</Link>
    </div>
  </div>;
}
