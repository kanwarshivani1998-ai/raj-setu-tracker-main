/**
 * In-app APK update checker & installer (Android only).
 * ---------------------------------------------------------------
 * Kaam: GitHub Releases (jo build-apk.yml GitHub Action banati hai) se
 * latest release check karta hai, agar naya version mila to APK download
 * karke seedha Android ke "install" prompt tak pahuncha deta hai —
 * uninstall/reinstall karne ki zaroorat nahi, existing app ke upar hi
 * update ho jata hai (jab tak signing key same rahe, jo yahan hai kyunki
 * CI hamesha usi debug keystore se banati hai).
 *
 * Dependencies (package.json me already add ki hui hain):
 *   @capacitor/filesystem      — downloaded APK ko phone me save karne ke liye
 *   @m430/capacitor-app-install — install-prompt trigger karne ke liye
 * ---------------------------------------------------------------
 */
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { AppInstallPlugin } from "@m430/capacitor-app-install";

// GitHub repo jaha build-apk.yml release banata hai
const GITHUB_REPO = "kanwarshivani1998-ai/raj-setu-tracker-main";
const GITHUB_API_LATEST_RELEASE = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  downloadUrl?: string;
  releaseNotesUrl?: string;
}

export type UpdateProgressStage = "checking" | "downloading" | "installing" | "done" | "error";

export interface UpdateProgress {
  stage: UpdateProgressStage;
  percent?: number; // sirf "downloading" stage me meaningful (0-100)
  message?: string;
}

/** "v1.2.3-45" ya "1.2.3" jaisi string se sirf "1.2.3" nikalta hai. */
function extractSemver(raw: string): string | null {
  const match = raw.match(/(\d+)\.(\d+)\.(\d+)/);
  return match ? `${match[1]}.${match[2]}.${match[3]}` : null;
}

/** true agar `a` version `b` version se naya (bada) hai. */
function isNewer(a: string, b: string): boolean {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return true;
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return false;
  }
  return false;
}

/**
 * GitHub par latest release check karta hai aur current build (__APP_VERSION__)
 * se compare karta hai. Sirf check karta hai — kuch download nahi karta.
 */
export async function checkForUpdate(): Promise<UpdateInfo> {
  const currentVersion = __APP_VERSION__;

  const res = await fetch(GITHUB_API_LATEST_RELEASE, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    throw new Error(`GitHub release check fail hua (HTTP ${res.status})`);
  }
  const release = await res.json();

  const latestVersion = extractSemver(release.tag_name ?? release.name ?? "") ?? currentVersion;
  const apkAsset = (release.assets ?? []).find((a: any) => String(a.name).toLowerCase().endsWith(".apk"));

  return {
    available: apkAsset != null && isNewer(latestVersion, currentVersion),
    currentVersion,
    latestVersion,
    downloadUrl: apkAsset?.browser_download_url,
    releaseNotesUrl: release.html_url,
  };
}

/** ArrayBuffer ko base64 string me convert karta hai (bade files ke liye chunk-wise, taaki crash na ho). */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const CHUNK_SIZE = 8192;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

/**
 * Naya APK download karke seedha Android ke install-prompt tak le jaata hai.
 * `onProgress` callback se UI ko live status/percent mil jaata hai.
 */
export async function downloadAndInstallUpdate(
  downloadUrl: string,
  onProgress?: (p: UpdateProgress) => void
): Promise<void> {
  if (Capacitor.getPlatform() !== "android") {
    throw new Error("In-app update sirf Android app me kaam karta hai.");
  }

  // 1. Permission check — "unknown sources" se install allow hai ya nahi
  onProgress?.({ stage: "checking", message: "Permission check ho rahi hai…" });
  const { granted } = await AppInstallPlugin.canInstallUnknownApps();
  if (!granted) {
    await AppInstallPlugin.openInstallUnknownAppsSettings();
    throw new Error(
      "Settings me jaakar 'Install unknown apps' is app ke liye ON karo, fir se 'अपडेट करें' दबाओ।"
    );
  }

  // 2. Download (streaming progress ke saath, agar browser support kare)
  onProgress?.({ stage: "downloading", percent: 0, message: "डाउनलोड शुरू…" });
  const res = await fetch(downloadUrl);
  if (!res.ok || !res.body) {
    throw new Error(`APK download fail hua (HTTP ${res.status})`);
  }
  const totalBytes = Number(res.headers.get("content-length") ?? 0);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.length;
      if (totalBytes > 0) {
        onProgress?.({
          stage: "downloading",
          percent: Math.min(99, Math.round((received / totalBytes) * 100)),
          message: `डाउनलोड हो रहा है… ${(received / 1024 / 1024).toFixed(1)}MB / ${(totalBytes / 1024 / 1024).toFixed(1)}MB`,
        });
      }
    }
  }

  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  const base64Data = arrayBufferToBase64(merged.buffer);

  // 3. Phone me save karo (app ke cache folder me)
  onProgress?.({ stage: "downloading", percent: 100, message: "फ़ाइल सेव हो रही है…" });
  const fileName = "raj-setu-update.apk";
  await Filesystem.writeFile({
    path: fileName,
    directory: Directory.Cache,
    data: base64Data,
  });
  const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });

  // 4. Android ke install-prompt ko trigger karo
  onProgress?.({ stage: "installing", message: "इंस्टॉल स्क्रीन खुल रही है…" });
  const result = await AppInstallPlugin.installApk({ filePath: uri });
  if (!result.completed) {
    throw new Error(result.message || "Install prompt open nahi ho paya.");
  }

  onProgress?.({ stage: "done", message: "इंस्टॉल स्क्रीन खुल गई — वहाँ 'Update'/'Install' दबाओ।" });
}

export function getCurrentAppVersion(): string {
  return __APP_VERSION__;
}
