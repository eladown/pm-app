import React, { Component } from 'react';
import classnames from 'classnames';
import emoji from '../../utils/emoji/emoji';

import './InputMd.less';

export class InputMd extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editMode: false,
            value: props.value || '',
        };

        this.togglePreview = () => {
            this.setState({
                editMode: !this.state.editMode,
            });
        };
    }

    componentWillReceiveProps(nextProps) {
        const { value = '' } = nextProps;
        this.setState({
            value,
        });
    }

    render() {
        const { className = '', name = '', autoComplete = 'off', type = 'text', placeholder } = this.props;
        const dataQa = this.props['data-qa'] ? this.props['data-qa'] : '';
        const editorClass = classnames({
            'input-md-editor': true,
            hidden: !this.state.editMode,
        });
        const contentClass = classnames({
            'input-md-content': true,
            hidden: this.state.editMode,
        });
        return (
            <div className='input-md'
                 data-qa={dataQa}>
                <div className={editorClass}>
                    <div className='input-md-content__preview'
                         onClick={this.togglePreview}
                         data-qa={`${dataQa}__preview`}>
                        <span className='glyphicon glyphicon-eye-open'></span>
                    </div>
                    <input type={type}
                           name={name}
                           value={this.state.value}
                           onChange={(e) => {
                               this.setState({
                                   value: e.target.value,
                               });
                               if (this.props.onChange) {
                                   this.props.onChange(e);
                               }
                           }}
                           className={className}
                           placeholder={placeholder}
                           autoComplete={autoComplete}
                           data-qa={`${dataQa}__input`} />
                </div>
                <div className={contentClass}>
                    <div className='input-md-content__edit'
                         onClick={this.togglePreview}
                         data-qa={`${dataQa}__edit-content`}>
                        <span className='glyphicon glyphicon-pencil'></span>
                    </div>
                    <div className='input-md-content__rendered'
                         data-qa={`${dataQa}__rendered`}>
                        {emoji(this.state.value)}
                    </div>
                </div>
            </div>
        );
    }
}

InputMd.propTypes = {
    className: React.PropTypes.string,
    value: React.PropTypes.string,
    name: React.PropTypes.string,
    type: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    autoComplete: React.PropTypes.string,
    'data-qa': React.PropTypes.string,
    onChange: React.PropTypes.func,
};
