import React from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Facebook, } from '@mui/icons-material';
import MuiNextLink from '@common/MuiNextLink';

import Box from '@mui/material/Box';

const Footer = () => {
    return (
        <Box component="footer" sx={{ py: 5, bgcolor: 'primary.main' }}>
            <Stack
                direction="row"
                justifyContent="center"
                spacing={4}
                sx={{ mb: 5 }}
            >
                <MuiNextLink
                    sx={{ textDecoration: 'none', color: 'common.white' }}
                    href="https://www.facebook.com/hywebthailand"
                    target="hywebthailand"
                    rel="hywebthailand"
                >
                    <Facebook fontSize="large" />
                </MuiNextLink>
                {/* <MuiNextLink
                    sx={{ textDecoration: "none", color: "common.white" }}
                    href="https://YourInstagramLink/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Instagram fontSize="large" />
                </MuiNextLink>
                <MuiNextLink
                    sx={{ textDecoration: "none", color: "common.white" }}
                    href="https://YourTwitterLink/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Twitter fontSize="large" />
                </MuiNextLink> */}
            </Stack>
            <Typography align="center" color="common.white">
                © 2021 - {new Date().getFullYear()}, My Buddy Line Liff
            </Typography>
        </Box>
    );
};

export default Footer;