/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Stack, TextField } from '@mui/material';

import { db, signIn } from '@lib/firebase';
import { firebaseEmail, firebasePassword } from '@constants/firebase';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { formatThString } from '@components/utils/Datetime';
import { getCalendarByFromFirebase, getSettingFromFirebase, getUserFromFirebase } from '@components/services/FirebaseService';
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




    async function getUser() {
        const liff = (await import('@line/liff')).default;
        await liff.ready;
        const profile = await liff.getProfile();
        let userdata =await getUserFromFirebase(profile.userId);
        // let userdata = await getUserFromFirebase('Ud1beca7a0463576dcd7afe8d6576d423');

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
                            {stateDialog.allday ?
                                <TextField
                                    multiline
                                    sx={{ marginTop: '20px' }}
                                    disabled
                                    id="outlined-required"
                                    label="วันเวลา"
                                    value={'ทั้งวัน'}
                                />
                                :
                                <>
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
                                </>
                            }



                        </Stack>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
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
                events={props.data}
                startAccessor="start"
                endAccessor="end"

            />
        );
    }
    return (
        <Grid sx={{ bgcolor: 'rgb(240, 242, 245)' }}  >

            {
                state.tier === 'head' || state.tier === 'normalplus' || state.tier === 'leader' || state.tier === 'normal' || state.tier === 'admin' ?
                    <Box sx={{ height: '100vh', paddingTop: 5 }} >
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
export async function getServerSideProps() {
    let data = [];
    let setting = await getSettingFromFirebase('Calendar');
    let daylist;
    let yearsearh = setting.searchholidayyear;
    let yearsearhforEvent = setting.searchevent;

    let GetData = await signIn(firebaseEmail, firebasePassword).then(async () => {
        const holidaysRef = collection(db, 'Holidays');
        const holidaysQuery = query(holidaysRef, where('year', 'in', yearsearh));
        const holidays = await getDocs(holidaysQuery);
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        holidays.forEach((doc) => {
            
            for (let i = 0; i < months.length; i++) {
                let month = months[i];

                if (doc.data().months !== undefined) {
                    // console.log(doc.id, " => ", doc.data()[month]);
                    for (let l = 0; l < doc.data().months.length; l++) {
                        if (doc.data().months[i].days[l] !== undefined) {
                            let holi = {
                                title: doc.data().months[i].days[l].name + '( Holiday )',
                                start: new Date(doc.data().months[i].days[l].date.seconds * 1000).toISOString(),
                                end: new Date(doc.data().months[i].days[l].date.seconds * 1000).toISOString(),
                                allDay: true,
                                type: 'Holidays',
                            };
                            data.push(holi);
                        }
                    }
                }
            }
        });
        daylist = await getCalendarByFromFirebase(yearsearhforEvent, data);
        
    });

    return {
        props: {
            data: daylist
        }
    };

}
