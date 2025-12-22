import type { Card } from '@/cards/types';
import { CardFace } from './CardFace';

interface CardViewProps {
  card: Card;
}

export const CardView = ({ card }: CardViewProps) => {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 shadow-lg backdrop-blur">
      <div className="flex justify-center">
        <CardFace card={card} />
      </div>
    </section>
  );
};
