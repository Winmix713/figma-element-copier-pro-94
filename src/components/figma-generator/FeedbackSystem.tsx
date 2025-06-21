
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  Send,
  CheckCircle 
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
  const [feedback, setFeedback] = useState<Partial<FeedbackData>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingClick = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleQualitySelect = (quality: FeedbackData['quality']) => {
    setFeedback(prev => ({ ...prev, quality }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Szimulált API hívás
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Feedback submitted:', {
      componentId,
      feedback,
      timestamp: new Date().toISOString()
    });
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Köszönjük a visszajelzését!</h3>
            <p className="text-gray-600">
              A véleménye segít fejleszteni az alkalmazást.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Visszajelzés</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Általános értékelés */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Általános elégedettség
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingClick(star)}
                className={`p-1 ${
                  feedback.rating && feedback.rating >= star
                    ? 'text-yellow-500'
                    : 'text-gray-300'
                }`}
              >
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
          </div>
        </div>

        {/* Kód minőség értékelése */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Kódminőség értékelése
          </label>
          <div className="flex space-x-2">
            {[
              { key: 'excellent', label: 'Kiváló', icon: ThumbsUp, color: 'bg-green-500' },
              { key: 'good', label: 'Jó', icon: ThumbsUp, color: 'bg-blue-500' },
              { key: 'average', label: 'Átlagos', icon: MessageSquare, color: 'bg-yellow-500' },
              { key: 'poor', label: 'Gyenge', icon: ThumbsDown, color: 'bg-red-500' }
            ].map(({ key, label, icon: Icon, color }) => (
              <Button
                key={key}
                variant={feedback.quality === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQualitySelect(key as FeedbackData['quality'])}
                className="flex items-center space-x-1"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Megjegyzés */}
        <div>
          <label className="block text-sm font-medium mb-2">
            További megjegyzések (opcionális)
          </label>
          <Textarea
            placeholder="Mit javítanánk a generált kódon? Milyen funkciók hiányoznak?"
            value={feedback.comment || ''}
            onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
            rows={4}
          />
        </div>

        {/* Statisztikák */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {generatedCode.split('\n').length}
            </div>
            <div className="text-sm text-gray-600">Kódsor</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(generatedCode.length / 1024)}KB
            </div>
            <div className="text-sm text-gray-600">Méret</div>
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!feedback.rating || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Küldés...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Visszajelzés küldése
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
