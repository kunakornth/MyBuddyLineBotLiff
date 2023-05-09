/* eslint-disable react/prop-types */
/* eslint-disable no-undef */

import React from 'react';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../styles/createEmotionCache';
import Footer from '@MainLayout/Footer/Footer';
import Drawer from '@MainLayout/Drawer/PersistentDrawer';

import '/styles/globals.css';
import theme from '../styles/theme';
import { useEffect } from 'react';
import { Container } from '@mui/material';

const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export const navLinks = [
    { title: 'home', path: '/' },
    { title: 'Leave', path: '/leave' },
    { title: 'OT', path: '/ot/request' },
    { title: 'calendar', path: '/calendar' },
    { title: 'Meeting', path: '/meeting' },
    // { title: 'event', path: '/event/request' },
    { title: 'approve', path: '/approve' },
    
];
export default function MyApp(props) {
    useEffect(async () => {
        const liff = (await import('@line/liff')).default;
        try {
            await liff.init({ liffId });
        } catch (error) {
            console.error('liff init error', error.message);
        }
        if (!liff.isLoggedIn()) {
            liff.login();
        }
    });
    const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
    return (
        <CacheProvider value={emotionCache}>
            <Head>
                <title>My Buddy</title>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
            </Head>
            <ThemeProvider theme={theme}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <Drawer navLinks={navLinks}>
                    <Container fixed>
                        <Component {...pageProps} />
                    </Container>
                </Drawer>

                <Footer />
            </ThemeProvider>
        </CacheProvider>
    );
}
