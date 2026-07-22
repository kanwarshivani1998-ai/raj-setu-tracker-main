import type { CapacitorConfig } from "@capacitor/cli";

// App ID change kar sakte ho, but ek baar Play Store/APK install karne ke
// baad ise change mat karna, warna app "different app" maani jaayegi.
const config: CapacitorConfig = {
  appId: "com.rajsetu.cettracker",
  appName: "Rajasthan CET Tracker",
  webDir: "dist/client", // vite.config.ts ke build.outDir("dist") + Start ka client output
  android: {
    allowMixedContent: true,
  },
};

export default config;
