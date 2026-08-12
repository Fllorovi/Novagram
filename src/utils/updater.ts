import { App } from '@capacitor/app';

const GITHUB_API_URL =
  'https://api.github.com/repos/Fllorovi/Novagram/releases/latest';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  releaseUrl: string;
  apkUrl: string | null;
  releaseNotes: string;
}

interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubRelease {
  tag_name: string;
  html_url: string;
  body: string | null;
  assets: GitHubAsset[];
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    // Версия установленного приложения
    const appInfo = await App.getInfo();
    const currentVersion = appInfo.version;

    // Последний релиз Novagram на GitHub
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const release: GitHubRelease = await response.json();

    // v1.0.1 → 1.0.1
    const latestVersion = release.tag_name.replace(/^v/, '');

    // Ищем APK среди Assets релиза
    const apkAsset = release.assets.find(
      (asset) => asset.name.toLowerCase().endsWith('.apk')
    );

    // Если установленная версия уже актуальная — обновление не нужно
    if (!isNewerVersion(latestVersion, currentVersion)) {
      return null;
    }

    return {
      currentVersion,
      latestVersion,
      releaseUrl: release.html_url,
      apkUrl: apkAsset?.browser_download_url ?? null,
      releaseNotes: release.body ?? '',
    };
  } catch (error) {
    console.error('Не удалось проверить обновление Novagram:', error);
    return null;
  }
}

function isNewerVersion(latest: string, current: string): boolean {
  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const latestPart = latestParts[i] ?? 0;
    const currentPart = currentParts[i] ?? 0;

    if (latestPart > currentPart) {
      return true;
    }

    if (latestPart < currentPart) {
      return false;
    }
  }

  return false;
}