import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Star, 
  Send, 
  CheckCircle, 
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Award
} from 'lucide-react';

interface FeedbackSystemProps {
  componentId: string;
  generatedCode: string;
}

interface FeedbackData {
  rating: number;
  quality: 'excellent' | 'good' | 'average' | 'poor';
  comment: string;
  codeAccuracy: number;
  usability: number;
}

export function FeedbackSystem({ componentId, generatedCode }: FeedbackSystemProps) {
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    quality: 'good',
    comment: '',
    codeAccuracy: 0,
    usability: 0
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleAccuracyRating = (rating: number) => {
    setFeedback(prev => ({ ...prev, codeAccuracy: rating }));
  };

  const handleUsabilityRating = (rating: number) => {
    setFeedback(prev => ({ ...prev, usability: rating }));
  };

  const handleSubmit = async () => {
    if (feedback.rating === 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store feedback locally for now
      const feedbackData = {
        componentId,
        feedback,
        timestamp: new Date().toISOString(),
        codeLength: generatedCode.length
      };
      
      const existingFeedback = JSON.parse(localStorage.getItem('componentFeedback') || '[]');
      existingFeedback.push(feedbackData);
      localStorage.setItem('componentFeedback', JSON.stringify(existingFeedback));
      
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderStars = (current: number, onClick: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        onClick={() => onClick(i + 1)}
        className={`w-6 h-6 ${
          i < current ? 'text-yellow-400' : 'text-gray-300'
        } hover:text-yellow-400 transition-colors`}
      >
        <Star className="w-full h-full fill-current" />
      </button>
    ));
  };

  if (submitted) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank you for your feedback!</h3>
          <p className="text-gray-600 mb-4">
            Your feedback helps us improve the code generation quality.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge className={getQualityColor(feedback.quality)}>
              {feedback.quality.charAt(0).toUpperCase() + feedback.quality.slice(1)} Quality
            </Badge>
            <Badge variant="outline">
              {feedback.rating} Star{feedback.rating !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Feedback & Rating</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Help us improve by rating the generated component quality
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating
          </label>
          <div className="flex items-center space-x-1">
            {renderStars(feedback.rating, handleStarClick)}
            <span className="ml-2 text-sm text-gray-600">
              {feedback.rating > 0 ? `${feedback.rating}/5` : 'Click to rate'}
            </span>
          </div>
        </div>

        {/* Code Accuracy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code Accuracy
          </label>
          <div className="flex items-center space-x-1">
            {renderStars(feedback.codeAccuracy, handleAccuracyRating)}
            <span className="ml-2 text-sm text-gray-600">
              How well does the code match the design?
            </span>
          </div>
        </div>

        {/* Usability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code Usability
          </label>
          <div className="flex items-center space-x-1">
            {renderStars(feedback.usability, handleUsabilityRating)}
            <span className="ml-2 text-sm text-gray-600">
              How easy is the code to use and modify?
            </span>
          </div>
        </div>

        {/* Quality Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quality Assessment
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['excellent', 'good', 'average', 'poor'] as const).map((quality) => (
              <button
                key={quality}
                onClick={() => setFeedback(prev => ({ ...prev, quality }))}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  feedback.quality === quality
                    ? getQualityColor(quality) + ' border-current'
                    : 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Comments (Optional)
          </label>
          <Textarea
            placeholder="Share your thoughts on the generated component, suggestions for improvement, or any issues you encountered..."
            value={feedback.comment}
            onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
            className="min-h-[100px]"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex space-x-2">
            <button 
              onClick={() => handleStarClick(5)}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Great!</span>
            </button>
            <button 
              onClick={() => handleStarClick(2)}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>Needs Work</span>
            </button>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={feedback.rating === 0 || isSubmitting}
            className="flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Feedback</span>
              </>
            )}
          </Button>
        </div>

        {/* Feedback Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-1 text-blue-600" />
            <div className="text-sm font-medium text-gray-900">Accuracy</div>
            <div className="text-xs text-gray-600">
              {feedback.codeAccuracy > 0 ? `${feedback.codeAccuracy}/5` : 'Not rated'}
            </div>
          </div>
          <div className="text-center">
            <Award className="w-6 h-6 mx-auto mb-1 text-purple-600" />
            <div className="text-sm font-medium text-gray-900">Quality</div>
            <div className="text-xs text-gray-600 capitalize">{feedback.quality}</div>
          </div>
          <div className="text-center">
            <MessageSquare className="w-6 h-6 mx-auto mb-1 text-green-600" />
            <div className="text-sm font-medium text-gray-900">Comment</div>
            <div className="text-xs text-gray-600">
              {feedback.comment.length > 0 ? `${feedback.comment.length} chars` : 'None'}
            </div>
          </div>
        </div>

        {feedback.rating === 0 && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Please provide a star rating before submitting
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}