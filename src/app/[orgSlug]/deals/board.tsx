'use client';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

import { useI18n } from '@/components/i18n-provider';
import { money } from '@/i18n/format';
import { moveDeal } from '@/server/crm';

import { NewDealDialog, type DealContact } from './new-deal-dialog';

const stages = ['lead', 'negotiation', 'won'] as const;
type Stage = (typeof stages)[number];

export type BoardDeal = {
  id: string;
  title: string;
  value: number;
  stage: Stage;
  position: number;
};

const stageDot: Record<Stage, string> = {
  lead: 'bg-[oklch(0.72_0.17_142)]',
  negotiation: 'bg-[oklch(0.58_0.22_8)]',
  won: 'bg-[oklch(0.48_0.14_285)]',
};

const cardClass = 'flex items-start gap-2 rounded-xl bg-background p-3 shadow-neo-sm';

const boardRowClass = 'flex min-w-0 flex-col gap-3 lg:flex-row';

const columnClass =
  'flex min-h-48 w-full min-w-0 flex-col gap-2 rounded-2xl bg-background p-3 shadow-neo-in lg:min-h-64 lg:w-auto lg:flex-1';

const collisionDetection: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  const cards = hits.filter((hit) => !stages.includes(String(hit.id) as Stage));
  if (cards.length > 0) return cards;
  if (hits.length > 0) return hits;
  return closestCorners(args);
};

function subscribe() {
  return () => {};
}

function byPosition(deals: BoardDeal[], stage: Stage, exceptId?: string) {
  return deals
    .filter((deal) => deal.stage === stage && deal.id !== exceptId)
    .sort((a, b) => a.position - b.position);
}

function reorder(deals: BoardDeal[], dealId: string, stage: Stage, index: number) {
  const moving = deals.find((deal) => deal.id === dealId);
  if (!moving) return deals;

  const source = byPosition(deals, moving.stage, dealId);
  const targetBase = moving.stage === stage ? source : byPosition(deals, stage);
  const insertAt = Math.min(Math.max(index, 0), targetBase.length);
  const target = [...targetBase.slice(0, insertAt), { ...moving, stage }, ...targetBase.slice(insertAt)];
  const positions = new Map<string, Pick<BoardDeal, 'stage' | 'position'>>();

  (moving.stage === stage ? target : source).forEach((deal, position) => {
    positions.set(deal.id, { stage: moving.stage, position });
  });
  if (moving.stage !== stage) {
    target.forEach((deal, position) => {
      positions.set(deal.id, { stage: deal.id === dealId ? stage : deal.stage, position });
    });
  }

  return deals.map((deal) => {
    const next = positions.get(deal.id);
    return next ? { ...deal, ...next } : deal;
  });
}

function place(deals: BoardDeal[], activeId: string, overId: string, below: boolean) {
  const moving = deals.find((deal) => deal.id === activeId);
  if (!moving || activeId === overId) return deals;

  const overStage = stages.find((stage) => stage === overId) ?? deals.find((deal) => deal.id === overId)?.stage;
  if (!overStage) return deals;

  const column = byPosition(deals, overStage, activeId);
  const overIndex = column.findIndex((deal) => deal.id === overId);
  const index = overIndex < 0 ? column.length : overIndex + (below ? 1 : 0);
  const currentIndex = byPosition(deals, moving.stage).findIndex((deal) => deal.id === activeId);

  if (moving.stage === overStage && currentIndex === index) return deals;
  return reorder(deals, activeId, overStage, index);
}

function pointerBelow(event: DragOverEvent | DragEndEvent) {
  const translated = event.active.rect.current.translated;
  if (!translated || !event.over) return false;
  return translated.top > event.over.rect.top + event.over.rect.height / 2;
}

function CardFace({ deal, locale, dragLabel }: { deal: BoardDeal; locale: 'ru' | 'en'; dragLabel?: string }) {
  return (
    <>
      {dragLabel ? (
        <span className="mt-0.5 text-muted-foreground" aria-hidden>
          <GripVertical className="size-4" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="font-medium break-words">{deal.title}</p>
        <p className="text-sm text-muted-foreground">{money(deal.value, locale)}</p>
      </div>
    </>
  );
}

function Card({ deal, orgSlug }: { deal: BoardDeal; orgSlug: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });
  const { locale, dictionary } = useI18n();
  const moved = useRef(false);
  const style = {
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    boxShadow: isDragging ? 'var(--neo-inset)' : undefined,
  };

  function onPointerDown(event: ReactPointerEvent) {
    moved.current = false;
    const startX = event.clientX;
    const startY = event.clientY;
    const track = (move: PointerEvent) => {
      if (Math.hypot(move.clientX - startX, move.clientY - startY) > 6) moved.current = true;
    };
    const stop = () => {
      window.removeEventListener('pointermove', track);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', track);
    window.addEventListener('pointerup', stop);
    listeners?.onPointerDown?.(event);
  }

  return (
    <article ref={setNodeRef} style={style} className={`${cardClass} cursor-grab touch-pan-y active:cursor-grabbing lg:touch-none`} {...listeners} onPointerDown={onPointerDown}>
      <button type="button" className={`mt-0.5 cursor-grab touch-none text-muted-foreground active:cursor-grabbing ${isDragging ? 'invisible' : ''}`} {...attributes} aria-label={dictionary.deals.drag}>
        <GripVertical className="size-4" aria-hidden />
      </button>
      <div className={`min-w-0 ${isDragging ? 'invisible' : ''}`}>
        <Link
          href={`/${orgSlug}/deals/${deal.id}`}
          draggable={false}
          className="cursor-pointer font-medium break-words hover:underline active:cursor-grabbing"
          onClick={(event) => {
            if (moved.current) event.preventDefault();
          }}
        >
          {deal.title}
        </Link>
        <p className="text-sm text-muted-foreground">{money(deal.value, locale)}</p>
      </div>
    </article>
  );
}

function ColumnHeading({ stage, count, action }: { stage: Stage; count: number; action?: ReactNode }) {
  const { dictionary } = useI18n();

  return (
    <div className="flex items-center justify-between gap-2 px-1">
      <h2 className="flex min-w-0 items-center gap-2 font-heading text-base font-medium">
        <span className={`size-2 shrink-0 rounded-full ${stageDot[stage]}`} aria-hidden />
        <span className="truncate">{dictionary.stages[stage]}</span>
      </h2>
      <div className="flex shrink-0 items-center gap-1">
        {action}
        <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground shadow-neo-sm">{count}</span>
      </div>
    </div>
  );
}

function Column({
  stage,
  deals,
  orgSlug,
  canEdit,
  contacts,
  invalid,
  contactError,
}: {
  stage: Stage;
  deals: BoardDeal[];
  orgSlug: string;
  canEdit: boolean;
  contacts: DealContact[];
  invalid: boolean;
  contactError: 'name' | 'email' | null;
}) {
  const { setNodeRef } = useDroppable({ id: stage });
  const items = byPosition(deals, stage);

  return (
    <section ref={setNodeRef} className={columnClass}>
      <ColumnHeading
        stage={stage}
        count={items.length}
        action={
          stage === 'lead' && canEdit ? (
            <NewDealDialog orgSlug={orgSlug} contacts={contacts} invalid={invalid} contactError={contactError} />
          ) : null
        }
      />
      <SortableContext items={items.map((deal) => deal.id)} strategy={verticalListSortingStrategy}>
        {items.map((deal) => (
          <Card key={deal.id} deal={deal} orgSlug={orgSlug} />
        ))}
      </SortableContext>
    </section>
  );
}

export function DealBoard({
  orgSlug,
  canEdit,
  deals,
  contacts,
  invalid,
  contactError,
}: {
  orgSlug: string;
  canEdit: boolean;
  deals: BoardDeal[];
  contacts: DealContact[];
  invalid: boolean;
  contactError: 'name' | 'email' | null;
}) {
  const [items, setItems] = useState(deals);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const itemsRef = useRef(items);
  const snapshot = useRef<BoardDeal[] | null>(null);
  const { locale, dictionary } = useI18n();
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const activeDeal = items.find((deal) => deal.id === activeId) ?? null;

  function commit(next: BoardDeal[]) {
    if (next === itemsRef.current) return;
    itemsRef.current = next;
    setItems(next);
  }

  function onDragStart(event: DragStartEvent) {
    snapshot.current = itemsRef.current;
    setActiveId(String(event.active.id));
  }

  function onDragOver(event: DragOverEvent) {
    if (!event.over) return;
    commit(place(itemsRef.current, String(event.active.id), String(event.over.id), pointerBelow(event)));
  }

  function finish(event: DragEndEvent) {
    const start = snapshot.current;
    const active = String(event.active.id);
    setActiveId(null);
    snapshot.current = null;

    if (!event.over || !start) {
      if (start) commit(start);
      return;
    }

    const next = place(itemsRef.current, active, String(event.over.id), pointerBelow(event));
    commit(next);
    const moved = next.find((deal) => deal.id === active);
    const before = start.find((deal) => deal.id === active);
    if (!moved || !before || (moved.stage === before.stage && moved.position === before.position)) return;

    void moveDeal(orgSlug, active, moved.stage, moved.position).then((result) => {
      if (result.error) {
        commit(start);
        setError(result.error === 'Недостаточно прав' ? dictionary.errors.forbidden : result.error);
      }
    });
  }

  function onDragCancel() {
    if (snapshot.current) commit(snapshot.current);
    snapshot.current = null;
    setActiveId(null);
  }

  if (!canEdit || !ready) {
    return (
      <div className={boardRowClass}>
        {stages.map((stage) => {
          const column = byPosition(items, stage);
          return (
            <section key={stage} className={columnClass}>
              <ColumnHeading
                stage={stage}
                count={column.length}
                action={
                  stage === 'lead' && canEdit ? (
                    <NewDealDialog orgSlug={orgSlug} contacts={contacts} invalid={invalid} contactError={contactError} />
                  ) : null
                }
              />
              {column.map((deal) => (
                <article key={deal.id} className={cardClass}>
                  {canEdit ? (
                    <span className="mt-0.5 text-muted-foreground" aria-hidden>
                      <GripVertical className="size-4" />
                    </span>
                  ) : null}
                  <div className="min-w-0">
                    <Link href={`/${orgSlug}/deals/${deal.id}`} className="font-medium break-words hover:underline">
                      {deal.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{money(deal.value, locale)}</p>
                  </div>
                </article>
              ))}
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={finish}
        onDragCancel={onDragCancel}
      >
        <div className={boardRowClass}>
          {stages.map((stage) => (
            <Column
              key={stage}
              stage={stage}
              deals={items}
              orgSlug={orgSlug}
              canEdit={canEdit}
              contacts={contacts}
              invalid={invalid}
              contactError={contactError}
            />
          ))}
        </div>
        <DragOverlay className="rounded-xl bg-background" style={{ boxShadow: 'var(--neo-lift)' }}>
          {activeDeal ? (
            <article className="flex h-full cursor-grabbing items-start gap-2 rounded-xl bg-background p-3">
              <CardFace deal={activeDeal} locale={locale} dragLabel={dictionary.deals.drag} />
            </article>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
