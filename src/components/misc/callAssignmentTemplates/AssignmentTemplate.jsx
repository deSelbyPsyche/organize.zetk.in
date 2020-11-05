import { FormattedMessage as Msg } from 'react-intl';
import React from 'react';
import cx from 'classnames';

import Button from '../Button';


export default class AssignmentTemplate extends React.Component {
    static propTypes = {
        messagePath: React.PropTypes.string,
        type: React.PropTypes.string.isRequired,
        selected: React.PropTypes.bool.isRequired,
        onSelect: React.PropTypes.func,
    };

    render() {
        const type = this.props.type;
        const msgBase = (this.props.messagePath || 'assignmentTemplates') + '.' + type;

        let titleMsg = msgBase + '.title';
        let instructionsMsg = msgBase + '.instructions';
        let classes = cx('AssignmentTemplate', 'AssignmentTemplate-' + type, {
            selected: this.props.selected,
        });

        return (
            <div className={ classes }
                onClick={ this.onSelect.bind(this) }>

                <div className="AssignmentTemplate-header">
                    <div className="AssignmentTemplate-headerCheck"/>
                    <Msg tagName="h2" id={ titleMsg }/>
                </div>

                <div className="AssignmentTemplate-instructions">
                    <Msg tagName="p" id={ instructionsMsg }/>
                </div>
                <div className="AssignmentTemplate-form">
                    { this.props.children }
                </div>
            </div>
        );
    }

    onSelect() {
        if (!this.props.selected && this.props.onSelect) {
            this.props.onSelect(this.props.type);
        }
    }
}
