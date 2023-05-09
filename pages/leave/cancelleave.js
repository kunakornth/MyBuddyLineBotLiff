/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Box, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Stack, TextField, Typography } from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import React, { useEffect, useState } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { convertMonth2Mohth3, date, formatThString } from '@components/utils/Datetime';
import { addWaitingApproveToFirebase, getCalendarByFromFirebase, getHolidayByYearFromFirebase, getIdByTierFromFirebase, getLeveTypeFromFirebase, getSettingFromFirebase, getUserFromFirebase, getWaitingApproveByTierListFromFirebase } from '@components/services/FirebaseService';
import { deleteDateInCalendar, SearchCalendarFromName } from '@components/services/CalendarService';
import { CallNotiPerson } from '@components/services/LineBotService';
import CommonCard from '@common/CommonCard';
const locales = {
    'en-US': enUS,
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function CalendarPage(props) {
    const initialState = {
        name: '',
        id: '',
        tier: '',
    };
    const initialDialog = {
        title: '',
        description: '',
        location: '',
        start: '',
        end: '',
        type: '',
        allday: false

    };
    const [open, setOpen] = useState(false);
    const [stateDialog, setStateDialog] = useState(initialDialog);
    const [state, setState] = useState(initialState);
    const [data, setData] = useState([]);
    const [waiting, setWaiting] = useState([]);
    const [loadingButton, setLoadingButton] = useState(false);
    const { leavetype,api } = props;
    useEffect(() => {
        getUser();
    }, []);

    const handleClickOpen = (e) => {
        setStateDialog({
            ...stateDialog,
            title: e.title,
            description: e.description,
            location: e.location,
            start: e.start,

            end: e.end,
            type: e.type,
            allday: e.allDay

        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    async function handleCancelLeave() {
        setLoadingButton(true);
        let actionStartDate = new Date(stateDialog.start);
        let actionEndDate = new Date(stateDialog.end);
        let check = true;
        waiting.map(data => {
            let waitingStartDate = new Date(data.startdatetime);
            let waitingEndDate = new Date(data.enddatetime);
            if (actionStartDate.getDate() === waitingStartDate.getDate() && actionEndDate.getDate() === waitingEndDate.getDate() && actionStartDate.getMonth() === waitingStartDate.getMonth() && actionEndDate.getMonth() === waitingEndDate.getMonth()) {
                check = true;
            }
        });
        // console.log(leavetype,stateDialog.title);
        const type = stateDialog.title.split(' ');
        let leaveEng;
        leavetype.map(leave => {
            if (type[2] === leave.th) {
                console.log(leave);
                leaveEng = leave.eng;
            }
        });
        if (check) {
            let PostData = await addWaitingApproveToFirebase('CancelLeave', leaveEng, state.id, state.name, stateDialog.start, stateDialog.end, 'CancelLeave', state.tier);
            if (state.tier === 'normal') {
                let dataName = await getIdByTierFromFirebase('leader');
                dataName.forEach(async id => {
                    await CallNotiPerson(api,id, 'มีคำขอร้อง Approve สามารถเข้าไป Approve ได้ที่ https://mybuddylineliff.herokuapp.com/approve  ในหมวด Approve','New');
                });
            }
            else if (state.tier === 'leader' || state.tier === 'normalplus') {
                let dataName = await getIdByTierFromFirebase('head');
                dataName.forEach(async id => {
                    await CallNotiPerson(api,id, 'มีคำขอร้อง Approve สามารถเข้าไป Approve ได้ที่ https://mybuddylineliff.herokuapp.com/approve  ในหมวด Approve','New');
                });
            }
        }
        else {
            alert('คุณส่งคำร้องขอแล้ว');
        }


        setOpen(false);
        setLoadingButton(false);
    }



    async function getUser() {
        const liff = (await import('@line/liff')).default;
        await liff.ready;
        const profile = await liff.getProfile();
        let userdata =await getUserFromFirebase(profile.userId);

        // let userdata = await getUserFromFirebase('Ud1beca7a0463576dcd7afe8d6576d423');
        let waitingAproove = await getWaitingApproveByTierListFromFirebase([userdata.tier], userdata.name);
        let daylist = await SearchCalendarFromName(userdata.name);
        let list =[];
        daylist.map(val => {
            let type = val.title.substring(val.title.indexOf('(')+2, val.title.indexOf(' )'));
            if (type !== 'OT') {
                list.push(val);
            }
        });
        setData(list);

        setWaiting(waitingAproove);
        setState({
            ...state,
            name: userdata.name,
            id: userdata.id,
            tier: userdata.tier,
        });
        // });
    }


    function DailogShow() {
        return (
            <Dialog
                maxWidth={'xl'}
                open={open}
                onClose={handleClose}
                fullWidth
            >
                <DialogTitle id="alert-dialog-title">
                    {stateDialog.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Stack spacing={5}>
                            <TextField
                                multiline
                                sx={{ marginTop: '20px' }}
                                disabled
                                id="outlined-required"

                                label="หมวด"
                                value={stateDialog.type}
                            />
                            {stateDialog.type === 'Holidays' || stateDialog.type === 'Leave' ?
                                <></>
                                :
                                <>
                                    <TextField
                                        multiline
                                        sx={{ marginTop: '20px' }}
                                        disabled
                                        id="outlined-required"
                                        label="สถานที่"
                                        value={stateDialog.location}
                                    />
                                    <TextField
                                        multiline
                                        sx={{ marginTop: '20px' }}
                                        disabled
                                        id="outlined-required"
                                        label="รายละเอียด"
                                        value={stateDialog.description}
                                    />
                                </>
                            }


                            <TextField
                                multiline
                                sx={{ marginTop: '20px' }}
                                disabled
                                id="outlined-required"
                                label="เวลาเริ่ม"
                                value={formatThString(stateDialog.start)}
                            />
                            <TextField
                                multiline
                                sx={{ marginTop: '20px' }}
                                disabled
                                id="outlined-required"
                                label="เวลาจบ"
                                value={formatThString(stateDialog.end)}
                            />

                        </Stack>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={handleClose}>Close</Button>
                    {
                        loadingButton ?
                            <Button variant="outlined" color="error" size="medium" startIcon={<CircularProgress color='error' size={20} />} disabled >Cancel Leave</Button>
                            :
                            <Button variant="outlined" color="error" onClick={() => handleCancelLeave()}>Cancel Leave</Button>
                    }
                </DialogActions>

            </Dialog>
        );
    }


    function fullCalendar() {
        return (
            <Calendar
                popup
                onSelectEvent={e => handleClickOpen(e)}
                views={['month', 'agenda']}
                localizer={localizer}
                events={data}
                startAccessor="start"
                endAccessor="end"

            />
        );
    }
    return (
        <Grid sx={{ bgcolor: 'rgb(240, 242, 245)' }}  >
            {
                state.tier === 'head' || state.tier === 'normalplus' || state.tier === 'leader' || state.tier === 'normal' || state.tier === 'admin' ?
                    <Box sx={{ height: '100vh' }} >
                        {fullCalendar()}
                        {DailogShow()}
                    </Box>
                    :
                    <Box sx={{ minHeight: '100vh' }} >
                        <CommonCard title={'Register'} path={'/register/request'} buttonName={'Register'}  />
                    </Box>
            }

        </Grid>
    );
}
export async function getStaticProps() {
    let GetData = await getLeveTypeFromFirebase();
    return {
        props: {
            leavetype: GetData,
            api: process.env.LINEBOTSERVER,
        }
    };
}

