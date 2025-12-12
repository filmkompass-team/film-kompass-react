import React, { useState, useEffect } from 'react';
import ReactStars from 'react-stars';

interface RatingComponentProps {
  movieId: number;
  initialRating: number | null;
  onRatingSubmit: (movieId: number, rating: number) => Promise<void>;
}

const RatingComponent: React.FC<RatingComponentProps> = ({ movieId, initialRating, onRatingSubmit }) => {
  const [rating, setRating] = useState(initialRating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setRating(initialRating || 0);
  }, [initialRating]);

  const ratingChanged = async (newRating: number) => {   
    const finalRating = (newRating === rating) ? 0 : newRating;

    setIsSubmitting(true);
    setError(null);
    try {
      
      await onRatingSubmit(movieId, finalRating);
      
      setRating(finalRating); 
    } catch (e) {
      setError("Please try again!");
    
      setRating(initialRating || 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 md:p-6 lg:p-8">
      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
        <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
        Your Rating
      </h3>
      <div style={{ opacity: isSubmitting ? 0.5 : 1, pointerEvents: isSubmitting ? 'none' : 'auto' }}>
        <ReactStars
          key={rating} 
          count={5}
          value={rating} 
          onChange={ratingChanged}
          size={40}
          color2={'#ffd700'}
          half={false}
        />
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default RatingComponent;