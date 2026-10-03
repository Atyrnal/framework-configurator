import { useState } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { CARD_FINISH_OPTIONS, CARD_FINISHES, EXPANSION_CARDS } from '../../lib/constants';
import { ColorSwatch } from '../ui/ColorSwatch';

const SIDES = [
  { label: 'Left', slots: [0, 1] },
  { label: 'Right', slots: [2, 3] },
] as const;

const SLOT_PLACE: Record<number, string> = {
  0: 'Rear',
  1: 'Front',
  2: 'Rear',
  3: 'Front',
};

export default function ExpansionCardSelector() {
  const { expansionCards, setExpansionCard, setExpansionCardColor } = useConfiguratorStore();
  const [activeSlot, setActiveSlot] = useState(0);
  const slot = expansionCards[activeSlot] ?? expansionCards[0];
  const colors = CARD_FINISH_OPTIONS[slot.card];
  const cardName = EXPANSION_CARDS.find((card) => card.id === slot.card)?.name ?? 'Empty';
  const finishName = colors.length > 0 ? CARD_FINISHES[slot.color].name : null;
  const sideLabel = activeSlot < 2 ? 'Left' : 'Right';

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Expansion cards</h2>
        <span className="truncate text-xs text-zinc-700">{sideLabel} · {SLOT_PLACE[slot.id]}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {SIDES.map((side) => (
          <div key={side.label}>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">{side.label}</p>
            <div className="space-y-1">
              {side.slots.map((slotId) => {
                const entry = expansionCards[slotId];
                const name = EXPANSION_CARDS.find((card) => card.id === entry.card)?.name ?? 'Empty';
                const swatch = entry.card === 'empty' ? '#e4e4e7' : CARD_FINISHES[entry.color].finish.color;
                const selected = activeSlot === slotId;
                return (
                  <button
                    key={slotId}
                    type="button"
                    onClick={() => setActiveSlot(slotId)}
                    className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left ${
                      selected
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10" style={{ background: swatch }} />
                    <span className="min-w-0">
                      <span className="block text-[10px] uppercase tracking-wide text-zinc-400">{SLOT_PLACE[slotId]}</span>
                      <span className={`block truncate text-xs ${entry.card === 'empty' ? 'text-zinc-400' : 'text-zinc-800'}`}>{name}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mb-1.5 mt-3 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
        {sideLabel} {SLOT_PLACE[slot.id].toLowerCase()} · {cardName}
      </p>
      <div className="grid grid-cols-3 gap-1">
        {EXPANSION_CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setExpansionCard(slot.id, card.id)}
            className={`rounded-md border px-1 py-1 text-[11px] ${
              slot.card === card.id
                ? 'border-orange-500 bg-orange-500 text-white'
                : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
            }`}
          >
            {card.name}
          </button>
        ))}
      </div>

      {finishName && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">Finish</p>
            <span className="truncate text-xs text-zinc-700">{finishName}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {colors.map((colorId) => {
              const option = CARD_FINISHES[colorId];
              return (
                <ColorSwatch
                  key={colorId}
                  name={option.name}
                  finish={option.finish}
                  selected={slot.color === colorId}
                  onSelect={() => setExpansionCardColor(slot.id, colorId)}
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
