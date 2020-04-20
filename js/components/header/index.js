/**
 * Created by abradley on 14/03/2018.
 */

import React, { memo, useContext, forwardRef, useState, useEffect } from 'react';
import {
  Grid,
  makeStyles,
  AppBar,
  Typography,
  ListItem,
  ListItemIcon,
  Divider,
  Drawer,
  ListItemText,
  Avatar,
  Box,
  ButtonGroup,
  LinearProgress
} from '@material-ui/core';
import {
  PowerSettingsNew,
  Input,
  Person,
  Home,
  SupervisorAccount,
  Menu as MenuIcon,
  Work,
  Description
} from '@material-ui/icons';
import { HeaderContext } from './headerContext';
import { Button } from '../common';
import { URLS } from '../routes/constants';
import { useCombinedRefs } from '../../utils/refHelpers';
import { ComputeSize } from '../../utils/computeSize';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';
import { useHistory } from 'react-router-dom';
import { IssueReport } from '../userFeedback/issueReport';
import { IdeaReport } from '../userFeedback/ideaReport';
import { FundersModal } from '../funders/fundersModal';
// eslint-disable-next-line import/extensions
import { version } from '../../../package.json';

const useStyles = makeStyles(theme => ({
  padding: {
    margin: theme.spacing(2)
  },
  headerPadding: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  title: {
    flexGrow: 1
  },
  sponsors: {
    padding: theme.spacing(1)
  },
  appBar: {
    backgroundColor: theme.palette.white
  },
  drawerHeader: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default
  },
  loadingPaper: {
    backgroundColor: theme.palette.background.default,
    zIndex: 1301,
    width: '100%',
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'initial',
    cursor: 'progress'
  },
  loadingProgress: {
    height: 2,
    bottom: -2
  },
  clickableImage: {
    cursor: 'pointer'
  },
  inheritHeight: {
    height: 'inherit',
    paddingBottom: theme.spacing(1)
  }
}));

export default memo(
  forwardRef(({ headerHeight = 0, setHeaderHeight }, ref) => {
    let history = useHistory();
    const classes = useStyles();
    const { isLoading, headerNavbarTitle, setHeaderNavbarTitle, headerButtons } = useContext(HeaderContext);
    const disableUserInteraction = useDisableUserInteraction();

    const [openMenu, setOpenMenu] = useState(false);
    const [openFunders, setOpenFunders] = useState(false);

    const openXchem = () => {
      // window.location.href = 'https://www.diamond.ac.uk/Instruments/Mx/Fragment-Screening.html';
      window.open('https://www.diamond.ac.uk/Instruments/Mx/Fragment-Screening.html', '_blank');
    };

    const openDiamond = () => {
      // window.location.href = 'https://www.diamond.ac.uk/Home.html';
      window.open('https://www.diamond.ac.uk/Home.html', '_blank');
    };

    const openSgc = () => {
      // window.location.href = 'https://www.sgc.ox.ac.uk/';
      window.open('https://www.sgc.ox.ac.uk/', '_blank');
    };

    const openJanssen = () => {
      // window.location.href = 'https://www.janssen.com/';
      window.open('https://www.janssen.com/', '_blank');
    };

    let authListItem;

    let username = null;

    if (DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN') {
      authListItem = (
        <ListItem
          button
          onClick={() => {
            window.location.replace(URLS.login);
          }}
        >
          <ListItemIcon>
            <Input />
          </ListItemIcon>
          <ListItemText primary="Login" />
        </ListItem>
      );
    } else {
      authListItem = (
        <ListItem
          button
          onClick={() => {
            window.location.replace(URLS.logout);
          }}
        >
          <ListItemIcon>
            <PowerSettingsNew />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      );

      username = DJANGO_CONTEXT['username'];
    }

    const prodSite = (
      <Typography variant="body2">
        Please use:
        <a href={URLS.prodLanding} data-toggle="tooltip" title="https://fragalysis.diamond.ac.uk">
          production site
        </a>
      </Typography>
    );

    if (headerNavbarTitle === '') {
      if (document.location.host.startsWith('fragalysis.diamond') !== true) {
        setHeaderNavbarTitle('DEVELOPMENT');
      } else {
        setHeaderNavbarTitle('Home');
      }
    }
    const [forceCompute, setForceCompute] = useState();
    const innerRef = React.useRef();
    const combinedRef = useCombinedRefs(ref, innerRef);
    useEffect(() => {
      if (combinedRef.current) {
        setForceCompute(forceCompute === undefined);
      }
    }, [combinedRef, forceCompute]);

    return (
      <ComputeSize
        componentRef={combinedRef.current}
        height={headerHeight}
        setHeight={setHeaderHeight}
        forceCompute={forceCompute === true}
      >
        <AppBar position="absolute" ref={combinedRef} className={classes.appBar}>
          <Grid container direction="row" justify="space-between" alignItems="center" className={classes.headerPadding}>
            <Grid item>
              <ButtonGroup variant="text" size="small">
                <Button
                  key="menu"
                  onClick={() => {
                    setOpenMenu(true);
                  }}
                  startIcon={<MenuIcon />}
                >
                  Menu
                </Button>
                <Button>
                  <Typography variant="h5" color="textPrimary" onClick={() => history.push(URLS.landing)}>
                    Fragalysis: <b>{headerNavbarTitle}</b>
                  </Typography>
                </Button>
                {headerButtons && headerButtons.map(item => item)}
              </ButtonGroup>
            </Grid>
            <Grid item>
              <Grid container direction="row" justify="flex-start" alignItems="center" spacing={1}>
                <Grid item>
                  <IssueReport />
                </Grid>
                <Grid item>
                  <IdeaReport />
                </Grid>
                <Grid item>
                  <img
                    src={require('../../img/xchemLogo.png')}
                    height="20"
                    className={classes.clickableImage}
                    onClick={openXchem}
                  />
                </Grid>
                <Grid item>
                  <img
                    src={require('../../img/dlsLogo.png')}
                    height="20"
                    className={classes.clickableImage}
                    onClick={openDiamond}
                  />
                </Grid>
                <Grid item>
                  <img
                    src={require('../../img/sgcLogo.png')}
                    height="20"
                    className={classes.clickableImage}
                    onClick={openSgc}
                  />
                </Grid>
                <Grid item>
                  <img
                    src={require('../../img/janssenLogo.png')}
                    height="20"
                    className={classes.clickableImage}
                    onClick={openJanssen}
                  />
                </Grid>
                <Grid item>
                  <Button
                    startIcon={<SupervisorAccount />}
                    variant="text"
                    size="small"
                    onClick={() => setOpenFunders(true)}
                  >
                    Contributors
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {(isLoading === true || disableUserInteraction === true) && (
            <LinearProgress color="secondary" className={classes.loadingProgress} />
          )}
        </AppBar>
        <FundersModal openModal={openFunders} onModalClose={() => setOpenFunders(false)} />
        <Drawer
          anchor="left"
          open={openMenu}
          onClose={() => {
            setOpenMenu(false);
          }}
        >
          <Grid
            container
            direction="column"
            justify="space-between"
            alignItems="center"
            className={classes.inheritHeight}
          >
            <Grid item>
              <Grid container direction="column" justify="center" alignItems="center" className={classes.drawerHeader}>
                <Grid item>
                  <Avatar className={classes.padding}>
                    <Person />
                  </Avatar>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle2">{username}</Typography>
                </Grid>
                <Grid item>{prodSite}</Grid>
              </Grid>

              <Divider />
              <ListItem button onClick={() => history.push(URLS.landing)}>
                <ListItemIcon>
                  <Home />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItem>
              <Divider />

              <ListItem button onClick={() => history.push(URLS.projects)}>
                <ListItemIcon>
                  <Description />
                </ListItemIcon>
                <ListItemText primary="Projects" />
              </ListItem>

              <ListItem button onClick={() => history.push(URLS.management)}>
                <ListItemIcon>
                  <Work />
                </ListItemIcon>
                <ListItemText primary="Management" />
              </ListItem>
              <ListItem button onClick={() => setOpenFunders(true)}>
                <ListItemIcon>
                  <SupervisorAccount />
                </ListItemIcon>
                <ListItemText primary="Contributors" />
              </ListItem>
              <Divider />
              {authListItem}
            </Grid>
            <Grid item>
              <Typography variant="body2">Fragalysis version {version}</Typography>
            </Grid>
          </Grid>
        </Drawer>
        <Box paddingTop={`${headerHeight}px`} width="100%" />
      </ComputeSize>
    );
  })
);
