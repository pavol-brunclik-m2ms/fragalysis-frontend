import React, { memo, useEffect, useState } from 'react';
import Modal from '../../common/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { groupBy } from 'lodash';
import { setProjectModalOpen } from '../redux/actions';
import {
  makeStyles,
  Radio,
  Grid,
  Typography,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  FormControlLabel,
  ListItemText
} from '@material-ui/core';
import { Title, Description, Label, Link } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
import { useHistory } from 'react-router-dom';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { InputFieldAvatar } from './inputFieldAvatar';
import { ProjectCreationType, SnapshotProjectType } from '../redux/constants';
import { Formik, Form } from 'formik';
import { TextField, Select, RadioGroup } from 'formik-material-ui';
import { Button } from '../../common/Inputs/Button';
import { getListOfSnapshots } from '../../snapshot/redux/dispatchActions';
import moment from 'moment';
import { createProjectFromScratch, createProjectFromSnapshot } from '../redux/dispatchActions';

const useStyles = makeStyles(theme => ({
  body: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  input: {
    width: 400
  },
  margin: {
    margin: theme.spacing(1)
  },
  formControl: {
    margin: theme.spacing(1),
    width: 400
  }
}));

export const ProjectModal = memo(({}) => {
  const classes = useStyles();
  const [state, setState] = useState();
  let history = useHistory();

  const dispatch = useDispatch();
  const isProjectModalOpen = useSelector(state => state.projectReducers.isProjectModalOpen);
  const isProjectModalLoading = useSelector(state => state.projectReducers.isProjectModalLoading);
  const listOfProjects = useSelector(state => state.projectReducers.listOfProjects);
  const isLoadingListOfSnapshots = useSelector(state => state.snapshotReducers.isLoadingListOfSnapshots);
  const grouppedListOfSnapshots = groupBy(
    useSelector(state => state.snapshotReducers.listOfSnapshots),
    'session_project.id'
  );
  const targetList = useSelector(state => state.apiReducers.target_id_list);

  const handleCloseModal = () => {
    if (isProjectModalLoading === false) {
      dispatch(setProjectModalOpen(false));
    }
  };

  const [tags, setTags] = React.useState([]);

  useEffect(() => {
    dispatch(getListOfSnapshots());
  }, [dispatch]);

  const getProjectTitle = projectID => {
    if (projectID === 'undefined') {
      return SnapshotProjectType.NOT_ASSIGNED;
    }
    const project = listOfProjects.find(item => `${item.id}` === projectID);
    return project && `${project.title} - ${project.description}`;
  };

  return (
    <Modal open={isProjectModalOpen} onClose={handleCloseModal}>
      <Typography variant="h3">Create project</Typography>
      <Formik
        initialValues={{
          type: ProjectCreationType.NEW,
          title: '',
          description: '',
          targetId: '',
          parentSnapshotId: '',
          tags: ''
        }}
        validate={values => {
          const errors = {};
          if (!values.title) {
            errors.title = 'Required!';
          }
          if (!values.description) {
            errors.description = 'Required!';
          }
          if (values.type === ProjectCreationType.NEW && values.targetId === '') {
            errors.targetId = 'Required!';
          }
          if (values.type === ProjectCreationType.FROM_SNAPSHOT && values.parentSnapshotId === '') {
            errors.parentSnapshotId = 'Required!';
          }
          if (values.type === '') {
            errors.type = 'Type of Project is required!';
          }
          return errors;
        }}
        onSubmit={values => {
          const data = {
            title: values.title,
            description: values.description,
            target: values.targetId,
            author: DJANGO_CONTEXT['pk'],
            tags: JSON.stringify(tags)
          };

          // Create from snapshot
          if (values.type === ProjectCreationType.FROM_SNAPSHOT) {
            dispatch(
              createProjectFromSnapshot({
                ...data,
                history,
                parentSnapshotId: values.parentSnapshotId
              })
            )
              .catch(error => {
                setState(() => {
                  throw error;
                });
              })
              .finally(() => {
                handleCloseModal();
              });
          }

          // Create from scratch
          if (values.type === ProjectCreationType.NEW) {
            dispatch(
              createProjectFromScratch({
                ...data,
                history
              })
            )
              .catch(error => {
                setState(() => {
                  throw error;
                });
              })
              .finally(() => {
                handleCloseModal();
              });
          }
        }}
      >
        {({ submitForm, errors, values }) => (
          <Form>
            <Grid container direction="column" className={classes.body}>
              <Grid item>
                <FormControl
                  className={classes.input}
                  error={errors.type !== undefined}
                  required
                  disabled={isProjectModalLoading}
                >
                  <RadioGroup name="type" row>
                    <FormControlLabel
                      value={ProjectCreationType.NEW}
                      control={<Radio disabled={isProjectModalLoading} />}
                      label="New Project"
                      disabled={isProjectModalLoading}
                    />
                    <FormControlLabel
                      value={ProjectCreationType.FROM_SNAPSHOT}
                      control={<Radio disabled={isProjectModalLoading} />}
                      label="From Snapshot"
                      disabled={isProjectModalLoading}
                    />
                  </RadioGroup>
                  {errors.type && <FormHelperText disabled={isProjectModalLoading}>{errors.type}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item>
                <InputFieldAvatar
                  icon={<Title />}
                  field={
                    <TextField
                      className={classes.input}
                      name="title"
                      label="Title"
                      required
                      disabled={isProjectModalLoading}
                    />
                  }
                />
              </Grid>
              <Grid item>
                <InputFieldAvatar
                  icon={<Description />}
                  field={
                    <TextField
                      className={classes.input}
                      name="description"
                      label="Description"
                      required
                      disabled={isProjectModalLoading}
                    />
                  }
                />
              </Grid>
              {values && values.type === ProjectCreationType.NEW && (
                <Grid item>
                  <InputFieldAvatar
                    icon={<Link />}
                    field={
                      <FormControl
                        className={classes.input}
                        error={errors.targetId !== undefined}
                        disabled={isProjectModalLoading}
                      >
                        <InputLabel htmlFor="selected-target" required disabled={isProjectModalLoading}>
                          Target
                        </InputLabel>
                        <Select
                          disabled={isProjectModalLoading}
                          name="targetId"
                          inputProps={{
                            id: 'selected-target'
                          }}
                        >
                          {targetList.map(data => (
                            <MenuItem key={data.id} value={data.id}>
                              {data.title}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText disabled={isProjectModalLoading}>{errors.targetId}</FormHelperText>
                      </FormControl>
                    }
                  />
                </Grid>
              )}
              {values && values.type === ProjectCreationType.FROM_SNAPSHOT && (
                <Grid item>
                  <InputFieldAvatar
                    icon={<Link />}
                    field={
                      <FormControl
                        className={classes.input}
                        error={errors.parentSnapshotId !== undefined}
                        disabled={isLoadingListOfSnapshots}
                      >
                        <InputLabel htmlFor="selected-parent-snapshot-id" required disabled={isLoadingListOfSnapshots}>
                          From Snapshot
                        </InputLabel>
                        <Select
                          disabled={isLoadingListOfSnapshots}
                          name="parentSnapshotId"
                          inputProps={{
                            id: 'selected-parent-snapshot-id'
                          }}
                        >
                          {Object.keys(grouppedListOfSnapshots).map((projectID, index) =>
                            grouppedListOfSnapshots[projectID].map(snapshot => (
                              <MenuItem key={snapshot.id} value={snapshot.id}>
                                <ListItemText
                                  primary={`${snapshot.id} - ${snapshot.title}, ${moment(snapshot.created).format(
                                    'LLL'
                                  )}`}
                                  secondary={getProjectTitle(projectID)}
                                />
                              </MenuItem>
                            ))
                          )}
                        </Select>
                        <FormHelperText disabled={isLoadingListOfSnapshots}>{errors.parentSnapshotId}</FormHelperText>
                      </FormControl>
                    }
                  />
                </Grid>
              )}
              <Grid item>
                <InputFieldAvatar
                  icon={<Label />}
                  field={
                    <Autocomplete
                      multiple
                      freeSolo
                      id="tags-standard"
                      options={tags}
                      getOptionLabel={option => option}
                      onChange={(e, data) => {
                        setTags(data);
                      }}
                      disabled={isProjectModalLoading}
                      renderInput={params => (
                        <TextField
                          {...params}
                          className={classes.input}
                          label="Tags"
                          name="tags"
                          fullWidth
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              setTags([...tags, e.target.value]);
                            }
                          }}
                        />
                      )}
                    />
                  }
                />
              </Grid>
            </Grid>
            <Grid container justify="flex-end" direction="row">
              <Grid item>
                <Button color="secondary" disabled={isProjectModalLoading} onClick={handleCloseModal}>
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button color="primary" onClick={submitForm} loading={isProjectModalLoading}>
                  Create
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Modal>
  );
});
