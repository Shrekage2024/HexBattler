import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export const PageContainer = ({ title, actions, children }: Props) => (
  <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-10">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <Link to="/" className="text-xs uppercase tracking-[0.3em] text-slate-400">
          HexStrike
        </Link>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
    <main className="flex-1">{children}</main>
  </div>
);
