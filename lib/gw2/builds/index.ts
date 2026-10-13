import type { Gw2Build } from "../model";
import { conditionWeaver } from "./condition-weaver";

export const GW2_BUILDS: Gw2Build[] = [conditionWeaver];
export const gw2Build = (slug: string) => GW2_BUILDS.find((b) => b.slug === slug);
