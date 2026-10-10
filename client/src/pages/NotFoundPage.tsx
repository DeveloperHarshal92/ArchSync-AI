import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center text-[#226192]">
      <div className="rounded-full bg-[#ef8557]/15 p-3 text-[#ef8557] mb-4 border border-[#ef8557]/40">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="font-serif text-3xl font-bold text-[#226192]">404 — Page Not Found</h1>
      <p className="mt-2 text-sm text-[#226192]/70 max-w-md">
        The requested route does not exist or has not been implemented yet.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ef8557] hover:bg-[#ef8557]/90 px-4 py-2 text-xs font-semibold text-[#226192] transition-colors focus:ring-2 focus:ring-[#ef8557]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
