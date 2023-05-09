import * as React from 'react';
import { Grid, Stack } from '@mui/material';
import { Box } from '@mui/system';
import { getUserFromFirebase, getWaitingApproveByTierListFromFirebase } from '@components/services/FirebaseService';
import CommonCard from '@common/CommonCard';

export default function FixedContainer() {

    const initialUser = {
        name: '',
        id: '',
        tier: '',
        waitingApproveSize: 0,
        loadingButton: false,
        ApproveSize: 0,


    };
    const [user, setUser] = React.useState(initialUser);


    React.useEffect(() => {
        getUser();

    }, []);

    async function getUser() {
        const liff = (await import('@line/liff')).default;
        await liff.ready;
        const profile = await liff.getProfile();

        let userdata = await getUserFromFirebase(profile.userId);
        // let userdata = await getUserFromFirebase('Ud1beca7a0463576dcd7afe8d6576d423');
        let waitingAproove = await getWaitingApproveByTierListFromFirebase([userdata.tier], userdata.name);
        let waiting = [];
        waitingAproove.map(event => {
            if (event.name === userdata.name) {
                waiting.push(event);
            }
        });
        let Aproove = [];
        if (userdata.tier === 'head') {
            Aproove = await getWaitingApproveByTierListFromFirebase([userdata.tier, 'leader', 'normalplus'], userdata.name);
        }
        else if (userdata.tier === 'leader') {
            Aproove = await getWaitingApproveByTierListFromFirebase(['normal'], userdata.name);
        }
        else if (userdata.tier === 'admin') {
            Aproove = await getWaitingApproveByTierListFromFirebase(['admin', 'head', 'leader', 'normalplus', 'normal'], userdata.name);
        }
        else if (userdata.tier === 'normalplus') {
            Aproove = await getWaitingApproveByTierListFromFirebase(['new'], userdata.name);
        }
        // console.log(waitingAproove);
        setUser({ ...user, id: userdata.id, name: userdata.name, tier: userdata.tier, waitingApproveSize: waiting.length, ApproveSize: Aproove.length });

    }


    function showList() {
        return (
            <Stack spacing={3}>
                <CommonCard title={'Waiting Approve'} path={'/approve/waitingapprove'} buttonName={'Waiting Approve'} description={user.waitingApproveSize === 0 ? 'คุณไม่มีคำร้องขอเหลืออยู่' : `คุณยังมีคำร้องขออยู่ ${user.waitingApproveSize} รายการ`} />

                {
                    user.tier === 'leader' || user.tier === 'head' || user.tier === 'admin' || user.tier === 'normalplus' ?
                        <CommonCard title={'Approve'} path={'/approve'} buttonName={'Approve'} description={user.ApproveSize === 0 ? 'คุณไม่มีคำร้องขอเหลืออยู่' : `คุณยังมีคำร้องขออยู่ ${user.ApproveSize} รายการ`} />

                        : <Box />
                }
                <CommonCard title={'Calendar'} path={'/calendar'} buttonName={'calendar'} />
                <CommonCard title={'Leave'} path={'/leave'} buttonName={'leave'} />
                <CommonCard title={'OT'} path={'/ot/request'} buttonName={'ot'} />
                <CommonCard title={'Meeting'} path={'/meeting'} buttonName={'meeting'} />
                <CommonCard title={'Event'} path={'/event/request'} buttonName={'event'}  />

            </Stack >
        );
    }


    return (
        <Grid  >
            {
                user.tier === 'head' || user.tier === 'normalplus' || user.tier === 'leader' || user.tier === 'normal' || user.tier === 'admin' ?
                    <>
                        <Box sx={{ minHeight: '100vh', paddingTop: 5 }} >
                            {showList()}
                        </Box>
                    </>
                    :
                    <Box sx={{ minHeight: '100vh' }} >
                        <CommonCard title={'Register'} path={'/register/request'} buttonName={'Register'} />
                    </Box>
            }
            
        </Grid>
    );
}

