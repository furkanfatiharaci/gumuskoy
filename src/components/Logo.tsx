import { Link } from 'react-router-dom';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white font-serif text-xl font-bold">
        G
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-serif text-lg font-bold text-primary-800">Gümüşköyden</span>
        <span className="text-[10px] tracking-wide text-earth-500">Köyden sofranıza</span>
      </div>
    </Link>
  );
}
