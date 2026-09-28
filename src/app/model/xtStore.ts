import { createXRStore } from "@react-three/xr";

export const xrStore = createXRStore({
  controller: {
    rayPointer: false,
    teleportPointer: false,
  },
  gaze: false,
  hand: false,
});
