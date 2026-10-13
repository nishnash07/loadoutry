import type { Gw2Build } from "../model";
import { conditionWeaver } from "./condition-weaver";
import { conditionChronomancer } from "./condition-chronomancer";

export const GW2_BUILDS: Gw2Build[] = [conditionChronomancer, conditionWeaver];
export const gw2Build = (slug: string) => GW2_BUILDS.find((b) => b.slug === slug);
