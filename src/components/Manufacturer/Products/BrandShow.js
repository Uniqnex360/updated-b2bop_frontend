import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function BrandShow({ selectedBrandsProp, onBrandRemove, industryId, selectedCategoryId, isParent }) {
    const theme = useTheme();

    const [selectedBrands, setSelectedBrands] = useState(() => {
        try {
            const savedBrands = localStorage.getItem("dealerBrand");
            return savedBrands ? JSON.parse(savedBrands) : [];
        } catch (error) {
            console.error("Error parsing 'dealerBrand' from localStorage", error);
            return [];
        }
    });

    // Sync state with parent prop when it changes
    useEffect(() => {
        if (Array.isArray(selectedBrandsProp) && selectedBrandsProp.length > 0) {
            setSelectedBrands(selectedBrandsProp);
        }
    }, [selectedBrandsProp]);

    // Clear brands from state and localStorage when industry, category or parent status changes
    useEffect(() => {
        if (industryId || selectedCategoryId || isParent) {
            setSelectedBrands([]);
            localStorage.removeItem('dealerBrand');
        }
    }, [industryId, selectedCategoryId, isParent]);

    // Update localStorage whenever selectedBrands state changes
    useEffect(() => {
        try {
            if (selectedBrands.length === 0) {
                localStorage.removeItem('dealerBrand');
            } else {
                localStorage.setItem('dealerBrand', JSON.stringify(selectedBrands));
            }
        } catch (error) {
            console.error("Error saving to localStorage", error);
        }
    }, [selectedBrands]);

    const handleTagRemove = (idToRemove) => {
        const updatedBrands = selectedBrands.filter(brand => brand.id !== idToRemove);
        setSelectedBrands(updatedBrands);

        if (onBrandRemove) {
            onBrandRemove(updatedBrands);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                padding: theme.spacing(1),
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius,
                minHeight: '40px',
                alignItems: 'center',
                backgroundColor: theme.palette.background.default,
            }}
        >
            {Array.isArray(selectedBrands) && selectedBrands.length > 0 ? (
                selectedBrands.map((brand) => (
                    <Chip
                        key={brand.id}
                        label={brand.name}
                        onDelete={() => handleTagRemove(brand.id)}
                        deleteIcon={<CloseIcon />}
                        size="small"
                        sx={{
                            backgroundColor: theme.palette.grey[200],
                            color: theme.palette.text.primary,
                            '& .MuiChip-deleteIcon': {
                                color: theme.palette.grey[700],
                                '&:hover': {
                                    color: theme.palette.error.main,
                                },
                            },
                        }}
                    />
                ))
            ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No brands selected.
                </Typography>
            )}
        </Box>
    );
}

export default BrandShow;