import { addWaitingApproveToFirebase, getIdByTierFromFirebase, getUserFromFirebase } from '@components/services/FirebaseService';
import { Box, Button, Card, CardActions, CardContent, CircularProgress, Container, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { endDateLeave, plusDateTime, } from '@components/utils/Datetime';
import { DateTimePicker, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import NextWeekIcon from '@mui/icons-material/NextWeek';
import SaveIcon from '@mui/icons-material/Save';
import { SnackBarShow } from '@components/Snackbar/Snackbar';
import { CallNotiPerson } from '@components/services/LineBotService';
import Router from 'next/router';
import CommonCard from '@common/CommonCard';

function request(props) {
    const initialUser = {
        name: '',
        id: '',
        tier: '',
        loadingButton: false,
        ottype: '',
        title: '',
        description: '',
        startDateTime: new Date(endDateLeave),
        endDateTime: new Date(plusDateTime(endDateLeave, 60)),

    };
    const [state, setState] = useState(initialUser);
    const [snackSuccess, setSnackSuccess] = useState({ open: false, desc: '' });
    const [snackError, setSnackError] = useState({ open: false, desc: '' });
    const { api } = props;
    useEffect(() => {
        getUser();

    }, []);

    async function getUser() {
        const liff = (await import('@line/liff')).default;
        await liff.ready;
        const profile = await liff.getProfile();

        let userdata = await getUserFromFirebase(profile.userId);
        // let userdata = await getUserFromFirebase('Ud1beca7a0463576dcd7afe8d6576d423');

        setState({ ...state, id: userdata.id, name: userdata.name, tier: userdata.tier });


    }

    function clearData() {
        setState({ ...state, title: '', description: '', startDateTime: new Date(endDateLeave), endDateTime: new Date(plusDateTime(endDateLeave, 60)), location: '', loadingButton: false });
    }

    function selectionOT() {
        return (
            <Stack spacing={3}>
                <Card sx={{ bgcolor: '#fff' }} key={'0' + 'Add OT'} >
                    <CardContent >
                        <Typography color="textSecondary" gutterBottom>
                            Add OT
                        </Typography>
                        <Divider />
                        ลงรายการ OT

                    </CardContent>
                    <CardActions style={{ alignItems: 'center', justifyContent: 'center' }}  >
                        {
                            state.loadingButton ? <Button variant="outlined" size="medium" startIcon={<CircularProgress size={20} />} disabled >เลือกประเภทนี้</Button>
                                :
                                <Button variant="outlined" size="medium" startIcon={<NextWeekIcon />} onClick={() => setState({ ...state, ottype: 'Add OT' })}>เลือกประเภทนี้</Button>
                        }
                    </CardActions>
                </Card>
                <Card sx={{ bgcolor: '#fff' }} key={'0' + 'Delete Meeting'} >
                    <CardContent >
                        <Typography color="textSecondary" gutterBottom>
                            Delete OT
                        </Typography>
                        <Divider />
                        ลบ โอที

                    </CardContent>
                    <CardActions style={{ alignItems: 'center', justifyContent: 'center' }}  >
                        {
                            state.loadingButton ? <Button variant="outlined" size="medium" startIcon={<CircularProgress size={20} />} disabled >เลือกประเภทนี้</Button>
                                :
                                <Button variant="outlined" size="medium" startIcon={<NextWeekIcon />} onClick={() => Router.push('/ot/cancelot')}>เลือกประเภทนี้</Button>
                        }
                    </CardActions>
                </Card>
            </Stack>
        );
    }
    function showInput() {
        if (state.ottype === 'Add OT') {
            return (
                <Card >
                    <CardContent >
                        <Typography color="textSecondary" gutterBottom>
                            OT
                        </Typography>
                        <Divider />
                        <Stack spacing={3}>
                            <TextField
                                required
                                sx={{ marginTop: '20px' }}
                                id="title"
                                label="ชื่อโปรเจค OT"
                                value={state.title}
                                onChange={(e) => { setState({ ...state, title: e.target.value }); }}
                            />
                            <TextField
                                required
                                id="description"
                                label="รายละเอียด OT"
                                value={state.description}
                                onChange={(e) => { setState({ ...state, description: e.target.value }); }}
                            />
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateTimePicker
                                    ampm={false}
                                    minutesStep={30}
                                    label="วันเวลาเริ่ม OT"
                                    value={state.startDateTime}

                                    onChange={(e) => {
                                        setState({ ...state, startDateTime: e, endDateTime: new Date(plusDateTime(e, 60)) });
                                    }}
                                    renderInput={(params) => <TextField required id="startDateTime" {...params} />}
                                />

                                <DateTimePicker
                                    ampm={false}
                                    minutesStep={30}
                                    label="วันเวลาที่จบ OT"
                                    value={state.endDateTime}
                                    onChange={(e) => { setState({ ...state, endDateTime: e }); }}
                                    renderInput={(params) => <TextField required id="endDateTime" {...params} />}
                                />
                            </LocalizationProvider>
                        </Stack>
                    </CardContent>
                    <CardActions style={{ alignItems: 'center', justifyContent: 'center' }}  >
                        <Button id="Back" variant="outlined" size="medium" onClick={() => setState({ ...state, ottype: '' })}>ย้อนกลับ</Button>

                        {
                            state.loadingButton ? <Button id="Add" variant="outlined" size="medium" startIcon={<CircularProgress size={20} />} disabled >Add OT</Button>
                                :
                                <Button id="Add" variant="outlined" size="medium" startIcon={<SaveIcon />} onClick={() => actionAddOT()}>Add OT</Button>
                        }
                    </CardActions>
                </Card>

            );
        }
        return (
            <Box />
        );
    }

    async function actionAddOT() {
        setState({ ...state, loadingButton: true });
        let validate = ValidateOT();

        if (validate.bool) {
            // let resp = await AddMeeting(state.title, state.location.title, state.description, formatISOString(state.startDateTime), formatISOString(state.endDateTime), personName, names.length);
            let PostData = await addWaitingApproveToFirebase('Add OT', state.ottype, state.id, state.name, state.startDateTime, state.endDateTime, `${state.title} - ${state.description}`, state.tier);

            if (state.tier === 'normal') {
                let data = await getIdByTierFromFirebase('leader');
                data.forEach(async id => {
                    await CallNotiPerson(api, id, 'มีคำขอร้อง Approve สามารถเข้าไป Approve ได้ที่ https://mybuddylineliff.herokuapp.com/approve  ในหมวด Approve', 'New');
                });

            }
            else if (state.tier === 'leader' || state.tier === 'normalplus') {
                let data = await getIdByTierFromFirebase('head');
                data.forEach(async id => {
                    await CallNotiPerson(api, id, 'มีคำขอร้อง Approve สามารถเข้าไป Approve ได้ที่ https://mybuddylineliff.herokuapp.com/approve  ในหมวด Approve', 'New');
                });

            }
            await setSnackSuccess({ ...snackSuccess, open: true, desc: PostData });
            await clearData();
        }
        else {
            setSnackError({ ...snackError, open: true, desc: validate.desc });
            // alert(validate.desc);
            setState({ ...state, loadingButton: false });
        }

    }

    function ValidateOT() {
        let bool = false;
        let desc = '';
        if (state.title !== '') {
            bool = true;
        }
        else {
            let list = {
                bool: false,
                desc: 'กรุณาใส่ชื่อโปรเจค OT ด้วย'
            };
            return list;
        }

        if (state.description !== '') {
            bool = true;
        }
        else {
            let list = {
                bool: false,
                desc: 'กรุณาใส่รายละเอียด OT ด้วย'
            };
            return list;
        }
        if (state.startDateTime.getMinutes() === 30 && state.endDateTime.getMinutes() === 0) {
            let list = {
                bool: false,
                desc: 'เวลาห้ามมีเศษครึ่งชั่วโมง'
            };
            return list;
        }
        else if (state.startDateTime.getMinutes() === 0 && state.endDateTime.getMinutes() === 30) {
            let list = {
                bool: false,
                desc: 'เวลาห้ามมีเศษครึ่งชั่วโมง'
            };
            return list;
        }

        let list = {
            bool: bool,
            desc: desc
        };
        return list;
    }

    return (
        <Grid  >
            {
                state.tier === 'head' || state.tier === 'normalplus' || state.tier === 'leader' || state.tier === 'normal' || state.tier === 'admin' ?
                    <Box sx={{ minHeight: '100vh', paddingTop: 5 }} >
                        <Container fixed>
                            {state.ottype !== '' ? showInput() : selectionOT()}
                        </Container>
                    </Box>
                    :

                    <Box sx={{ minHeight: '100vh' }} >
                        <CommonCard title={'Register'} path={'/register/request'} buttonName={'Register'}  />
                    </Box>
            }
            <SnackBarShow open={snackSuccess.open} onClose={() => setSnackSuccess({ ...snackSuccess, open: false })} severity="success" description={snackSuccess.desc} />
            <SnackBarShow open={snackError.open} onClose={() => setSnackError({ ...snackError, open: false })} severity="error" description={snackError.desc} />
        </Grid>
    );
}

export default request;

export async function getStaticProps() {

    return {
        props: {
            api: process.env.LINEBOTSERVER,
        }
    };
}
