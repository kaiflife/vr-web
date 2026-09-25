import { createXRStore } from "@react-three/xr";

export const xrStore = createXRStore({
  controller: {
    teleportPointer: {
      rayModel: {
        color: "green",
      },
      cursorModel: {
        color: "green",
      },
    },
    rayPointer: true,
  },
});
