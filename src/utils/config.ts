const normalizeBooleanEnv = (value: unknown) => {
  if (typeof value !== "string") return false;
  return ["true", "1", "yes"].includes(value.toLowerCase());
};

export const CLICKUP_API_AKEY = import.meta.env.VITE_CLICKUP_API_AKEY;

export const TEAM_ID = "3051792";

export const CLICKUP_LIST_IDS = {
  cciBau: "901404730264",
  cciHs: "900200859937",
  trueNetBau: "901409412574",
  techservBau: "901412194617",
};

export const DESIGNER_VIEW = normalizeBooleanEnv(
  import.meta.env.VITE_DESIGNER_VIEW,
);
