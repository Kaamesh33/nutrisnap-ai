import { useEffect, useRef, useState } from 'react';
import { mayNotPreview, validateImageFile } from '../services/photoAnalysis';
import { Icon } from './Icon';

/**
 * Pick a meal photo from the gallery or camera, preview it, remove or replace it.
 * The photo stays in memory only; it is not saved to browser storage.
 */
export function PhotoPicker({ file, onFile }: { file: File | null; onFile: (f: File | null) => void }) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    setPreviewFailed(false);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const handle = (list: FileList | null, input: HTMLInputElement | null) => {
    const f = list?.[0];
    if (input) input.value = ''; // allow choosing the same file again
    if (!f) return; // person cancelled the picker: keep the current photo
    const problem = validateImageFile(f);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    onFile(f);
  };

  return (
    <div className="photo">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        data-testid="camera-input"
        onChange={(e) => handle(e.target.files, e.target)}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        data-testid="gallery-input"
        onChange={(e) => handle(e.target.files, e.target)}
      />

      {file && url ? (
        <figure className="photo__preview">
          {previewFailed ? (
            <div className="photo__nopreview">
              <Icon name="image" size={28} />
              <span>{file.name}</span>
              <small>This browser cannot show a preview of this photo type, but you can still log the meal.</small>
            </div>
          ) : (
            <img src={url} alt="Selected meal" onError={() => setPreviewFailed(true)} />
          )}
          {mayNotPreview(file) && !previewFailed ? (
            <p className="photo__hint">iPhone HEIC photos may not preview outside Safari. You can still log the meal.</p>
          ) : null}
          <figcaption className="photo__actions">
            <button type="button" className="btn btn--ghost" onClick={() => galleryRef.current?.click()}>
              <Icon name="image" size={18} />
              Replace photo
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--danger"
              onClick={() => {
                onFile(null);
                setError(null);
              }}
            >
              <Icon name="trash" size={18} />
              Remove photo
            </button>
          </figcaption>
        </figure>
      ) : (
        <div className="photo__drop">
          <div className="photo__plate" aria-hidden="true">
            <Icon name="camera" size={34} />
          </div>
          <p className="photo__lead">Add a photo of your meal</p>
          <p className="photo__sub">Shoot from above in good light so every bowl is visible.</p>
          <div className="row-actions row-actions--center">
            <button type="button" className="btn btn--primary" onClick={() => cameraRef.current?.click()}>
              <Icon name="camera" size={18} />
              Take photo
            </button>
            <button type="button" className="btn btn--outline" onClick={() => galleryRef.current?.click()}>
              <Icon name="image" size={18} />
              Choose from gallery
            </button>
          </div>
          <p className="photo__sub">On a computer, both buttons open your files.</p>
        </div>
      )}
      {error ? (
        <p className="notice notice--error" role="alert">
          <Icon name="alert" size={18} />
          {error}
        </p>
      ) : null}
    </div>
  );
}
