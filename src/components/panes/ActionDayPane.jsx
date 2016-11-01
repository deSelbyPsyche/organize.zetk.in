import moment from 'moment';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import ActionList from '../lists/ActionList';
import Button from '../misc/Button';
import LoadingIndicator from '../misc/LoadingIndicator';
import PaneBase from './PaneBase';
import { retrieveActions } from '../../actions/action';
import { moveActionParticipant } from '../../actions/participant';


@connect(state => state)
@injectIntl
export default class ActionDayPane extends PaneBase {
    componentDidMount() {
        if (this.props.actions.actionList.items.length == 0) {
            this.props.dispatch(retrieveActions());
        }
    }

    getPaneTitle(data) {
        const formatMessage = this.props.intl.formatMessage;
        const d = moment(this.getParam(0));

        return formatMessage({ id: 'panes.actionDay.title' }, {
            day: d.format('YYYY-MM-DD'),
        });
    }

    renderPaneContent(data) {
        let date = moment(this.getParam(0));
        let actionList = this.props.actions.actionList;

        if (actionList.items) {
            actionList = Object.assign({}, actionList, {
                items: actionList.items.filter(i =>
                    moment(i.data.start_time).isSame(date, 'day'))
            });

            return (
                <ActionList key="actionList" actionList={ actionList }
                    onItemClick={ this.onItemClick.bind(this) }
                    onMoveParticipant={ this.onMoveParticipant.bind(this) }
                    onActionOperation={ this.onActionOperation.bind(this) }/>
            );
        }
        else {
            return <LoadingIndicator/>;
        }
    }

    renderPaneFooter(data) {
        const d = moment(this.getParam(0));
        let dateStr = d.format('YYYY-MM-DD');

        return [
            <Button key="prevButton"
                labelMsg="panes.actionDay.prevButton"
                onClick={ this.onClickPrev.bind(this) }
                className="ActionDayPane-prevButton"/>,
            <div key="dateLabel"
                className="ActionDayPane-dateLabel">
                { dateStr }
            </div>,
            <Button key="nextButton"
                labelMsg="panes.actionDay.nextButton"
                onClick={ this.onClickNext.bind(this) }
                className="ActionDayPane-nextButton"/>,
        ];
    }

    onClickPrev() {
        const curDate = Date.create(this.getParam(0));
        const newDate = curDate.rewind({ days: 1 });
        const dateStr = newDate.format('{yyyy}-{MM}-{dd}');

        this.gotoPane('actionday', dateStr);
    }

    onClickNext() {
        const curDate = Date.create(this.getParam(0));
        const newDate = curDate.advance({ days: 1 });
        const dateStr = newDate.format('{yyyy}-{MM}-{dd}');

        this.gotoPane('actionday', dateStr);
    }

    onMoveParticipant(action, person, oldAction) {
        this.props.dispatch(moveActionParticipant(
            person.id, oldAction.id, action.id));

        if (this.props.participants.moves.length) {
            this.pushPane('moveparticipants');
        }
    }

    onItemClick(actionItem) {
        this.openPane('action', actionItem.data.id);
    }

    onActionOperation(action, operation) {
        if (operation == 'edit') {
            this.openPane('editaction', action.id);
        }
        else if (operation == 'sendreminders') {
            this.openPane('reminder', action.id);
        }
    }
}
