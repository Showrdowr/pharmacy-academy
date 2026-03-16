export const animationCreate = () => {
  if (typeof window !== "undefined") {
    import("wowjs").then((module) => {
      const WOW = module.default;
      new WOW.WOW({ live: false }).init()
    }).catch((err) => {
      console.warn("WOW.js animation failed to load:", err);
    });
  }
};
