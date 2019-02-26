import React from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';
import { DropTarget } from 'react-dnd';
import { FormattedMessage as Msg } from 'react-intl';

import DraggableAvatar from './DraggableAvatar';
import Link from './Link';
import LoadingIndicator from './LoadingIndicator';
import Person from './elements/Person';
import RelSelectInput from '../forms/inputs/RelSelectInput';
import { getListItemById } from '../../utils/store';
import {
    beginSearch,
    clearSearch,
    resetSearchQuery,
    search,
} from '../../actions/search';

const contactTarget = {
    canDrop(props, monitor) {
        return !props.preventChange;
    },

    drop(props) {
        return {
            targetType: 'person',
            onDropPerson: person => {
                if (props.onSelect) {
                    props.onSelect(person);
                }
            }
        }
    }
};

const collectPerson = (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isPersonOver: monitor.isOver(),
    canDropPerson: monitor.canDrop()
});

const mapStateToProps = state => ({
    searchStore: state.search.pane
});


@connect(mapStateToProps)
@DropTarget('person', contactTarget, collectPerson)
export default class PersonSelectWidget extends React.Component {
    static propTypes = {
        onSelect: React.PropTypes.func,
        person: React.PropTypes.object,
        searchStore: React.PropTypes.object,
        preventChange: React.PropTypes.bool,
        isPending: React.PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this.state = {
            forceShowInput: false,
        };
    }

    render() {
        let content = [];
        let classes = cx('PersonSelectWidget', {
            selected: !!this.props.person,
            selecting: !this.props.person,
            draggingOver: this.props.isPersonOver,
            preventChange: this.props.preventChange,
            changing: this.state.forceShowInput,
            pending: this.props.isPending,
        });

        if (this.props.person) {
            content.push(
                <DraggableAvatar key="avatar"
                    person={ this.props.person }
                    />,
            );
        }

        if (this.state.forceShowInput || !this.props.person) {
            let searchStore = this.props.searchStore;
            let people = searchStore.results? searchStore.results.map(i => i.data) : [];

            content.push(
                <RelSelectInput key="input" name="person"
                    labelFunc={ p => p.first_name + ' ' + p.last_name }
                    minFilterLength={ 2 }
                    onFocus={ this.onFocus.bind(this) }
                    onBlur={ this.onBlur.bind(this) }
                    onValueChange={ this.onInputChange.bind(this) }
                    onQueryChange={ this.onQueryChange.bind(this) }
                    showCreateOption={ false }
                    objects={ people }
                    />
            );

            if (this.state.forceShowInput) {
                content.push(
                    <p key="instructions"
                        className="PersonSelectWidget-instructions">
                        <Link msgId="misc.personSelectWidget.undoLink"
                            onClick={ this.onUndoLinkClick.bind(this) }
                            />
                    </p>
                );
            }
            else {
                content.push(
                    <p key="instructions"
                        className="PersonSelectWidget-instructions">
                        <Msg id="misc.personSelectWidget.selectInstructions"
                            />
                    </p>
                );
            }
        }
        else {
            let selectLink = (
                <Link msgId="misc.personSelectWidget.selectLink"
                    onClick={ this.onSelectLinkClick.bind(this) }
                    />
            );

            let changeInstructions = null;
            if (!this.props.preventChange) {
                changeInstructions = (
                    <p key="instructions"
                        className="PersonSelectWidget-instructions">
                        <Msg id="misc.personSelectWidget.changeInstructions"
                            values={{ selectLink }}
                            />
                    </p>
                );
            }

            content.push(
                <Person key="name"
                    person={ this.props.person }
                    />,
                changeInstructions,
                <a key="clearLink"
                    className="PersonSelectWidget-clearLink"
                    onClick={ this.onClearLinkClick.bind(this) }>
                    <i className="fa fa-remove"></i>
                </a>
            );
        }

        if (this.props.isPending) {
            content = (
                <LoadingIndicator/>
            );
        }

        return this.props.connectDropTarget(
            <div className={ classes }>
                { content }
            </div>
        );
    }

    onInputChange(name, value) {
        let item = this.props.searchStore.results.find(i => i.data && i.data.id.toString() == value);

        if (item) {
            this.setState({
                forceShowInput: false,
            }, () => {
                if (this.props.onSelect) {
                    this.props.onSelect(item.data)
                }
            });
        }
    }

    onFocus(ev) {
        let searchStore = this.props.searchStore;
        if (!searchStore.isActive) {
            this.props.dispatch(beginSearch("pane", ["person"]));
        }
    }

    onQueryChange(query) {
        if(query){
            this.props.dispatch(search("pane", query));
        }
        else {
            this.props.dispatch(resetSearchQuery("pane"));
        }
    }

    onBlur(ev) {
        setTimeout(() => {
            this.props.dispatch(clearSearch("pane"));
        }, 350);
    }

    onSelectLinkClick() {
        this.setState({
            forceShowInput: true
        });
    }

    onClearLinkClick() {
        if (this.props.onSelect) {
            this.props.onSelect(null);
        }
    }

    onUndoLinkClick() {
        this.setState({
            forceShowInput: false,
        });
    }
}
