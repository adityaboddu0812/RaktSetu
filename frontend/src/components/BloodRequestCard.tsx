import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Calendar, Clock, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BloodRequestCardProps {
  id: string;
  hospitalName: string;
  bloodType: string;
  urgent: boolean;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  location: string;
  createdAt: string;
  onAccept?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  onView?: () => void;
  showActionButtons?: boolean;
  isDonorView?: boolean;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const BloodRequestCard: React.FC<BloodRequestCardProps> = ({
  id,
  hospitalName,
  bloodType,
  urgent,
  status,
  location,
  createdAt,
  onAccept,
  onCancel,
  onComplete,
  onView,
  showActionButtons = true,
  isDonorView = false,
}) => {
  const createdDate = new Date(createdAt);
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });
  
  return (
    <Card className={`overflow-hidden ${urgent ? 'border-red-300' : ''}`}>
      {urgent && (
        <div className="bg-red-500 text-white px-4 py-1 text-xs flex items-center justify-center font-medium">
          <AlertCircle className="h-3 w-3 mr-1" />
          URGENT REQUEST
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{hospitalName}</CardTitle>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {location}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={statusColors[status]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-2">
              <Clock className="h-3 w-3 mr-1" />
              {timeAgo}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex items-center justify-center my-3">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blood-100 border border-blood-200 flex items-center justify-center mx-auto">
              <span className="text-blood-800 text-xl font-bold">{bloodType}</span>
            </div>
            <p className="mt-1 text-sm font-medium">Blood Type</p>
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-500 flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          Requested on {createdDate.toLocaleDateString()}
        </div>
      </CardContent>
      
      {showActionButtons && (
        <CardFooter className="bg-gray-50 px-6 py-3 flex justify-between">
          {isDonorView ? (
            status === 'pending' ? (
              <>
                <Button variant="default" size="sm" onClick={onAccept}>
                  Accept Request
                </Button>
                <Button variant="outline" size="sm" onClick={onView}>
                  View Details
                </Button>
              </>
            ) : status === 'accepted' ? (
              <>
                <Button variant="default" size="sm" onClick={onComplete}>
                  Mark as Donated
                </Button>
                <Button variant="destructive" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={onView} className="ml-auto">
                View Details
              </Button>
            )
          ) : (
            status === 'pending' ? (
              <>
                <Button variant="destructive" size="sm" onClick={onCancel}>
                  Cancel Request
                </Button>
                <Button variant="outline" size="sm" onClick={onView}>
                  View Details
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={onView} className="ml-auto">
                View Details
              </Button>
            )
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default BloodRequestCard;
