import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import styled from 'styled-components';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import SpeedIcon from '@mui/icons-material/Speed';
import LabelIcon from '@mui/icons-material/Label';

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    padding: 4px;
  }
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  @media (max-width: 768px) {
    gap: 4px;
  }
`;

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
  onTogglePhysics: () => void;
  onToggleLabels: () => void;
  isPhysicsEnabled: boolean;
  showLabels: boolean;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onCenter,
  onTogglePhysics,
  onToggleLabels,
  isPhysicsEnabled,
  showLabels,
}) => {
  return (
    <ControlsContainer>
      <ControlGroup>
        <Tooltip title="Zoom In">
          <IconButton onClick={onZoomIn} size="small">
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton onClick={onZoomOut} size="small">
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Center View">
          <IconButton onClick={onCenter} size="small">
            <CenterFocusStrongIcon />
          </IconButton>
        </Tooltip>
      </ControlGroup>
      <ControlGroup>
        <Tooltip title={isPhysicsEnabled ? "Disable Physics" : "Enable Physics"}>
          <IconButton 
            onClick={onTogglePhysics} 
            size="small"
            color={isPhysicsEnabled ? "primary" : "default"}
          >
            <SpeedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={showLabels ? "Hide Labels" : "Show Labels"}>
          <IconButton 
            onClick={onToggleLabels} 
            size="small"
            color={showLabels ? "primary" : "default"}
          >
            <LabelIcon />
          </IconButton>
        </Tooltip>
      </ControlGroup>
    </ControlsContainer>
  );
}; 