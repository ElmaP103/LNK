import React, { useState, useCallback } from 'react';
import { TextField, Autocomplete } from '@mui/material';
import styled from 'styled-components';
import SearchIcon from '@mui/icons-material/Search';
import type { SearchResult } from '../../../../types/global';

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 16px;
  gap: 8px;
  @media (max-width: 768px) {
    padding: 8px;
  }
`;

interface SearchBarProps {
  onSearch: (query: string) => void;
  results: SearchResult[];
  onResultSelect: (result: SearchResult) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  results,
  onResultSelect,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = useCallback((event: React.SyntheticEvent, value: string) => {
    setInputValue(value);
    onSearch(value);
  }, [onSearch]);

  const handleChange = useCallback((event: React.SyntheticEvent, value: SearchResult | null) => {
    if (value) {
      onResultSelect(value);
      setInputValue('');
    }
  }, [onResultSelect]);

  return (
    <SearchContainer>
      <SearchIcon color="action" />
      <Autocomplete<SearchResult>
        options={results}
        getOptionLabel={(option) => 
          typeof option === 'string' ? option : option.label
        }
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={handleChange}
        sx={{
          width: '100%',
          '& .MuiOutlinedInput-root': {
            padding: '0 8px',
            '@media (max-width: 768px)': {
              padding: '0 4px',
            },
          },
          '& .MuiInputBase-input': {
            padding: '8px 8px 8px 0',
            '@media (max-width: 768px)': {
              padding: '6px 6px 6px 0',
              fontSize: '14px',
            },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search researchers, publications, or organizations..."
            variant="standard"
            fullWidth
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 500 }}>{option.label}</span>
              <span style={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                {option.type}
              </span>
            </div>
          </li>
        )}
      />
    </SearchContainer>
  );
}; 