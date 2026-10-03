import { useState } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';

export default function ActionButtons() {
  const { resetConfiguration } = useConfiguratorStore();
  const [copied, setCopied] = useState(false);

  const takeScreenshot = (transparent: boolean) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `framework-configurator-${Date.now()}.png`;

    if (transparent) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(canvas, 0, 0);
      const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 240 && g > 240 && b > 240) data[i + 3] = 0;
      }
      ctx.putImageData(imageData, 0, 0);
      link.href = tempCanvas.toDataURL('image/png');
    } else {
      link.href = canvas.toDataURL('image/png');
    }

    link.click();
  };

  const shareConfiguration = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };

  const buttonClass = 'rounded-md border border-zinc-200 px-2 py-1.5 text-[11px] text-zinc-600 hover:border-zinc-300';

  return (
    <section>
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Actions</h2>
      <div className="grid grid-cols-2 gap-1.5">
        <button type="button" onClick={() => takeScreenshot(false)} className={buttonClass}>PNG</button>
        <button type="button" onClick={() => takeScreenshot(true)} className={buttonClass}>Transparent</button>
        <button type="button" onClick={shareConfiguration} className={buttonClass}>{copied ? 'Copied' : 'Share'}</button>
        <button type="button" onClick={resetConfiguration} className={`${buttonClass} text-red-600`}>Reset</button>
      </div>
    </section>
  );
}
