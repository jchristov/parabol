import {css} from 'aphrodite-local-styles/no-important';
import {cashay} from 'cashay';
import {convertToRaw} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {MenuItem} from 'universal/modules/menu';
import {textOverflow} from 'universal/styles/helpers';
import labels from 'universal/styles/theme/labels';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import addTagToProject from 'universal/utils/draftjs/addTagToProject';
import UpdateProjectMutation from 'universal/mutations/UpdateProjectMutation';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

const statusItems = labels.projectStatus.slugs.slice();

class OutcomeCardStatusMenu extends Component {
  makeAddTagToProject = (tag) => () => {
    const {atmosphere, outcome: {id: projectId}, editorState} = this.props;
    const contentState = editorState.getCurrentContent();
    const newContent = addTagToProject(contentState, tag);
    const rawContentStr = JSON.stringify(convertToRaw(newContent));
    const updatedProject = {
      id: projectId,
      content: rawContentStr
    };
    UpdateProjectMutation(atmosphere, updatedProject);
  };

  deleteOutcome = () => {
    const {onComplete, outcome: {id: projectId}} = this.props;
    const options = {
      variables: {
        projectId
      }
    };
    cashay.mutate('deleteProject', options);
    if (onComplete) {
      onComplete();
    }
  };

  itemFactory = () => {
    const {closePortal, isAgenda, isPrivate, removeContentTag, styles, outcome: {status: outcomeStatus}} = this.props;
    const listItems = statusItems
      .filter((status) => status !== outcomeStatus)
      .map((status) => {
        const {color, icon, label} = labels.projectStatus[status];
        return (
          <MenuItem
            icon={icon}
            iconColor={color}
            key={status}
            label={<div className={css(styles.label)}>{'Move to '}<b style={{color}}>{label}</b></div>}
            onClick={this.handleProjectUpdateFactory(status)}
            closePortal={closePortal}
          />
        );
      });
    listItems.push(isPrivate ?
      (<MenuItem
        hr="before"
        icon="lock"
        key="private"
        label={<div className={css(styles.label)}>{'Remove '}<b>{'#private'}</b></div>}
        onClick={removeContentTag('private')}
        closePortal={closePortal}
      />) :
      (<MenuItem
        hr="before"
        icon="lock"
        key="private"
        label={<div className={css(styles.label)}>{'Set as '}<b>{'#private'}</b></div>}
        onClick={this.makeAddTagToProject('#private')}
        closePortal={closePortal}
      />)
    );
    listItems.push(isAgenda ?
      (<MenuItem
        icon="times"
        key="delete"
        label={<div className={css(styles.label)}>{'Delete this Project'}</div>}
        onClick={this.deleteOutcome}
        closePortal={closePortal}
      />) :
      (<MenuItem
        icon="archive"
        key="archive"
        label={<div className={css(styles.label)}>{'Set as '}<b>{'#archived'}</b></div>}
        onClick={this.makeAddTagToProject('#archived')}
        closePortal={closePortal}
      />));
    return listItems;
  };

  handleProjectUpdateFactory = (newStatus) => () => {
    const {atmosphere, onComplete, outcome} = this.props;
    const {id: projectId, status} = outcome;
    if (newStatus === status) {
      return;
    }
    const updatedProject = {
      id: projectId,
      status: newStatus
    };
    UpdateProjectMutation(atmosphere, updatedProject);
    if (onComplete) {
      onComplete();
    }
  };


  render() {
    return (
      <div>
        {this.itemFactory()}
      </div>
    );
  }
}

OutcomeCardStatusMenu.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  closePortal: PropTypes.func.isRequired,
  editorState: PropTypes.object,
  outcome: PropTypes.object,
  isAgenda: PropTypes.bool,
  isPrivate: PropTypes.bool,
  onComplete: PropTypes.func,
  removeContentTag: PropTypes.func.isRequired,
  styles: PropTypes.object
};

const styleThunk = () => ({
  label: {
    ...textOverflow,
    fontSize: ui.menuItemFontSize,
    lineHeight: ui.menuItemHeight,
    padding: `0 ${ui.menuGutterHorizontal} 0 0`
  }
});

export default withAtmosphere(withStyles(styleThunk)(OutcomeCardStatusMenu));
