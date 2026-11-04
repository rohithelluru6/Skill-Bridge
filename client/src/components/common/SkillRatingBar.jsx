import React from 'react';
import { Star } from 'lucide-react';

export default function SkillRatingBar({ rating, maxRating = 5, showStars = false, label }) {
  const percentage = Math.min(100, Math.max(0, (rating / maxRating) * 100));

  let colorClass = 'bg-blue-600';
  if (rating >= 4.0) colorClass = 'bg-gradient-to-r from-emerald-500 to-teal-500';
  else if (rating >= 2.5) colorClass = 'bg-gradient-to-r from-blue-500 to-indigo-600';
  else colorClass = 'bg-gradient-to-r from-amber-400 to-rose-500';

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1">
          <span>{label}</span>
          <span className="font-semibold text-slate-800">{rating} / {maxRating}</span>
        </div>
      )}
      
      {showStars ? (
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={`${
                rating >= star
                  ? 'text-amber-400 fill-amber-400'
                  : rating >= star - 0.5
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-slate-200'
              }`}
            />
          ))}
          <span className="text-xs font-semibold text-slate-700 ml-1.5">{rating}</span>
        </div>
      ) : (
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
