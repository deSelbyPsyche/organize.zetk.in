import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import PaneBase from './PaneBase';
import LocationTagForm from '../forms/LocationTagForm';
import Button from '../misc/Button';
import { getListItemById } from '../../utils/store';
import {
    retrieveLocationTag,
    updateLocationTag,
} from '../../actions/locationTag';


@connect(state => ({ locationTags: state.locationTags }))
@injectIntl
export default class EditLocationTagPane extends PaneBase {
    componentDidMount() {
        super.componentDidMount();

        let tagId = this.getParam(0);
        this.props.dispatch(retrieveLocationTag(tagId));
    }

    getRenderData() {
        let tagId = this.getParam(0);
        let tagList = this.props.locationTags.tagList;

        return {
            tagItem: getListItemById(tagList, tagId),
        };
    }

    getPaneTitle(data) {
        return this.props.intl
            .formatMessage({ id: 'panes.editLocationTag.title' });
    }

    renderPaneContent(data) {
        if (data.tagItem) {
            let tag = data.tagItem.data;

            return (
                <LocationTagForm ref="form" tag= { tag }
                    onSubmit={ this.onSubmit.bind(this) }/>
            );
        }
        else {
            return null;
        }
    }

    renderPaneFooter(data) {
        return (
            <Button className="EditLocationTagPane-saveButton"
                labelMsg="panes.editLocationTag.saveButton"
                onClick={ this.onSubmit.bind(this) }/>
        );
    }

    onSubmit(ev) {
        ev.preventDefault();

        let tagId = this.getParam(0);
        let values = this.refs.form.getChangedValues();

        this.props.dispatch(updateLocationTag(tagId, values));
        this.closePane();
    }
}
