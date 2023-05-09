/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Autocomplete, Button, Card, CardActions, CardContent, CircularProgress, Checkbox, Container, createFilterOptions, Divider, FormControl, Grid, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, Stack, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { datetime, plusDateTime, startDateLeave, formatISOString } from '@components/utils/Datetime';
import { DateTimePicker, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { AddMeeting, CallNotiMeeting } from '@components/services/MeetingService';
import { addDatatoFirebaseCalendar, addHistoryFirebase, getLocationFromFirebase, getUserFromFirebase, getUserListByTierFromFirebase } from '@components/services/FirebaseService';
import { SnackBarShow } from '@components/Snackbar/Snackbar';
import NextWeekIcon from '@mui/icons-material/NextWeek';
import SaveIcon from '@mui/icons-material/Save';
import CommonCard from '@common/CommonCard';

export default function Meeting(props) {
    const filter = createFilterOptions();
    const initialState = {
        name: '',
        id: '',
        tier: '',
        loadingButton: false,
        title: '',
        startDateTime: new Date(startDateLeave),
        endDateTime: new Date(plusDateTime(startDateLeave, 30)),
        description: '',
        location: '',
        nameCallAPI: '',
        meetingtype: ''
    };
    const [state, setState] = useState(initialState);
    const [location,] = useState(props.locationlist);
    const [value, setValue] = useState(null);
    const [personName, setPersonName] = useState([]);
    const [names,] = useState(props.userlist);
    const [snackSuccess, setSnackSuccess] = React.useState({ open: false, desc: '' });
    const [snackError, setSnackError] = React.useState({ open: false, desc: '' });

    useEffect(() => {
        getUser();

    }, []);

    function clearData() {
        setState({ ...state, title: '', description: '', startDateTime: new Date(startDateLeave), endDateTime: new Date(plusDateTime(startDateLeave, 30)), location: '', loadingButton: false });
        setPersonName([]);
    }

    async function getUser() {
        const liff = (await import('@line/liff')).default;
        await liff.ready;
        const profile = await liff.getProfile();
        let userdata = await getUserFromFirebase(profile.userId);
        // let userdata = await getUserFromFirebase('Ud1beca7a0463576dcd7afe8d6576d423');
        setState({ ...state, id: userdata.id, name: userdata.name, tier: userdata.tier });
    }

    function handleChange(event) {
        if (event.target.value[0] === 'Everyone' || event.target.value[event.target.value.length - 1] === 'Everyone') {
            setPersonName(names);
        }
        else if (event.target.value[event.target.value.length - 1] === 'CancelEveryone') {
            setPersonName([]);
        }
        else {

            setPersonName(event.target.value);
        }

    }
    function ValidateMeeting() {
        let bool = false;
        let desc = '';
        if (state.title !== '') {
            bool = true;
        }
        else {
            let list = {
                bool: false,
                desc: 'กรุณาใส่หัวข้อ Meeting ด้วย'
            };
            return list;
        }

        if (state.description !== '') {
            bool = true;
        }
        else {
            let list = {
                bool: false,
                desc: 'กรุณาใส่รายละเอียด Meeting ด้วย'
            };
            return list;
        }
        if (state.location.title !== undefined || state.location.title !== '') {
            bool = true;
        }
        else {
            let list = {
                bool: false,
                desc: 'กรุณาใส่สถานที่ Meeting ด้วย'
            };
            return list;
        }
        if (personName.length > 0) {
            bool = true;
        }
        else {
            let list = {
                bool: false,
                desc: 'กรุณาเลือกบุคคลที่ต้องการ Meeting ด้วย'
            };
            return list;
        }
        let list = {
            bool: bool,
            desc: desc
        };
        return list;
    }

    async function actionAddMeeting() {
        setState({ ...state, loadingButton: true });
        let validate = ValidateMeeting();

        if (validate.bool) {
            // let resp = await AddMeeting(state.title, state.location.title, state.description, formatISOString(state.startDateTime), formatISOString(state.endDateTime), personName, names.length,'Meeting');


            let data = {
                actionby: state.name,
                createDate: new Date(),
                startDateTime: state.startDateTime,
                endDateTime: state.endDateTime,
                title: state.title,
                location: state.location.title,
                description: state.description,
                person: personName,
            };
            await addHistoryFirebase('Meeting', true, datetime, data);
            let all_person = '';
            if (personName.length === name.length) {
                all_person = 'ทุกคน';
            }
            else {
                for (let i = 0; i < personName.length; i++) {
                    all_person = all_person + personName[i] + ' ';
                }
            }
            let summary = state.title + ' ( ' + all_person + ' )';
            await addDatatoFirebaseCalendar(summary, state.startDateTime, state.endDateTime, state.description, state.location.title,personName,'Meeting');
            await CallNotiMeeting(summary,state.location.title,state.description,state.startdatetime,state.endDateTime, state.name);

            setSnackSuccess({ ...snackSuccess, open: true, desc: 'Meeting เรียบร้อยแล้ว' });
            await clearData();
        }
        else {
            setSnackError({ ...snackError, open: true, desc: validate.desc });
            // alert(validate.desc);
            setState({ ...state, loadingButton: false });
        }

    }
    function selectionMeeting() {
        return (
            <Container fixed>
                <Stack spacing={3}>
                    <Card sx={{ bgcolor: '#fff' }} key={'0' + 'Add Meeting'} >
                        <CardContent >
                            <Typography color="textSecondary" gutterBottom>
                                Add Meeting
                            </Typography>
                            <Divider />
                            นัด Meeting ลง Calendar

                        </CardContent>
                        <CardActions style={{ alignItems: 'center', justifyContent: 'center' }}  >
                            {
                                state.loadingButton ? <Button variant="outlined" size="medium" startIcon={<CircularProgress size={20} />} disabled >เลือกประเภทนี้</Button>
                                    :
                                    <Button variant="outlined" size="medium" startIcon={<NextWeekIcon />} onClick={() => setState({ ...state, meetingtype: 'AddMeeting' })}>เลือกประเภทนี้</Button>
                            }
                        </CardActions>
                    </Card>
                    {/* <Card sx={{ bgcolor: '#fff' }} key={'0' + 'edit Meeting'} >
                        <CardContent >
                            <Typography color="textSecondary" gutterBottom>
                                Edit Meeting
                            </Typography>
                            <Divider />
                            แก้ไข Meeting
                        </CardContent>
                        <CardActions style={{ alignItems: 'center', justifyContent: 'center' }}  >
                            {
                                state.loadingButton ? <Button variant="outlined" size="medium" startIcon={<CircularProgress size={20} />} disabled >เลือกประเภทนี้</Button>
                                    :
                                    <Button variant="outlined" size="medium" startIcon={<NextWeekIcon />} onClick={() => setState({ ...state, meetingtype: 'EditMeeting' })}>เลือกประเภทนี้</Button>
                            }
                        </CardActions>
                    </Card> */}
                    <Card sx={{ bgcolor: '#fff' }} key={'0' + 'Delete Meeting'} >
                        <CardContent >
                            <Typography color="textSecondary" gutterBottom>
                                Delete Meeting
                            </Typography>
                            <Divider />
                            ลบ Meeting

                        </CardContent>
                        <CardActions style={{ alignItems: 'center', justifyContent: 'center' }}  >
                            {
                                state.loadingButton ? <Button variant="outlined" size="medium" startIcon={<CircularProgress size={20} />} disabled >เลือกประเภทนี้</Button>
                                    :
                                    <Button variant="outlined" size="medium" startIcon={<NextWeekIcon />} onClick={() => setState({ ...state, meetingtype: 'DeleteMeeting' })}>เลือกประเภทนี้</Button>
                            }
                        </CardActions>
                    </Card>
                </Stack>
            </Container>
        );
    }



    function meetingForm() {
        if (state.meetingtype === 'AddMeeting') {
            return (
                <Container fixed>
                    <Box sx={{ minHeight: '100vh' }} >
                        <Card >
                            <CardContent >
                                <Typography color="textSecondary" gutterBottom>
                                    Meeting
                                </Typography>
                                <Divider />
                                <Stack spacing={3}>
                                    <TextField
                                        sx={{ marginTop: '20px' }}
                                        id="title"
                                        label="หัวข้อ Meeting"
                                        value={state.title}
                                        onChange={(e) => { setState({ ...state, title: e.target.value }); }}
                                    />
                                    <TextField
                                        sx={{ marginTop: '20px' }}
                                        id="description"
                                        label="รายละเอียด Meeting"
                                        value={state.description}
                                        onChange={(e) => { setState({ ...state, description: e.target.value }); }}
                                    />

                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DateTimePicker
                                            ampm={false}
                                            minutesStep={10}
                                            label="วันเวลาเริ่ม Meeting"
                                            value={state.startDateTime}
                                            onChange={(e) => {
                                                setState({ ...state, startDateTime: e, endDateTime: new Date(plusDateTime(e, 30)) });
                                            }}
                                            renderInput={(params) => <TextField id="startDateTime" {...params} />}
                                        />

                                        <DateTimePicker
                                            ampm={false}
                                            minutesStep={10}
                                            label="วันเวลาที่จบ Meeting"
                                            value={state.endDateTime}
                                            onChange={(e) => { setState({ ...state, endDateTime: e }); }}
                                            renderInput={(params) => <TextField id="endDateTime" {...params} />}
                                        />
                                    </LocalizationProvider>
                                    <Autocomplete
                                        value={state.location}
                                        onChange={(event, newValue) => {
                                            if (typeof newValue === 'string') {
                                                setState({
                                                    ...state, location: {
                                                        title: newValue,
                                                    }
                                                });
                                            } else if (newValue && newValue.inputValue) {
                                                // Create a new value from the user input
                                                setState({
                                                    ...state, location: {
                                                        title: newValue.inputValue,
                                                    }
                                                });
                                                // setValue({
                                                //   title: newValue.inputValue,
                                                // });
                                            } else {
                                                setState({
                                                    ...state, location: newValue,

                                                });
                                                // setValue(newValue);
                                            }
                                        }}
                                        filterOptions={(options, params) => {
                                            const filtered = filter(options, params);

                                            const { inputValue } = params;
                                            // Suggest the creation of a new value
                                            const isExisting = options.some((option) => inputValue === option.title);
                                            if (inputValue !== '' && !isExisting) {
                                                filtered.push({
                                                    inputValue,
                                                    title: `Add "${inputValue}"`,
                                                });
                                            }

                                            return filtered;
                                        }}
                                        selectOnFocus
                                        clearOnBlur
                                        handleHomeEndKeys
                                        id="location"
                                        options={location}
                                        getOptionLabel={(option) => {
                                            // Value selected with enter, right from the input
                                            if (typeof option === 'string') {
                                                return option;
                                            }
                                            // Add "xxx" option created dynamically
                                            if (option.inputValue) {
                                                return option.inputValue;
                                            }
                                            // Regular option
                                            return option.title;
                                        }}
                                        renderOption={(props, option) => <li {...props}>{option.title}</li>}

                                        freeSolo
                                        renderInput={(params) => (
                                            <TextField {...params} label="สถานที่ Meeting" />
                                        )}
                                    />
                                    <FormControl sx={{ m: 1 }}>
                                        <InputLabel id="person">เลือกบุคคลที่ต้องการนัด Meeting</InputLabel>
                                        <Select
                                            labelId="Selectperson"
                                            id="Selectperson"
                                            multiple
                                            value={personName}
                                            onChange={handleChange}
                                            input={<OutlinedInput label="เลือกบุคคลที่ต้องการนัด Meeting" />}
                                            renderValue={(selected) => selected.join(', ')}
                                            MenuProps={props.menuProps}
                                        >
                                            {personName.length === names.length ?
                                                <MenuItem value='CancelEveryone'>
                                                    <em>Cancel Everyone</em>
                                                </MenuItem>
                                                :
                                                <MenuItem value='Everyone'>
                                                    <em>Everyone</em>
                                                </MenuItem>
                                            }

                                            {names.map((name) => (
                                                <MenuItem key={name} value={name}>
                                                    <Checkbox checked={personName.indexOf(name) > -1} />
                                                    <ListItemText primary={name} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                </Stack>

                            </CardContent>
                            <CardActions style={{ alignItems: 'center', justifyContent: 'center' }}  >
                                <Button id="Back" variant="outlined" size="medium" onClick={() => setState({ ...state, meetingtype: '' })}>ย้อนกลับ</Button>

                                {
                                    state.loadingButton ? <Button id="Add" variant="outlined" size="medium" startIcon={<CircularProgress size={20} />} disabled >Add Meeting</Button>
                                        :
                                        <Button id="Add" variant="outlined" size="medium" startIcon={<SaveIcon />} onClick={() => actionAddMeeting()}>Add Meeting</Button>
                                }
                            </CardActions>
                        </Card>
                    </Box>
                </Container>
            );
        }
        else if (state.meetingtype === 'EditMeeting') {
            return (
                <Container fixed>
                    <Box sx={{ height: '100vh' }} >
                        <Card >
                            <CardContent >
                                <Typography color="textSecondary" gutterBottom>
                                    {'Edit Meeting ( แก้ไข Meeting )'}
                                </Typography>
                                <Divider />
                                ตอนนี้ยังไม่สามารถแก้ไขได้
                            </CardContent>
                            <CardActions style={{ alignItems: 'center', justifyContent: 'center' }}  >

                                <Button variant="outlined" size="medium" onClick={() => setState({ ...state, meetingtype: '' })}>ย้อนกลับ</Button>
                                {/* {
              state.loadingButton ? <Button variant="outlined" size="medium" startIcon={<CircularProgress size={20} />} disabled >Add Leave Request</Button>
                :
                <Button variant="outlined" size="medium" startIcon={<SaveIcon />} onClick={() => actionLeaveButton()}>Add Leave Request</Button>
            } */}
                            </CardActions>
                        </Card>
                    </Box>
                </Container>
            );
        }
        else if (state.meetingtype === 'DeleteMeeting') {
            <Container fixed>
                <Box sx={{ height: '100vh' }} >
                    <Card >
                        <CardContent >
                            <Typography color="textSecondary" gutterBottom>
                                {'Delete Meeting ( ลบ Meeting )'}
                            </Typography>
                            <Divider />
                            ตอนนี้ยังไม่สามารถลบได้
                        </CardContent>
                        <CardActions style={{ alignItems: 'center', justifyContent: 'center' }}  >

                            <Button variant="outlined" size="medium" onClick={() => setState({ ...state, meetingtype: '' })}>ย้อนกลับ</Button>
                            {/* {
              state.loadingButton ? <Button variant="outlined" size="medium" startIcon={<CircularProgress size={20} />} disabled >Add Leave Request</Button>
                :
                <Button variant="outlined" size="medium" startIcon={<SaveIcon />} onClick={() => actionLeaveButton()}>Add Leave Request</Button>
            } */}
                        </CardActions>
                    </Card>
                </Box>
            </Container>;
        }

    }


    return (
        <Grid sx={{ bgcolor: 'rgb(240, 242, 245)' }}  >
            {
                state.tier === 'head' || state.tier === 'normalplus' || state.tier === 'leader' || state.tier === 'normal' || state.tier === 'admin' ?
                    <>

                        <Box sx={{ height: '100vh', paddingTop: 5 }} >
                            {/* {meetingForm()} */}
                            {state.meetingtype !== '' ? meetingForm()
                                :
                                selectionMeeting()
                            }
                            <SnackBarShow open={snackSuccess.open} onClose={() => setSnackSuccess({ ...snackSuccess, open: false })} severity="success" description={snackSuccess.desc} />
                            <SnackBarShow open={snackError.open} onClose={() => setSnackError({ ...snackError, open: false })} severity="error" description={snackError.desc} />

                        </Box>
                    </>

                    :
                    <Box sx={{ minHeight: '100vh' }} />
            }
            }
        </Grid>
    );
}

export async function getStaticProps() {
    let tierlist = ['admin', 'head', 'leader', 'normal', 'normalplus'];



    let location = await getLocationFromFirebase();
    let userlist = await getUserListByTierFromFirebase(tierlist);
    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    return {
        props: {
            locationlist: location,
            userlist: userlist,
            itemHeight: ITEM_HEIGHT,
            itemPaddingTop: ITEM_PADDING_TOP,
            menuProps: MenuProps
        }
    };
}
