import React from 'react';
import { Box } from '@mui/system';
import { Button, Card, CardActions, CardContent, Divider, Typography } from '@mui/material';
import MuiNextLink from '@common/MuiNextLink';
import PropTypes from 'prop-types';

function CommonCard(props) {
    const { title, description, path, buttonName } = props;

    return (
        <Box>
            <Card >
                <CardContent >
                    <Typography color="textSecondary" gutterBottom>
                        {title}
                    </Typography>
                    <Divider />
                    <Typography>
                        {description}
                    </Typography>


                </CardContent>
                <CardActions style={{ alignItems: 'center', justifyContent: 'center' }}  >
                    <MuiNextLink activeClassName="active" href={path}>
                        <Button variant="outlined" size="medium"  >{buttonName}</Button>
                    </MuiNextLink>
                </CardActions>
            </Card>
        </Box>
    );
}
CommonCard.defaultProps = {
    title: '',
    description: '',
    path: '/',
    buttonName: '',
};

CommonCard.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    path: PropTypes.string,
    buttonName: PropTypes.string,
};

export default CommonCard;
