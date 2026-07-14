import React from 'react';
import { Star, MessageSquare } from 'lucide-react';

const ReviewCard = ({ review }) => {
    const customerName = review.customer?.username || 'Verified Customer';
    const formattedDate = new Date(review.createdAt).toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 space-y-3 font-sans">
            {/* Header info */}
            <div className="flex justify-between items-start">
                <div>
                    <h5 className="font-extrabold text-slate-800 text-sm leading-tight">{customerName}</h5>
                    <span className="text-[10px] text-slate-450 font-bold">{formattedDate}</span>
                </div>
                {/* Stars */}
                <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, idx) => (
                        <Star 
                            key={idx} 
                            className={`w-3.5 h-3.5 ${idx < review.rating ? 'fill-current' : 'text-slate-200'}`} 
                        />
                    ))}
                </div>
            </div>

            {/* Review content */}
            <p className="text-slate-600 text-sm italic leading-relaxed">
                "{review.review}"
            </p>

            {/* Images */}
            {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {review.images.map((imgUrl, i) => (
                        <div key={i} className="w-14 h-14 rounded-xl overflow-hidden border border-slate-100 shadow-sm cursor-zoom-in hover:opacity-95 transition-opacity">
                            <img src={imgUrl} alt="Review capture" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}

            {/* Worker Reply */}
            {review.reply && (
                <div className="bg-white p-3 rounded-xl border border-slate-100/80 flex gap-2.5 ml-4 mt-2">
                    <MessageSquare className="w-4 h-4 text-slate-450 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Worker Reply</p>
                        <p className="text-slate-600 text-xs italic mt-1 leading-relaxed">
                            "{review.reply}"
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
