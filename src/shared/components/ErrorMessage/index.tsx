import React from 'react';
import { Paper, Typography, Button, Box } from '@mui/material';
import styled from 'styled-components';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ErrorContainer = styled(Paper)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 24px;
  max-width: 400px;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry 
}) => {
  return (
    <ErrorContainer elevation={3}>
      <ErrorOutlineIcon 
        color="error" 
        sx={{ fontSize: 48, mb: 2 }} 
      />
      <Typography variant="h6" gutterBottom>
        Error
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        {message}
      </Typography>
      {onRetry && (
        <Box mt={2}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onRetry}
          >
            Try Again
          </Button>
        </Box>
      )}
    </ErrorContainer>
  );
}; 