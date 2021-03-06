import React, { Component } from 'react';
import classnames from 'classnames';
import emoji from '../../utils/emoji/emoji';

import './LabelsListItem.less';

export class LabelsListItem extends Component {
    constructor(props) {
        super(props);

        this.deleteItem = (item) => {
            const { onDelete } = this.props;
            if (onDelete) {
                onDelete(item);
            }
        };

        this.renderCloseButton = (item, delitable) => {
            if (delitable) {
                return (
                    <span className='labels-list-item__close'
                          onClick={() => this.deleteItem(item)}>
                        <span className='glyphicon glyphicon-remove'></span>
                    </span>
                );
            }
            return null;
        };
    }

    render() {
        const { item, delitable } = this.props;
        const itemClass = classnames({
            label: true,
            'labels-list-item': true,
            'label-primary': true,
            'labels-list-item_delitable': delitable,
        });
        return (
            <li className={itemClass}>
                {emoji(item.name)}
                {this.renderCloseButton(item, delitable)}
            </li>
        );
    }
}

LabelsListItem.propTypes = {
    item: React.PropTypes.object,
    delitable: React.PropTypes.bool,
    onDelete: React.PropTypes.func,
};
