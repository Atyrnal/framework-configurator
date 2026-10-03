import { useState } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { CARD_FINISH_OPTIONS, CARD_FINISHES, EXPANSION_CARDS } from '../../lib/constants';
import { ColorSwatch } from '../ui/ColorSwatch';
import { Section } from '../ui/Section';

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
    <Section
      title="Expansion cards"
      value={`${sideLabel} ${SLOT_PLACE[slot.id].toLowerCase()}`}
      hint="Choose a bay, then the module and its finish."
    >
      <div className="grid grid-cols-2 gap-2">
        {SIDES.map((side) => (
          <div key={side.label}>
            <p className="mb-1 text-[11px] text-muted">{side.label}</p>
            <div className="space-y-1.5">
              {side.slots.map((slotId) => {
                const entry = expansionCards[slotId];
                const name = EXPANSION_CARDS.find((card) => card.id === entry.card)?.name ?? 'Empty';
                const swatch = entry.card === 'empty' ? '#dedcd8' : CARD_FINISHES[entry.color].finish.color;
                const selected = activeSlot === slotId;
                return (
                  <button
                    key={slotId}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setActiveSlot(slotId)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      selected ? 'bg-stage' : 'hover:bg-ink/5'
                    }`}
                  >
                    <span className="h-3 w-3 shrink-0 rounded-full border border-ink/10" style={{ background: swatch }} />
                    <span className="min-w-0">
                      <span className="block text-[10px] text-muted">{SLOT_PLACE[slotId]}</span>
                      <span className={`block truncate text-[13px] leading-tight ${entry.card === 'empty' ? 'text-muted' : 'text-ink'}`}>{name}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mb-1.5 mt-3 text-[11px] text-muted">
        {sideLabel} {SLOT_PLACE[slot.id].toLowerCase()} · {cardName}
      </p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {EXPANSION_CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            aria-pressed={slot.card === card.id}
            onClick={() => setExpansionCard(slot.id, card.id)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              slot.card === card.id
                ? 'bg-ink text-paper'
                : 'text-muted hover:text-ink'
            }`}
          >
            {card.name}
          </button>
        ))}
      </div>

      {finishName && (
        <div className="mt-3">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <p className="text-[13px] font-medium text-ink">Finish</p>
            <span className="truncate text-xs text-muted">{finishName}</span>
          </div>
          <div className="flex flex-wrap gap-0.5">
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
    </Section>
  );
}
