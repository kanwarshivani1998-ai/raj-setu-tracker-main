// vite.config.ts me `define` se inject hota hai (package.json ka version) —
// isse app ko pata chalta hai ki wo khud kaunsa version hai, GitHub ke
// latest release se compare karne ke liye (src/lib/update/appUpdate.ts).
declare const __APP_VERSION__: string;
