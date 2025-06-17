import React from 'react';
import { Paper, Typography, Box, IconButton, Button, Chip, Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import styled from 'styled-components';
import { Node } from '../../../../types/global';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { ENV_CONFIG } from '../../../../core/config/constants';

const DetailsPanel = styled(Paper)`
  width: 640px;
  max-height: calc(100vh - 240px);
  overflow-y: auto;
  padding: 0 0 24px 0;
  background: #fff;
  border-radius: 0 0 22px 22px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.16);
  height: 100%;
  box-sizing: border-box;
  @media (max-width: 900px) {
    width: 100vw !important;
    max-width: 100vw !important;
    min-width: 0 !important;
    border-radius: 0 0 12px 12px;
    box-shadow: none;
    padding: 0 0 16px 0;
  }
`;

const Header = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 16px 0;
  background: linear-gradient(120deg, #e3f0ff 0%, #f8fbff 100%);
  border-radius: 0;
  position: absolute;
`;

const AvatarLarge = styled(Avatar)`
  width: 92px !important;
  height: 92px !important;
  margin-bottom: 12px;
  border: 4px solid #fff;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.12);
`;

const TagChip = styled(Chip)`
  margin: 0 6px 6px 0;
  font-size: 0.95rem !important;
`;

const StatBox = styled(Box)`
  background: #f5f8fa;
  border-radius: 12px;
  padding: 16px 0 10px 0;
  text-align: center;
  min-width: 120px;
  font-weight: 600;
`;

const Section = styled(Box)`
  margin: 24px 32px 0 32px;
`;

const ActionButton = styled(Button)`
  margin: 0 10px 0 0;
  min-width: 120px;
  font-weight: 600;
`;

const MapContainer = styled(Box)`
  position: relative;
  width: 100%;
  height: 180px;
  @media (max-width: 900px) {
    height: 40vw;
    min-height: 120px;
    max-height: 220px;
  }
`;

const MapCloseButton = styled(IconButton)`
  position: absolute !important;
  top: 8px;
  right: 8px;
  z-index: 10;
  background: rgba(255,255,255,0.85);
  &:hover {
    background: #fff;
  }
`;

function getAvatarUrl(node: Node) {
  // Use node.data.avatar if available, else fallback to ui-avatars.com
  if (node.data && node.data.avatar) return node.data.avatar;
  const name = encodeURIComponent(node.data?.name || node.label || 'User');
  return `https://ui-avatars.com/api/?name=${name}&background=4F8EF7&color=fff&size=128&rounded=true`;
}

interface NodeDetailsProps {
  node: Node | null;
  onClose: () => void;
  showMyConnectionsOnMap: boolean;
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({ node, onClose, showMyConnectionsOnMap }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: ENV_CONFIG.GOOGLE_MAPS_API_KEY,
  });
  const [markerPosition, setMarkerPosition] = React.useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = React.useState({ lat: 40.7128, lng: -74.0060 });

  // Geocode function (mock for demo)
  const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
    const locations: Record<string, { lat: number; lng: number }> = {
      'Boston': { lat: 42.3601, lng: -71.0589 },
      'New York': { lat: 40.7128, lng: -74.0060 },
      'Los Angeles': { lat: 34.0522, lng: -118.2437 },
      'Chicago': { lat: 41.8781, lng: -87.6298 },
      'Houston': { lat: 29.7604, lng: -95.3698 },
    };
    return locations[location] || null;
  };

  React.useEffect(() => {
    if (node?.data.location) {
      geocodeLocation(node.data.location).then(pos => {
        if (pos) {
          setMarkerPosition(pos);
          setMapCenter(pos);
        } else {
          setMarkerPosition(null);
        }
      });
    } else {
      setMarkerPosition(null);
    }
  }, [node?.data.location]);

  if (!node) return null;
  const { data } = node;

  // Example stats (replace with real data if available)
  const peers = data.peers || 232;
  const following = data.following || 124;
  const patientsServed = data.patientsServed || 1000;
  const successRate = data.successRate || 95;
  const patientsServedChange = data.patientsServedChange || 0;
  const successRateChange = data.successRateChange || 0;

  return (
    <DetailsPanel elevation={4}>
      <MapContainer>
        {isLoaded && markerPosition && (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%', borderRadius: 0, margin: 0, padding: 0 }}
            center={mapCenter}
            zoom={6}
            options={{ disableDefaultUI: true }}
          >
            {showMyConnectionsOnMap && <Marker position={markerPosition} />}
          </GoogleMap>
        )}
        <MapCloseButton onClick={onClose} size="small">
          <CloseIcon />
        </MapCloseButton>
        {/* Avatar overlap - moved up to ensure full visibility */}
        <Box sx={{ 
          position: 'absolute', 
          left: '50%', 
          bottom: -46, 
          transform: 'translateX(-50%)', 
          zIndex: 2,
          width: 92,
          height: 92,
          borderRadius: '50%',
          border: '4px solid #fff',
          boxShadow: '0 2px 12px rgba(44, 62, 80, 0.12)',
          overflow: 'hidden'
        }}>
          <AvatarLarge src={getAvatarUrl(node)} alt={data.name || node.label} />
        </Box>
      </MapContainer>
      <Header sx={{ position: 'relative', paddingTop: 0 }}>
        {/* Move name and info further down so they are never hidden by avatar */}
        <Box sx={{ mt: isLoaded && markerPosition ? 11 : 4, width: '100%', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, marginBottom: '2px' }}>
            {data.name || node.label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
            {data.specialization && (
              <TagChip label={data.specialization} color="primary" size="small" onClick={undefined} />
            )}
            {data.location && (
              <TagChip icon={<LocationOnIcon sx={{ fontSize: 18 }} />} label={data.location} color="default" size="small" onClick={undefined} />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, marginBottom: '8px', justifyContent: 'center' }}>
            <TagChip label={node.type} color="secondary" size="small" />
          </Box>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1, mt: 1 }}>
          Experienced and compassionate doctor specializing in {data.specialization?.toLowerCase() || 'healthcare'}
        </Typography>
        {/* Peers and Following row */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Peers</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{peers}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Following</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{following}</Typography>
          </Box>
        </Box>
        {/* Action buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, marginTop: 1, mb: 2 }}>
          <ActionButton
            variant="contained"
            color="primary"
            sx={{ borderRadius: '8px', minWidth: 140, fontWeight: 600 }}
          >
            View Profile
          </ActionButton>
          <ActionButton
            variant="outlined"
            color="primary"
            sx={{ borderRadius: '8px', minWidth: 140, fontWeight: 600 }}
          >
            Resume
          </ActionButton>
          {/* Optional: Ellipsis button */}
          <IconButton sx={{ borderRadius: '8px', border: '1px solid #e0e0e0', ml: 1 }}>
            <span style={{ fontSize: 22 }}>⋯</span>
          </IconButton>
        </Box>
      </Header>
      {/* Patient Served and Success Rate cards */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          px: 3,
          maxWidth: 500,
          mx: 'auto',
          mb: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <StatBox sx={{ background: '#fafbfc', borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', minHeight: 90 }}>
            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <span role="img" aria-label="Patient">💖</span>&nbsp;Patient Served
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{patientsServed}</Typography>
            <Typography
              variant="caption"
              sx={{
                color: patientsServedChange >= 0 ? 'success.main' : 'error.main',
                display: 'flex',
                alignItems: 'center',
                mt: 1,
                fontWeight: 500,
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
              {patientsServedChange >= 0 ? '+' : ''}
              {patientsServedChange}
            </Typography>
          </StatBox>
        </Box>
        <Box sx={{ flex: 1 }}>
          <StatBox sx={{ background: '#fafbfc', borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', minHeight: 90 }}>
            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <span role="img" aria-label="Success">⭐</span>&nbsp;Success rate
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{successRate}%</Typography>
            <Typography
              variant="caption"
              sx={{
                color: successRateChange >= 0 ? 'success.main' : 'error.main',
                display: 'flex',
                alignItems: 'center',
                mt: 1,
                fontWeight: 500,
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
              {successRateChange >= 0 ? '+' : ''}
              {successRateChange}%
            </Typography>
          </StatBox>
        </Box>
      </Box>
      <Section>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>About</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {data.bio || 'No bio available.'}
        </Typography>
      </Section>
      {data.education && data.education.length > 0 && (
        <Section>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Education</Typography>
          {data.education.map((edu, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <SchoolIcon sx={{ color: '#4F8EF7', mr: 1 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{edu.institution}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {edu.degree} &bull; {edu.field}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {edu.year}
                </Typography>
              </Box>
            </Box>
          ))}
        </Section>
      )}
      {data.experience && data.experience.length > 0 && (
        <Section>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Experience</Typography>
          {data.experience.map((exp, index) => (
            <Box key={index} sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{exp.position} at {exp.organization}</Typography>
              <Typography variant="body2" color="textSecondary">
                {exp.startYear}{exp.endYear ? `-${exp.endYear}` : exp.current ? '-Present' : ''}
              </Typography>
            </Box>
          ))}
        </Section>
      )}
      {data.publications && data.publications.length > 0 && (
        <Section>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Publications</Typography>
          {data.publications.map((pub, index) => (
            <Box key={index} sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{pub.title}</Typography>
              <Typography variant="body2" color="textSecondary">
                {pub.journal} &bull; {pub.year}
              </Typography>
            </Box>
          ))}
        </Section>
      )}
    </DetailsPanel>
  );
}; 