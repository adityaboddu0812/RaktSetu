import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Button, Typography } from '@mui/material';
import { MapPin, Phone, User, X, FileText } from 'lucide-react';
import { Hospital } from '@/types/index';

interface HospitalDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  hospital: Hospital | null;
  onUnverify?: () => void;
}

export const HospitalDetailsDialog: React.FC<HospitalDetailsDialogProps> = ({ 
  open, 
  onClose, 
  hospital,
  onUnverify 
}) => {
  if (!hospital) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 3,
          position: 'relative'
        }
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute',
          right: 16,
          top: 16,
          cursor: 'pointer'
        }}
        onClick={onClose}
      >
        <X size={20} />
      </Box>

      <Typography variant="h5" sx={{ mb: 1 }}>
        Hospital Details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Complete information about this hospital
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Hospital Name
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {hospital.name}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Email
          </Typography>
          <Typography variant="body1">
            {hospital.email}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Status
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: hospital.isVerified ? 'success.main' : 'error.main',
              fontWeight: 500
            }}
          >
            {hospital.isVerified ? 'Verified' : 'Not Verified'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FileText size={20} />
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            License Number
          </Typography>
          <Typography variant="body1">
            {hospital.licenseNumber}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <MapPin size={20} />
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Location
          </Typography>
          <Typography variant="body1">
            {`${hospital.city}, ${hospital.state}`}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <User size={20} />
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Contact Person
          </Typography>
          <Typography variant="body1">
            {hospital.contactPerson}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Phone size={20} />
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Contact Number
          </Typography>
          <Typography variant="body1">
            {hospital.phone}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={onClose}
          sx={{ 
            flex: 1,
            borderColor: 'divider',
            color: 'text.primary'
          }}
        >
          Close
        </Button>
        {hospital.isVerified && onUnverify && (
          <Button 
            variant="contained" 
            onClick={onUnverify}
            sx={{ 
              flex: 1,
              bgcolor: 'error.main',
              '&:hover': {
                bgcolor: 'error.dark'
              }
            }}
          >
            Unverify Hospital
          </Button>
        )}
      </Box>
    </Dialog>
  );
}; 