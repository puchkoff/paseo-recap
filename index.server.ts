import type { PluginServerContext } from "@getpaseo/plugin/server";
import { runRecap } from "./server/recap";
import { recap } from "./shared/recap";

export default function contribute(server: PluginServerContext) {
  server.handle(recap, runRecap);
  return () => {};
}
