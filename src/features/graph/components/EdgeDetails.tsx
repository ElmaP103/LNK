import React from 'react';
import { Paper, Typography, Box, Divider, IconButton, Chip, Stack, Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import BookIcon from '@mui/icons-material/Book';
import LinkIcon from '@mui/icons-material/Link';
import styled from 'styled-components';
import { Edge, Node } from '../../../types/global';

const DetailsPanel = styled(Paper)`
  width: 600px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 28px 0 20px 24px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 6px 32px rgba(0, 0, 0, 0.18);
  border-radius: 18px;
  height: 100%;
  @media (max-width: 900px) {
    width: 100vw !important;
    max-width: 100vw !important;
    min-width: 0 !important;
    border-radius: 0 0 12px 12px;
    box-shadow: none;
    padding: 16px 0 16px 0;
  }
`;

const Section = styled(Box)`
  margin: 22px 0 10px 0;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
`;

const Summary = styled(Typography)`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 12px 0 18px 0;
  color: #1976d2;
  display: flex;
  align-items: center;
`;

const ChipStack = styled(Stack)`
  flex-wrap: wrap;
  gap: 8px;
`;

interface EdgeDetailsProps {
  edge: Edge | null;
  sourceNode?: Node | null;
  targetNode?: Node | null;
  onClose: () => void;
}

function getAvatarUrl(node?: Node | null) {
  if (!node) return '';
  if (node.data && node.data.avatar) return node.data.avatar;
  const name = encodeURIComponent(node.data?.name || node.label || 'User');
  return `https://ui-avatars.com/api/?name=${name}&background=4F8EF7&color=fff&size=128&rounded=true`;
}

export const EdgeDetails: React.FC<EdgeDetailsProps> = ({ edge, sourceNode, targetNode, onClose }) => {
  if (!edge) return null;

  // Remove duplicates
  const unique = (arr: string[] = []) => Array.from(new Set(arr.filter(Boolean)));

  // Summary sentence logic
  let summary = '';
  let summaryIcon: React.ReactNode = null;
  if (edge.type === 'researcher' && edge.data.sharedAffiliations && edge.data.sharedAffiliations.length > 0) {
    summary = `Worked together at ${unique(edge.data.sharedAffiliations).join(', ')}`;
    summaryIcon = <WorkIcon sx={{ mr: 1, color: '#1976d2' }} />;
  } else if (edge.type === 'coauthor' && edge.data.publications && edge.data.publications.length > 0) {
    summary = `Co-authored ${unique(edge.data.publications).length} publication${unique(edge.data.publications).length > 1 ? 's' : ''}`;
    summaryIcon = <BookIcon sx={{ mr: 1, color: '#43a047' }} />;
  } else if (edge.type === 'publisher' && edge.data.sharedAffiliations && edge.data.sharedAffiliations.length > 0) {
    summary = `Published in ${unique(edge.data.sharedAffiliations).join(', ')}`;
    summaryIcon = <SchoolIcon sx={{ mr: 1, color: '#fbc02d' }} />;
  }

  return (
    <DetailsPanel elevation={4}>
      <CloseButton onClick={onClose} size="small">
        <CloseIcon />
      </CloseButton>

      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
        Connection Details
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        {edge.label}
      </Typography>
      {sourceNode && targetNode && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar src={getAvatarUrl(sourceNode)} alt={sourceNode.data?.name || sourceNode.label} sx={{ width: 56, height: 56, border: '2px solid #fff', boxShadow: 2 }} />
            <Typography variant="caption" sx={{ mt: 1, fontWeight: 500, color: '#333' }}>{sourceNode.data?.name || sourceNode.label}</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar src={getAvatarUrl(targetNode)} alt={targetNode.data?.name || targetNode.label} sx={{ width: 56, height: 56, border: '2px solid #fff', boxShadow: 2 }} />
            <Typography variant="caption" sx={{ mt: 1, fontWeight: 500, color: '#333' }}>{targetNode.data?.name || targetNode.label}</Typography>
          </Box>
        </Box>
      )}
      <Divider sx={{ my: 2 }} />

      {summary && (
        <Summary>
          {summaryIcon}
          {summary}
        </Summary>
      )}

      {edge.data.sharedAffiliations && unique(edge.data.sharedAffiliations).length > 0 && (
        <Section>
          <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
            Shared Affiliations
          </Typography>
          <ChipStack direction="row">
            {unique(edge.data.sharedAffiliations).map((aff, idx) => (
              <Chip key={idx} icon={<SchoolIcon />} label={aff} color="primary" variant="outlined" />
            ))}
          </ChipStack>
        </Section>
      )}

      {edge.data.publications && unique(edge.data.publications).length > 0 && (
        <Section>
          <Typography variant="h6" gutterBottom sx={{ color: '#43a047', fontWeight: 600 }}>
            Shared Publications
          </Typography>
          <ChipStack direction="row">
            {unique(edge.data.publications).map((pub, idx) => (
              <Chip key={idx} icon={<LinkIcon />} label={pub} color="success" variant="outlined" />
            ))}
          </ChipStack>
        </Section>
      )}

      <Section>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Connection active from {edge.data.startYear}
          {edge.data.endYear ? ` to ${edge.data.endYear}` : ''}
        </Typography>
      </Section>
    </DetailsPanel>
  );
}; 