import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import styled from 'styled-components';

const LoadingContainer = styled(Box)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 9999;
`;

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <LoadingContainer>
      <CircularProgress size={60} thickness={4} />
      <Typography 
        variant="h6" 
        sx={{ 
          color: 'white', 
          mt: 2,
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {message}
      </Typography>
    </LoadingContainer>
  );
}; 