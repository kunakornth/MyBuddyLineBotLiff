/* eslint-disable react/prop-types */
import React from 'react';
import  { Snackbar, Alert } from '@mui/material';

export function SnackBarShow(props) {
    return (
        <Snackbar open={props.open}  onClose={props.onClose}>
            <Alert onClose={props.onClose} severity={props.severity} sx={{ width: '100%' }}>
                {props.description}
            </Alert>
        </Snackbar>
    );
}
