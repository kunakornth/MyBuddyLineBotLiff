/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Button, Card, CardActions, CardContent, CircularProgress, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import SaveIcon from '@mui/icons-material/Save';
import { endDateLeave, startDateLeave, } from '@components/utils/Datetime';
import { addWaitingApproveRegisterToFirebase, getLeveTypeFromFirebase } from '@components/services/FirebaseService';
import { SnackBarShow } from '@components/Snackbar/Snackbar';
import { CallNotiPerson } from '@components/services/LineBotService';

export default function Register(props) {
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

    const { api } = props;

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
        setState({
            ...state,
            id: profile.userId,
        });
    }


    async function actionRegisterButton() {
        setState({ ...state, loadingButton: true });
        let validate = ValidateLeave();
        if (validate.bool) {

            let PostData = await addWaitingApproveRegisterToFirebase('Register', 'Register', state.id, state.name, state.fullname);

            await CallNotiPerson(api, 'U70c4320b27320cbac04c5b8c85412622', 'มีคำขอร้อง Approve สามารถเข้าไป Approve ได้ที่ https://mybuddylineliff.herokuapp.com/approve  ในหมวด Approve', 'New');

            await setSnackSuccess({ ...snackSuccess, open: true, desc: PostData });
            await clearData();
        }
        else {
            await setSnackError({ ...snackError, open: true, desc: validate.desc });
            setState({ ...state, loadingButton: false });
        }


    }

    function ValidateLeave() {
        let bool = false;
        let desc = '';


        if (state.fullname !== '') {
            bool = true;
        }
        else {
            bool = false;
            desc = 'Please input fullname.';
            let list = {
                bool: false,
                desc: desc
            };
            return list;
        }
        if (state.name !== '') {
            bool = true;
        }
        else {
            bool = false;
            desc = 'Please input nickname.';
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
    function addRegister() {
        return (
            <Box sx={{ minHeight: '100vh' }}>
                <Card >
                    <CardContent >
                        <Typography color="textSecondary" gutterBottom>
                            {'Register ( ลงทะเบียน )'}
                        </Typography>

                        <Divider />
                        <Stack spacing={3}>
                            <TextField
                                sx={{ marginTop: '20px' }}
                                id="nickname ( ภาษาอังกฤษ )"
                                label="ชื่อเล่น"
                                value={state.name}
                                onChange={(e) => { setState({ ...state, name: e.target.value }); }}
                            />

                            <TextField
                                sx={{ marginTop: '20px' }}
                                id="fullname"
                                label="ชื่อ-นามสกุล ( ภาษาอังกฤษ )"
                                value={state.fullname}
                                onChange={(e) => { setState({ ...state, fullname: e.target.value }); }}
                            />

                        </Stack>
                    </CardContent>
                    <CardActions style={{ alignItems: 'center', justifyContent: 'center' }}  >
                        <Button variant="outlined" size="medium" onClick={() => setState({ ...state, name: '', fullname: '' })}>Clear Data</Button>
                        {
                            state.loadingButton ? <Button variant="outlined" size="medium" startIcon={<CircularProgress size={20} />} disabled >Add Register Request</Button>
                                :
                                <Button variant="outlined" size="medium" startIcon={<SaveIcon />} onClick={() => actionRegisterButton()}>Add Register Request</Button>
                        }
                    </CardActions>
                </Card>
            </Box>


        );


    }

    return (
        <Grid sx={{ bgcolor: 'rgb(240, 242, 245)' }}  >
            <Box  >
                {addRegister()}
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
