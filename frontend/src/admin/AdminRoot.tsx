/** Dev-only entry for /admin and /__preview (never part of the production bundle). */
import { AdminApp } from "./AdminApp";
import { PreviewPage } from "./PreviewPage";

export default function AdminRoot({ path }: { path: string }) {
  return path.startsWith("/__preview") ? <PreviewPage /> : <AdminApp />;
}
