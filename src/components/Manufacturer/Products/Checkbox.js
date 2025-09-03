import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Divider
} from '@mui/material';

function Checkbox({ open, handleClose, selectedItems, handleBulkEditSubmit, handlePriceChange, editedPrices, paginatedItems }) {
    const itemsToEdit = paginatedItems.filter(item => selectedItems.includes(item.id));

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    Bulk Edit Prices
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Update the prices for the selected items below.
                </Typography>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2 }}>
                {itemsToEdit.length > 0 ? (
                    itemsToEdit.map(item => (
                        <Box key={item.id} sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {item.name}
                            </Typography>
                            <TextField
                                fullWidth
                                label="New Price"
                                type="number"
                                variant="outlined"
                                value={editedPrices[item.id] || item.price}
                                onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>
                                    ),
                                }}
                            />
                        </Box>
                    ))
                ) : (
                    <Typography variant="body1" align="center" color="text.secondary" sx={{ py: 4 }}>
                        No items selected for bulk editing.
                    </Typography>
                )}
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} color="primary" variant="outlined">
                    Cancel
                </Button>
                <Button onClick={handleBulkEditSubmit} color="primary" variant="contained" disabled={itemsToEdit.length === 0}>
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default Checkbox;