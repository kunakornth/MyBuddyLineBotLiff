/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Button, Card, CardActions, CardContent, CircularProgress, Container, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import SaveIcon from '@mui/icons-material/Save';
import NextWeekIcon from '@mui/icons-material/NextWeek';
import DateTimePicker from '@mui/lab/DateTimePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { endDateLeave, formatISOString, startDateLeave, } from '@components/utils/Datetime';
import { LocalizationProvider } from '@mui/lab';
import { addWaitingApproveToFirebase, getIdByTierFromFirebase, getLeveTypeFromFirebase, getUserFromFirebase } from '@components/services/FirebaseService';
import { SnackBarShow } from '@components/Snackbar/Snackbar';
import { CallNotiPerson } from '@components/services/LineBotService';
import Router from 'next/router';
import CommonCard from '@common/CommonCard';

export default function Leave(props) {
    const initialState = {
        name: '',
        id: '',
        tier: '',
        fullname: '',
        leavetype: '',
        leavetypeTH: '',
        loadingButton: false,
        startDateTime: startDateLeave,
        endDateTime: endDateLeave,
        description: '',
        annualleaveremain: '',
        sickleaveuse: ''

    };

    // console.log(props)
    const [state, setState] = useState(initialState);
    const [snackSuccess, setSnackSuccess] = React.useState({ open: false, desc: '' });
    const [snackError, setSnackError] = React.useState({ open: false, desc: '' });

    const { api, leaveType } = props;

    useEffect(() => {
        getUser();
    }, []);

    function clearData() {
        setState({
            ...state,
            leavetype: '',
            description: '',
            startDateTime: startDateLeave,
            endDateTime: endDateLeave,
            loadingButton: false
        });
    }

    async function getUser() {
        const liff = (await import('@line/liff')).default;
        await liff.ready;
        const profile = await liff.getProfile();

        let data = await getUserFromFirebase(profile.userId);

        // let data = await getUserFromFirebase('Ud1beca7a0463576dcd7afe8d6576d423');

        setState({
            ...state,
            name: data.name,
            id: data.id,
            tier: data.tier,
            fullname: data.fullname,
            annualleaveremain: data.annualleaveremain,
            sickleaveuse: data.sickleaveuse
        });



    }


    async function actionLeaveButton() {
        setState({ ...state, loadingButton: true });
        let validate = ValidateLeave();
        if (validate.bool) {

            let PostData = await addWaitingApproveToFirebase('Leave', state.leavetype, state.id, state.name, state.startDateTime, state.endDateTime, state.description, state.tier);

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
            await setSnackError({ ...snackError, open: true, desc: validate.desc });
            setState({ ...state, loadingButton: false });
        }


    }

    function selectionType() {

        return (
            <Container fixed>
                <Box sx={{ minHeight: '100vh' }} >
                    <Stack spacing={3}>
                        {leaveType.map((value, index) => {
                            return (
                                <Card sx={{ bgcolor: '#fff' }} key={index + value} >
                                    <CardContent >
                                        <Typography color="textSecondary" gutterBottom>
                                            {value.eng + ' (' + value.th + ')'}
                                        </Typography>
                                        <Divider />
                                        {value.desc}
                                        {ruleOfLeave(value.eng)}

                                    </CardContent>
                                    <CardActions style={{ alignItems: 'center', justifyContent: 'center' }}  >
                                        {
                                            state.loadingButton ? <Button variant="outlined" size="medium" startIcon={<CircularProgress size={20} />} disabled >เลือกประเภทนี้</Button>
                                                :
                                                <Button variant="outlined" size="medium" startIcon={<NextWeekIcon />} onClick={() => setState({ ...state, leavetype: value.eng, leavetypeTH: value.th })}>เลือกประเภทนี้</Button>
                                        }
                                    </CardActions>
                                </Card>
                            );
                        })}
                        <Card sx={{ bgcolor: '#fff' }}  >
                            <CardContent >
                                <Typography color="textSecondary" gutterBottom>
                                    Cancel Leave ( ยกเลิกลา  )
                                </Typography>
                                <Divider />


                            </CardContent>
                            <CardActions style={{ alignItems: 'center', justifyContent: 'center' }}  >
                                {
                                    state.loadingButton ? <Button variant="outlined" size="medium" startIcon={<CircularProgress size={20} />} disabled >เลือกประเภทนี้</Button>
                                        :
                                        <Button variant="outlined" size="medium" startIcon={<NextWeekIcon />} onClick={() => Router.push('/leave/cancelleave')}>เลือกประเภทนี้</Button>
                                }
                            </CardActions>
                        </Card>
                    </Stack>
                </Box>
            </Container>
        );
    }
    function ruleOfLeave(leavetype) {
        if (leavetype === 'Annual Leave') {
            return (
                <Typography color="red" gutterBottom>
                    {'จำนวนเวลาที่เหลืออยู่ ' + state.annualleaveremain + ' ชั่วโมง ( ' + (Math.floor(state.annualleaveremain / 8)) + ' วัน ' + (state.annualleaveremain % 8) + ' ชั่วโมง ) '}
                </Typography>
            );
        }
        else if (leavetype === 'Sick Leave') {
            return (
                <Typography color="red" gutterBottom>
                    {'จำนวนชั่วโมงลาที่ใช้ไป ' + state.sickleaveuse + ' ชั่วโมง ( ' + (Math.floor(state.sickleaveuse / 8)) + ' วัน ' + (state.sickleaveuse % 8) + ' ชั่วโมง ) '}
                </Typography>
            );
        }
    }
    function ValidateLeave() {
        let bool = false;
        let desc = '';
        let start = formatISOString(state.startDateTime);
        let startyear = start.substring(0, 4);
        let startmonth = start.substring(5, 7);
        let startday = start.substring(8, 10);
        let starthour = start.substring(11, 13);
        let startmin = start.substring(14, 16);

        let end = formatISOString(state.endDateTime);

        let endyear = end.substring(0, 4);
        let endmonth = end.substring(5, 7);
        let endday = end.substring(8, 10);
        let endhour = end.substring(11, 13);
        let endmin = end.substring(14, 16);
        if (startmin === '00' || startmin === '30') {
            bool = true;
        }
        else {
            desc = 'Start minute failed';
            let list = {
                bool: false,
                desc: desc
            };
            return list;
        }

        if (starthour === '09' || starthour === '10' || starthour === '11' || starthour === '12' || starthour === '13' || starthour === '14' || starthour === '15' || starthour === '16' || starthour === '17' || starthour === '18') {
            bool = true;
        }
        else {
            bool = false;
            desc = 'Start hour failed';
            let list = {
                bool: false,
                desc: desc
            };
            return list;
        }

        if (endmin === '00' || endmin === '30') {
            bool = true;
        }
        else {

            bool = false;
            desc = 'End minute failed';
            let list = {
                bool: false,
                desc: desc
            };
            return list;
        }
        if (endhour === '09' || endhour === '10' || endhour === '11' || endhour === '12' || endhour === '13' || endhour === '14' || endhour === '15' || endhour === '16' || endhour === '17' || endhour === '18') {
            bool = true;
        }
        else {
            bool = false;
            desc = 'End hour failed';
            let list = {
                bool: false,
                desc: desc
            };
            return list;
        }

        const startDate = startyear + startmonth + startday + starthour + startmin + '';
        const endDate = endyear + endmonth + endday + endhour + endmin + '';

        if (parseInt(startDate) < parseInt(endDate)) {
            bool = true;
        }
        else {
            bool = false;
            desc = 'Please choose new end date.';
            let list = {
                bool: false,
                desc: desc
            };
            return list;
        }

        if (parseInt(endDate) - parseInt(startDate) > 70) {
            bool = true;
        }
        else {
            bool = false;
            desc = 'Please choose new end time more 30 minute';
            let list = {
                bool: false,
                desc: desc
            };
            return list;
        }
        let list = {
            bool: bool,
            desc: desc
        };

        return list;

    }
    function addLeave() {
        return (
            <Box sx={{ minHeight: '100vh' }}>
                <Card >
                    <CardContent >
                        <Typography color="textSecondary" gutterBottom>
                            {state.leavetype + ' (' + state.leavetypeTH + ')'}
                        </Typography>

                        <Divider />
                        <Stack spacing={3}>
                            <TextField
                                sx={{ marginTop: '20px' }}
                                id="description"
                                label="เหตุผลของการลา"
                                value={state.description}
                                onChange={(e) => { setState({ ...state, description: e.target.value }); }}
                            />
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateTimePicker
                                    ampm={false}
                                    minutesStep={30}
                                    minDate={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 3, 0, 0)}
                                    minTime={new Date(0, 0, 0, 9, 30)}
                                    maxTime={new Date(0, 0, 0, 18, 30)}
                                    label="วันเวลาเริ่มต้นของการลา"
                                    value={state.startDateTime}
                                    onChange={(e) => {
                                        setState({ ...state, startDateTime: e, endDateTime: new Date(e.getFullYear(), e.getMonth(), e.getDate(), 18, 30) });
                                    }}
                                    renderInput={(params) => <TextField {...params} />}
                                />

                                <DateTimePicker
                                    ampm={false}
                                    minutesStep={30}
                                    minDate={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 3, 0, 0)}
                                    minTime={new Date(0, 0, 0, 9, 30)}
                                    maxTime={new Date(0, 0, 0, 18, 30)}
                                    label="วันเวลาสิ้นสุดของการลา"
                                    value={state.endDateTime}
                                    onChange={(e) => { setState({ ...state, endDateTime: e }); }}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                        </Stack>
                        {ruleOfLeave(state.leavetype)}
                    </CardContent>
                    <CardActions style={{ alignItems: 'center', justifyContent: 'center' }}  >
                        <Button variant="outlined" size="medium" onClick={() => setState({ ...state, leavetype: '', leavetypeTH: '' })}>ย้อนกลับ</Button>
                        {
                            state.loadingButton ? <Button variant="outlined" size="medium" startIcon={<CircularProgress size={20} />} disabled >Add Leave Request</Button>
                                :
                                <Button variant="outlined" size="medium" startIcon={<SaveIcon />} onClick={() => actionLeaveButton()}>Add Leave Request</Button>
                        }
                    </CardActions>
                </Card>
            </Box>


        );


    }

    return (
        <Grid sx={{ bgcolor: 'rgb(240, 242, 245)' }}  >
            <Box  >
                {
                    state.tier === 'head' || state.tier === 'normalplus' || state.tier === 'leader' || state.tier === 'normal' || state.tier === 'admin' ?
                        state.leavetype !== '' ? addLeave()
                            :
                            selectionType()
                        : <Box sx={{ minHeight: '100vh' }} />



                }
                <SnackBarShow open={snackSuccess.open} onClose={() => setSnackSuccess({ ...snackSuccess, open: false })} severity="success" description={snackSuccess.desc} />
                <SnackBarShow open={snackError.open} onClose={() => setSnackError({ ...snackError, open: false })} severity="error" description={snackError.desc} />
            </Box>

        </Grid>

    );
}


export async function getStaticProps() {
    let GetData = await getLeveTypeFromFirebase();

    return {
        props: {
            leaveType: GetData,
            api: process.env.LINEBOTSERVER,
        }
    };
}
