import type { UpdateInfo } from '../../utils/updater';

interface UpdateModalProps {
  update: UpdateInfo;
  onClose: () => void;
}

export function UpdateModal({ update, onClose }: UpdateModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-bg-secondary p-6 shadow-2xl">
        <div className="mb-5">
          <div className="mb-2 text-2xl">
            ✨
          </div>

          <h2 className="text-xl font-semibold text-text-primary">
            Доступно обновление
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Novagram {update.currentVersion} → {update.latestVersion}
          </p>
        </div>

        {update.releaseNotes && (
          <div className="mb-6 max-h-48 overflow-y-auto rounded-xl bg-bg-primary p-4">
            <p className="mb-2 text-sm font-medium text-text-primary">
              Что нового?
            </p>

            <div className="whitespace-pre-wrap text-sm text-text-secondary">
              {update.releaseNotes}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {update.apkUrl && (
            <a
              href={update.apkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-xl bg-accent px-4 py-3 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Скачать обновление
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-primary"
          >
            Позже
          </button>
        </div>
      </div>
    </div>
  );
}