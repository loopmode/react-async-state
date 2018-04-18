import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const groups = {
    default: []
};

export default class AsyncState extends Component {
    static propTypes = {
        successDuration: PropTypes.number,
        errorDuration: PropTypes.number,
        successClass: PropTypes.string,
        successProps: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        errorClass: PropTypes.string,
        errorProps: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        children: PropTypes.element,
        initialPending: PropTypes.bool,
        pendingProp: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        pendingGroupProp: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        group: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.bool]),
        trigger: PropTypes.string,
        // if true, and a promise is resolved, but its payload is of type Error, the promise will be treated as if rejected - the component will indicate failure
        rejectResolvedErrors: PropTypes.bool,
        onPending: PropTypes.func,
        onFinished: PropTypes.func,
        onSuccess: PropTypes.func,
        onSuccessEnd: PropTypes.func,
        onError: PropTypes.func,
        onErrorEnd: PropTypes.func
    };
    static defaultProps = {
        successClass: 'success',
        successProps: {},
        successDuration: 1000,
        errorClass: 'danger',
        errorProps: {},
        errorDuration: 1000,
        pendingProp: ['isPending', 'disabled'],
        pendingGroupProp: ['disabled'],
        trigger: 'onClick',
        rejectResolvedErrors: true
    };
    get child() {
        return React.Children.only(this.props.children);
    }
    state = {
        isPending: this.props.initialPending,
        isPendingGroup: false,
        indicateSuccess: false,
        indicateError: false
    };
    componentDidMount() {
        this._isMounted = true;
        if (this.props.group) {
            this.registerGroup(this.props.group);
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.group !== this.props.group) {
            this.unregisterGroup(this.props.group);
            this.registerGroup(nextProps.group);
        }
    }
    componentWillUnmount() {
        this._isMounted = false;
        this.clearTimeouts();
        if (this.props.group) {
            this.unregisterGroup(this.props.group);
        }
    }
    setState(nextState) {
        this._isMounted && super.setState(nextState);
    }
    render() {
        return React.cloneElement(this.child, this.createChildProps(this.child));
    }
    createChildProps() {
        const { successClass, successProps, errorClass, errorProps, trigger } = this.props;
        const { ...childProps } = this.child.props;
        const { indicateSuccess, indicateError } = this.state;
        if (childProps[trigger]) {
            childProps[trigger] = this.handleTrigger;
        }
        const applyPendingProp = (props, value) => {
            if (typeof value === 'string') {
                props[value] = true;
            } else {
                value.forEach(prop => (props[prop] = true));
            }
        };
        if (this.state.isPending) {
            applyPendingProp(childProps, this.props.pendingProp);
        }
        if (this.state.isPendingGroup) {
            applyPendingProp(childProps, this.props.pendingGroupProp);
        }
        childProps.className = cx(
            childProps.className,
            { [successClass]: indicateSuccess },
            { [errorClass]: indicateError }
        );
        if (indicateSuccess && successProps) {
            Object.assign(
                childProps,
                typeof successProps === 'function' ? successProps(this.props, this.state) : successProps
            );
        }
        if (indicateError && errorProps) {
            Object.assign(
                childProps,
                typeof errorProps === 'function' ? errorProps(this.props, this.state) : errorProps
            );
        }

        return childProps;
    }
    getPromise(value) {
        if (value && typeof value.then === 'function') {
            return value;
        }
        return undefined;
    }
    handleTrigger = e => {
        const { trigger } = this.props;
        const callback = this.child.props[trigger];
        const callbackResult = typeof callback === 'function' && callback(e);
        const promise = this.getPromise(callbackResult);
        // console.log('handleTrigger', {callback, callbackResult, promise});
        if (promise) {
            if (this.props.onPending) {
                this.props.onPending();
            }
            const handleResult = result => {
                if (this.props.onSuccess) {
                    this.props.onSuccess(result);
                }
                if (this.props.onFinished) {
                    this.props.onFinished({ result });
                }
                this.setState({
                    isPending: false,
                    indicateSuccess: true,
                    indicateError: false
                });
                this.setGroupPending(this.props.group, false);
                this._successTimeout = window.setTimeout(() => {
                    this.setState({ indicateSuccess: false });
                    if (this.props.onSuccessEnd) {
                        this.props.onSuccessEnd();
                    }
                }, this.props.successDuration);
            };
            const handleError = error => {
                if (this.props.onError) {
                    this.props.onError(error);
                }
                if (this.props.onFinished) {
                    this.props.onFinished({ error });
                }
                this.setState({
                    isPending: false,
                    indicateError: true,
                    indicateSuccess: false
                });
                this.setGroupPending(this.props.group, false);
                this._errorTimeout = window.setTimeout(() => {
                    this.setState({ indicateError: false });
                    if (this.props.onErrorEnd) {
                        this.props.onErrorEnd();
                    }
                }, this.props.errorDuration);
            };

            this.clearTimeouts();
            this.setState({ isPending: true });
            if (this.props.group) {
                this.setGroupPending(this.props.group, true);
            }
            promise.catch(handleError);
            promise.then(result => {
                if (this.props.rejectResolvedErrors && result instanceof Error) {
                    return handleError(result);
                }
                return handleResult(result);
            });
        }
        return callbackResult;
    };

    //-----------------------------------
    //
    // GROUP HANDLING
    //
    //-----------------------------------

    clearTimeouts = () => {
        window.clearTimeout(this._successTimeout);
        window.clearTimeout(this._errorTimeout);
    };
    getGroupName(group) {
        switch (typeof group) {
            case 'boolean':
                return 'default';
            case 'string':
                return group;
            case 'function':
                return this.getGroupName(group(this));
        }
    }
    registerGroup(group) {
        if (group) {
            const groupName = this.getGroupName(group);
            groups[groupName] = [...(groups[groupName] || []), this];
        }
    }
    unregisterGroup(group) {
        if (group) {
            const groupName = this.getGroupName(group);
            groups[groupName] = (groups[groupName] || []).filter(component => component !== this);
        }
    }
    setGroupPending(group, isPendingGroup) {
        const groupName = this.getGroupName(group);
        const groupMembers = groups[groupName];
        // console.info('setGroupPending', {groupName, groupMembers});
        if (groupMembers) {
            groupMembers.filter(component => component !== this).forEach(component => {
                // console.info('setGroupPending', {component, isPendingGroup});
                component.setState({ isPendingGroup });
            });
        }
    }
}
